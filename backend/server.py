# backend/server.py
import os
import shutil
import uvicorn
import json
from contextlib import asynccontextmanager
from typing import List, Optional
from datetime import datetime # <--- QUAN TRỌNG: Phải import như thế này

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from core_logic import analyze_cv_logic
from database import create_db_and_tables, get_session
from models import JobDescription, Application, JobDescriptionUpdate

TEMP_DIR = "temp_uploads"
os.makedirs(TEMP_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="JobMatchr API", version="2.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- JD LIBRARY ENDPOINTS ---

@app.get("/api/jds", response_model=List[JobDescription])
def read_jds(session: Session = Depends(get_session)):
    return session.exec(select(JobDescription).order_by(JobDescription.created_at.desc())).all()

@app.post("/api/jds", response_model=JobDescription)
def create_jd(jd: JobDescription, session: Session = Depends(get_session)):
    # Lấy thời gian thực tế tại thời điểm gọi API
    now = datetime.now()
    
    jd.created_at = now
    jd.updated_at = now
    
    session.add(jd)
    session.commit()
    session.refresh(jd)
    return jd

@app.patch("/api/jds/{jd_id}")
def update_jd(jd_id: int, payload: dict, session: Session = Depends(get_session)):
    db_jd = session.get(JobDescription, jd_id)
    if not db_jd:
        raise HTTPException(status_code=404, detail="JD not found")
    
    # Cập nhật thông tin
    for key, value in payload.items():
        if hasattr(db_jd, key) and value is not None:
            setattr(db_jd, key, value)
    
    # Cập nhật thời gian sửa đổi
    db_jd.updated_at = datetime.now()
    
    session.add(db_jd)
    session.commit()
    session.refresh(db_jd)
    return db_jd

@app.delete("/api/jds/{jd_id}")
def delete_jd(jd_id: int, session: Session = Depends(get_session)):
    jd = session.get(JobDescription, jd_id)
    if not jd: raise HTTPException(404, detail="JD not found")
    session.delete(jd)
    session.commit()
    return {"ok": True}

# --- APPLICATION ENDPOINTS ---

@app.get("/api/applications", response_model=List[Application])
def read_applications(session: Session = Depends(get_session)):
    return session.exec(select(Application).order_by(Application.created_at.desc())).all()

@app.post("/api/applications", response_model=Application)
def create_application(app: Application, session: Session = Depends(get_session)):
    if isinstance(app.analysis_result, dict):
        app.analysis_result = json.dumps(app.analysis_result, ensure_ascii=False)
    
    # Đảm bảo có thời gian tạo
    if not app.created_at:
        app.created_at = datetime.now()
        
    session.add(app)
    session.commit()
    session.refresh(app)
    return app

@app.delete("/api/applications/{app_id}")
def delete_application(app_id: int, session: Session = Depends(get_session)):
    app = session.get(Application, app_id)
    if not app: raise HTTPException(404, detail="Not found")
    session.delete(app)
    session.commit()
    return {"ok": True}

@app.patch("/api/applications/{app_id}")
def update_application(app_id: int, payload: dict, session: Session = Depends(get_session)):
    app = session.get(Application, app_id)
    if not app: raise HTTPException(404, detail="Not found")
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
    session: Session = Depends(get_session)
):
    final_jd_text = ""
    if jd_id:
        jd_record = session.get(JobDescription, jd_id)
        if not jd_record: raise HTTPException(404, detail="JD ID not found")
        final_jd_text = jd_record.content
    elif jd_text:
        final_jd_text = jd_text
    else:
        raise HTTPException(400, detail="Must provide jd_text OR jd_id")

    temp_path = os.path.join(TEMP_DIR, file.filename)
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        result = analyze_cv_logic(temp_path, final_jd_text)
        if "error" in result: raise HTTPException(500, detail=result["error"])
        return result
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)