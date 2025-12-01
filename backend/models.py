# backend/models.py
from typing import Optional
from datetime import datetime
from sqlmodel import Field, SQLModel

class JobDescription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    company: Optional[str] = None
    content: str
    # Tự động lấy giờ hiện tại khi tạo
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)

class JobDescriptionUpdate(SQLModel):
    title: Optional[str] = None
    company: Optional[str] = None
    content: Optional[str] = None

class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    job_title: str
    company_name: str 
    status: str = Field(default="new")
    match_score: int = Field(default=0)
    jd_content: Optional[str] = Field(default=None) 
    analysis_result: Optional[str] = Field(default=None) 
    created_at: datetime = Field(default_factory=datetime.now)