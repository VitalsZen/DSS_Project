# backend/main.py
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from core_logic import run_full_analysis # Import hàm logic của bạn

app = FastAPI()

# Cho phép React gọi API (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Port mặc định của React Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analyze")
async def analyze_cv(
    file: UploadFile = File(...), 
    jd: str = Form(...)
):
    # 1. Lưu file upload tạm thời
    temp_filename = f"temp_{file.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 2. Gọi logic AI cũ của bạn (cần chỉnh sửa hàm run_full_analysis để nhận path thay vì object gradio)
    # Giả sử hàm run_full_analysis trả về JSON
    try:
        # Bạn cần sửa nhẹ hàm run_full_analysis để trả về Dict (JSON) thay vì HTML/Markdown
        result = run_full_analysis(temp_filename, jd, {}) 
        return result
    except Exception as e:
        return {"error": str(e)}
    finally:
        # Xóa file tạm
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)