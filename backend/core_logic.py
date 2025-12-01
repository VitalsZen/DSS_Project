# backend/core_logic.py
import os
import time
import shutil
from dotenv import load_dotenv
from typing import List, Dict, Union

# --- LangChain Modern Imports ---
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma  # New package
from langchain_huggingface import HuggingFaceEmbeddings # New package
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel, Field

# Load biến môi trường
load_dotenv()

# --- DATA MODELS (Pydantic v2) ---
class JobMatchResult(BaseModel):
    personal_info: Dict[str, str] = Field(description="Name, position, experience extracted from CV")
    matching_score: Dict[str, Union[int, str]] = Field(description="Percentage score and explanation")
    requirements_breakdown: Dict[str, str] = Field(description="Ratios for must-have and nice-to-have criteria")
    matched_keywords: List[str] = Field(description="List of matching technical skills")
    radar_chart: Dict[str, int] = Field(description="Scores 1-10 for 5 dimensions")
    bilingual_content: Dict[str, Union[Dict, List]] = Field(description="Assessment content in EN and VI")

# --- PROMPT (Giữ nguyên logic cũ) ---
CORE_PROMPT = """
Bạn là một Trợ lý Tuyển dụng AI chuyên nghiệp (JobMatchr). Nhiệm vụ của bạn là phân tích CV (được cung cấp dưới dạng text) và Mô tả công việc (JD - mỗi dòng là một yêu cầu).

**INPUT DATA:**
1. CV Text: {cv_text}
2. JD Text: {jd_text} (Lưu ý: Mỗi dòng trong JD là một tiêu chí riêng biệt).

**NHIỆM VỤ:**
Hãy thực hiện các bước sau một cách logic:

BƯỚC 1: TRÍCH XUẤT THÔNG TIN CÁ NHÂN
- Tìm Name, Position (Vị trí ứng tuyển/hiện tại), Experience (Tổng số năm kinh nghiệm - chỉ lấy số).

BƯỚC 2: PHÂN TÍCH JD VÀ TÍNH ĐIỂM (QUY TẮC "1 ĐỀU")
- Tách JD thành các dòng riêng biệt. Tổng số dòng = Tổng yêu cầu (Total_Req).
- Phân loại từng dòng thành "Bắt buộc" (Requirement) hoặc "Ưu tiên" (Nice-to-have) dựa trên từ khóa (nếu không rõ, mặc định là Bắt buộc).
- Đối chiếu CV: Với mỗi dòng JD, nếu CV có bằng chứng đáp ứng => Tính là 1 điểm (Matched).
- Keyword phát hiện: Trích xuất các từ khóa kỹ thuật (Hard skill) trùng khớp giữa CV và JD.
- Công thức tính % chung: (Tổng số dòng Matched / Tổng số dòng JD) * 100.

BƯỚC 3: ĐÁNH GIÁ SONG NGỮ (ANH & VIỆT)
- Tạo nội dung đánh giá cho các mục: Đánh giá chung, Điểm mạnh, Điểm yếu (Missing skills), Câu hỏi phỏng vấn.
- Nội dung Tiếng Anh viết trước, Tiếng Việt dịch sát nghĩa theo sau.

BƯỚC 4: CHẤM ĐIỂM RADAR CHART (Thang 1-10)
- Đánh giá 5 khía cạnh: Hard Skills, Soft Skills, Experience, Education, Domain Knowledge.

**OUTPUT FORMAT (BẮT BUỘC JSON):**
Chỉ trả về 1 JSON duy nhất, không có markdown, không có lời dẫn. Cấu trúc như sau:
{{
    "personal_info": {{
        "name": "String",
        "position": "String (Single title only, e.g., 'Backend Developer')",
        "experience": "String (Single value only, e.g., '2 years')"
    }},
    "matching_score": {{
        "percentage": Integer,
        "explanation": "String (e.g., 'Matched 8/10 requirements')"
    }},
    "requirements_breakdown": {{
        "must_have_ratio": "String (e.g., '5/7')",
        "nice_to_have_ratio": "String (e.g., '3/3')"
    }},
    "matched_keywords": ["String", "String", ...],
    "radar_chart": {{
        "Hard Skills": Integer,
        "Soft Skills": Integer,
        "Experience": Integer,
        "Education": Integer,
        "Domain Knowledge": Integer
    }},
    "bilingual_content": {{
        "general_assessment": {{
            "en": "String",
            "vi": "String"
        }},
        "comparison_table": [
            {{
                "jd_requirement": "String (Original JD line)",
                "cv_evidence": "String (Evidence from CV or 'Not found')",
                "status": "Matched/Not Matched"
            }}
        ],
        "strengths": {{
            "en": ["String", "String"],
            "vi": ["String", "String"]
        }},
        "weaknesses_missing_skills": {{
            "en": ["String", "String"],
            "vi": ["String", "String"]
        }},
        "interview_questions": {{
            "en": ["String", "String"],
            "vi": ["String", "String"]
        }}
    }}
}}
"""

# --- KHỞI TẠO RESOURCES (Lazy loading tốt hơn cho Server) ---
def get_llm():
    # Sử dụng gemini-1.5-flash vì nhanh và rẻ hơn cho tác vụ đọc văn bản
    return ChatGoogleGenerativeAI(
        model="gemini-flash-latest", 
        temperature=0.2,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

def get_embeddings():
    # Sử dụng device='cpu' để đảm bảo chạy được trên mọi server thường
    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2",
        model_kwargs={'device': 'cpu'},
        encode_kwargs={'normalize_embeddings': True}
    )

def analyze_cv_logic(file_path: str, jd_text: str):
    """
    Xử lý logic chính: Đọc PDF -> Vector Store -> LLM -> JSON
    """
    llm = get_llm()
    embeddings = get_embeddings()

    if not os.getenv("GOOGLE_API_KEY"):
        return {"error": "GOOGLE_API_KEY not found in .env"}

    # 1. Xử lý PDF
    try:
        loader = PDFPlumberLoader(file_path)
        docs = loader.load()
        if not docs:
            return {"error": "Không thể đọc nội dung từ file PDF."}
            
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
    except Exception as e:
        return {"error": f"Lỗi đọc PDF: {str(e)}"}

    # 2. Vector Store (In-Memory cho mỗi Request để tránh rác ổ cứng)
    # Với Python 3.13 và LangChain mới, ta không cần persist xuống đĩa cho tác vụ này
    try:
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            collection_name=f"cv_analysis_{int(time.time())}",
            # Không set persist_directory để chạy in-memory (nhanh hơn và tự hủy khi xong)
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
    except Exception as e:
        return {"error": f"Lỗi khởi tạo Vector DB: {str(e)}"}

    # 3. Định nghĩa Chain
    parser = JsonOutputParser(pydantic_object=JobMatchResult)
    
    prompt = ChatPromptTemplate.from_template(CORE_PROMPT)
    
    # Inject format instructions vào prompt
    prompt = prompt.partial(format_instructions=parser.get_format_instructions())

    def format_docs(docs):
        return "\n\n".join(d.page_content for d in docs)

    chain = (
        {"cv_text": retriever | format_docs, "jd_text": RunnablePassthrough()}
        | prompt
        | llm
        | parser
    )

    # 4. Chạy và trả về kết quả
    try:
        print("🤖 Đang phân tích với Gemini 1.5 Flash...")
        result = chain.invoke(jd_text)
        
        # Cleanup thủ công nếu cần (dù in-memory sẽ tự giải phóng)
        vectorstore.delete_collection() 
        
        return result
    except Exception as e:
        return {"error": f"Lỗi phân tích AI: {str(e)}"}