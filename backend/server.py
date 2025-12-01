# backend/server.py
import os
import shutil
import uvicorn
import json
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from core_logic import analyze_cv_logic
from database import create_db_and_tables, get_session
from models import JobDescription, Application

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cố gắng tạo bảng, nếu lỗi DB thì vẫn cho Server chạy để không bị Render kill
    try:
        create_db_and_tables()
        print("✅ Database connected and tables created.")
    except Exception as e:
        print(f"⚠️ Database connection warning: {e}")
    yield

app = FastAPI(title="JobMatchr API", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- QUAN TRỌNG: Thêm Endpoint gốc để Render Health Check ---
@app.get("/")
def read_root():
    return {"status": "ok", "message": "CareerFlow Backend is running!"}
# ------------------------------------------------------------

async def get_session_id(x_session_id: str = Header(...)):
    if not x_session_id:
        raise HTTPException(status_code=400, detail="Missing Session ID Header")
    return x_session_id

# --- JD LIBRARY ENDPOINTS ---

@app.get("/api/jds", response_model=List[JobDescription])
def read_jds(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id) # <--- Inject User ID
):
    # Chỉ lấy JD của user này
    statement = select(JobDescription).where(JobDescription.session_id == user_id).order_by(JobDescription.created_at.desc())
    return session.exec(statement).all()

@app.post("/api/jds", response_model=JobDescription)
def create_jd(
    jd: JobDescription, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id) # <--- Inject User ID
):
    now = datetime.now()
    jd.created_at = now
    jd.updated_at = now
    jd.session_id = user_id # <--- Gán Session ID cho bản ghi
    
    session.add(jd)
    session.commit()
    session.refresh(jd)
    return jd

@app.patch("/api/jds/{jd_id}")
def update_jd(
    jd_id: int, 
    payload: dict, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    db_jd = session.get(JobDescription, jd_id)
    # Kiểm tra tồn tại và quyền sở hữu
    if not db_jd or db_jd.session_id != user_id:
        raise HTTPException(status_code=404, detail="JD not found or access denied")
    
    for key, value in payload.items():
        if hasattr(db_jd, key) and value is not None:
            setattr(db_jd, key, value)
    
    db_jd.updated_at = datetime.now()
    session.add(db_jd)
    session.commit()
    session.refresh(db_jd)
    return db_jd

@app.delete("/api/jds/{jd_id}")
def delete_jd(
    jd_id: int, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    jd = session.get(JobDescription, jd_id)
    # Kiểm tra tồn tại và quyền sở hữu
    if not jd or jd.session_id != user_id:
        raise HTTPException(404, detail="JD not found or access denied")
        
    session.delete(jd)
    session.commit()
    return {"ok": True}

# --- APPLICATION ENDPOINTS ---

@app.get("/api/applications", response_model=List[Application])
def read_applications(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    # Chỉ lấy Application của user này
    statement = select(Application).where(Application.session_id == user_id).order_by(Application.created_at.desc())
    return session.exec(statement).all()

@app.post("/api/applications", response_model=Application)
def create_application(
    app: Application, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    app.session_id = user_id # <--- Gán Session ID
    
    if isinstance(app.analysis_result, dict):
        app.analysis_result = json.dumps(app.analysis_result, ensure_ascii=False)
    
    if not app.created_at:
        app.created_at = datetime.now()
        
    session.add(app)
    session.commit()
    session.refresh(app)
    return app

@app.delete("/api/applications/{app_id}")
def delete_application(
    app_id: int, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    app = session.get(Application, app_id)
    if not app or app.session_id != user_id: 
        raise HTTPException(404, detail="Not found or access denied")
        
    session.delete(app)
    session.commit()
    return {"ok": True}

@app.patch("/api/applications/{app_id}")
def update_application(
    app_id: int, 
    payload: dict, 
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id)
):
    app = session.get(Application, app_id)
    if not app or app.session_id != user_id:
        raise HTTPException(404, detail="Not found or access denied")
        
    for key, value in payload.items():
        if hasattr(app, key):
            setattr(app, key, value)
            
    session.add(app)
    session.commit()
    session.refresh(app)
    return app

# --- ANALYZE ENDPOINT ---
@app.post("/api/analyze")
async def analyze_endpoint(
    file: UploadFile = File(...), 
    jd_text: Optional[str] = Form(None),
    jd_id: Optional[int] = Form(None),
    session: Session = Depends(get_session),
    user_id: str = Depends(get_session_id) # Cần ID để check quyền nếu dùng jd_id
):
    final_jd_text = ""
    if jd_id:
        jd_record = session.get(JobDescription, jd_id)
        # Nếu user chọn JD từ thư viện, phải đảm bảo JD đó là của họ
        if not jd_record or jd_record.session_id != user_id:
            raise HTTPException(404, detail="JD ID not found or access denied")
        final_jd_text = jd_record.content
    elif jd_text:
        final_jd_text = jd_text
    else:
        raise HTTPException(400, detail="Must provide jd_text OR jd_id")

    temp_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Hàm logic cũ không cần sửa, chỉ gọi nó ra
        result = analyze_cv_logic(temp_path, final_jd_text)
        
        if "error" in result: raise HTTPException(500, detail=result["error"])
        return result
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
