from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid
from sqlmodel import Field, SQLModel, Relationship
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB  # Dùng cái này mới là chuẩn DBA cho Postgres

# Bảng User
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    is_guest: bool = Field(default=True)
    created_at: datetime = Field(default_factory=datetime.now)
    
    # Quan hệ: Một User có nhiều App và JD
    applications: List["Application"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete"})
    jds: List["JobDescription"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete"})

# 2. Bảng JobDescription: Thư viện JD
class JobDescription(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # Khóa ngoại trỏ về User
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    
    title: str
    company: Optional[str] = None
    content: str
    
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = Field(default_factory=datetime.now)
    
    user: Optional[User] = Relationship(back_populates="jds")

class JobDescriptionUpdate(SQLModel):
    title: Optional[str] = None
    company: Optional[str] = None
    content: Optional[str] = None

# 3. Bảng Application
class Application(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    
    job_title: str
    company_name: str 
    status: str = Field(default="new")
    match_score: int = Field(default=0)
    jd_content: Optional[str] = Field(default=None)
    
    # Dùng JSONB để lưu kết quả AI -> Query nhanh hơn text, index được từng key bên trong.
    analysis_result: Dict[str, Any] = Field(default={}, sa_column=Column(JSONB))
    
    created_at: datetime = Field(default_factory=datetime.now)
    
    user: Optional[User] = Relationship(back_populates="applications")
