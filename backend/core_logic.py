# backend/core_logic.py
import os
import time
from dotenv import load_dotenv
from typing import List, Dict, Union

# --- Imports ---
from langchain_community.document_loaders import PDFPlumberLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
# VẪN DÙNG HUGGING FACE CHO EMBEDDINGS (Để tránh lỗi API Google khi Embedding)
from langchain_huggingface import HuggingFaceEmbeddings 
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.runnables import RunnablePassthrough
from pydantic import BaseModel, Field

load_dotenv()

# --- DATA MODELS ---
class JobMatchResult(BaseModel):
    personal_info: Dict[str, str] = Field(description="Name, position, experience extracted from CV")
    matching_score: Dict[str, Union[int, str]] = Field(description="Percentage score and explanation")
    requirements_breakdown: Dict[str, str] = Field(description="Ratios for must-have and nice-to-have criteria")
    matched_keywords: List[str] = Field(description="List of matching technical skills")
    radar_chart: Dict[str, int] = Field(description="Scores 1-10 for 5 dimensions")
    # [NEW] Thêm trường lý do chấm điểm
    radar_reasoning: Dict[str, Dict[str, str]] = Field(description="Reasoning in en and vi. Structure: {'Hard Skills': {'en': '...', 'vi': '...'}}")
    bilingual_content: Dict[str, Union[Dict, List]] = Field(description="Assessment content in EN and VI")

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
- Phân loại từng dòng thành "Bắt buộc" (Requirement) hoặc "Ưu tiên" (Nice-to-have) dựa trên từ khóa:
  * Tiếng Anh: "nice to have", "plus", "preferred", "advantage", "desired", "bonus", "optional", "willing to".
  * Tiếng Việt: "ưu tiên", "lợi thế", "điểm cộng", "không bắt buộc", "mong muốn", "nếu có".
  -> Các trường hợp còn lại mặc định là **"Bắt buộc" (Requirement)**.
- Đối chiếu CV: Với mỗi dòng JD, nếu CV có bằng chứng đáp ứng => Tính là 1 điểm (Matched).
- Keyword phát hiện: Trích xuất các từ khóa kỹ thuật (Hard skill) trùng khớp giữa CV và JD.
- Công thức tính % chung: (Tổng số dòng Matched / Tổng số dòng JD) * 100.

BƯỚC 3: ĐÁNH GIÁ SONG NGỮ (ANH & VIỆT)
- Tạo nội dung đánh giá cho các mục: Đánh giá chung, Điểm mạnh, Điểm yếu (Missing skills), Câu hỏi phỏng vấn.
- Nội dung Tiếng Anh viết trước, Tiếng Việt dịch sát nghĩa theo sau.

BƯỚC 4: CHẤM ĐIỂM RADAR (1-10) VÀ GIẢI THÍCH LÝ DO
*Bắt buộc chấm dựa trên Barem sau:*
1. **Hard Skills (Kỹ năng cứng):** 1-4 (Thiếu nhiều), 5-7 (Cơ bản), 8-10 (Đầy đủ/Nâng cao).
2. **Soft Skills (Kỹ năng mềm):** 1-4 (Sơ sài), 5-7 (Có nhắc đến), 8-10 (Có ví dụ cụ thể).
3. **Experience (Kinh nghiệm):** 1-4 (Ít/Trái ngành), 5-7 (Tương đối), 8-10 (Vượt yêu cầu).
4. **Education (Học vấn):** 1-4 (Không liên quan), 5-7 (Đúng ngành), 8-10 (Bằng cấp cao/Chứng chỉ xịn).
5. **Domain Knowledge (Hiểu biết ngành):** 1-4 (Chung chung), 5-7 (Hiểu quy trình), 8-10 (Am hiểu nghiệp vụ sâu).

**OUTPUT FORMAT (BẮT BUỘC JSON):**
Chỉ trả về 1 JSON duy nhất.
LƯU Ý QUAN TRỌNG:
1. Không dùng Markdown (```json ... ```). Trả về raw text.
2. KHÔNG ĐƯỢC có dấu phẩy (,) ở cuối danh sách hoặc object cuối cùng. (NO TRAILING COMMAS).
3. Đảm bảo cấu trúc ngoặc {{}} đóng mở chính xác. 

Cấu trúc như sau:
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
    "radar_reasoning": {{
        "Hard Skills": {{ "en": "English explanation...", "vi": "Giải thích tiếng Việt..." }},
        "Soft Skills": {{ "en": "...", "vi": "..." }},
        "Experience": {{ "en": "...", "vi": "..." }},
        "Education": {{ "en": "...", "vi": "..." }},
        "Domain Knowledge": {{ "en": "...", "vi": "..." }}
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

_llm_instance = None
_embedding_instance = None

def get_llm():
    global _llm_instance
    if _llm_instance is None:
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            print(" LỖI NGHIÊM TRỌNG: Không tìm thấy GOOGLE_API_KEY trong biến môi trường!")
        else:
            print(f" Đã tìm thấy API Key: {api_key[:5]}... (ẩn phần sau)")
            
        # [FIX] Dùng gemini-1.5-flash để ổn định và thông minh hơn
        _llm_instance = ChatGoogleGenerativeAI(
            model="gemini-flash-latest", 
            temperature=0.2,
            google_api_key=api_key
        )
    return _llm_instance

def get_embeddings():
    global _embedding_instance
    if _embedding_instance is None:
        # Dùng Hugging Face (CPU) để không cần Key Google ở bước này
        _embedding_instance = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'},
            encode_kwargs={'normalize_embeddings': True}
        )
    return _embedding_instance

def analyze_cv_logic(file_path: str, jd_text: str):
    if not os.getenv("GOOGLE_API_KEY"):
        return {"error": "Server chưa nhận được GOOGLE_API_KEY. Hãy kiểm tra Settings trên Hugging Face."}

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

    # 2. Vector Store & Chain
    try:
        embeddings = get_embeddings()
        llm = get_llm()

        # Nếu lỗi xảy ra ở dòng này -> Code chưa cập nhật (vẫn dùng Google Embeddings)
        vectorstore = Chroma.from_documents(
            documents=splits,
            embedding=embeddings,
            collection_name=f"cv_analysis_{int(time.time())}",
        )
        retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

        parser = JsonOutputParser(pydantic_object=JobMatchResult)
        prompt = ChatPromptTemplate.from_template(CORE_PROMPT)
        prompt = prompt.partial(format_instructions=parser.get_format_instructions())

        def format_docs(docs):
            return "\n\n".join(d.page_content for d in docs)

        # [FIX] Định nghĩa chain rõ ràng hơn để tránh lỗi "Missing variables"
        chain = (
            {
                "cv_text": retriever | format_docs, 
                "jd_text": RunnablePassthrough() 
            }
            | prompt
            | llm
            | parser
        )

        print(" Đang phân tích với Gemini Flash...")
        result = chain.invoke(jd_text)
        
        vectorstore.delete_collection() 
        return result

    except Exception as e:
        # In lỗi chi tiết ra console server để debug
        print(f" LỖI PHÂN TÍCH: {str(e)}")
        return {"error": f"Lỗi phân tích AI: {str(e)}"}
