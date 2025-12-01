# backend/database.py
import os
from sqlmodel import SQLModel, create_engine, Session

# 1. Lấy biến môi trường DATABASE_URL (Sẽ được cấu hình trên Render)
database_url = os.environ.get("DATABASE_URL")

# 2. Logic tự động chuyển đổi Engine
if database_url:
    # --- TRƯỜNG HỢP 1: CHẠY TRÊN MẠNG (PRODUCTION) ---
    # Dùng PostgreSQL
    # Fix lỗi tương thích: SQLAlchemy cần 'postgresql://' thay vì 'postgres://'
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    
    connect_args = {} # Postgres không cần check_same_thread
    
    # Tạo engine kết nối tới Cloud Database
    engine = create_engine(database_url, connect_args=connect_args)
    print(f"✅ Connected to Cloud Database (PostgreSQL)")

else:
    # --- TRƯỜNG HỢP 2: CHẠY Ở MÁY (LOCAL) ---
    # Dùng SQLite như cũ
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    sqlite_file_name = os.path.join(BASE_DIR, "database.db")
    database_url = f"sqlite:///{sqlite_file_name}"
    
    connect_args = {"check_same_thread": False}
    
    # Tạo engine kết nối tới File Database cục bộ
    engine = create_engine(database_url, connect_args=connect_args)
    print(f"✅ Connected to Local Database (SQLite)")

# 3. Hàm tạo bảng (chạy khi server khởi động)
def create_db_and_tables():
    # Nó sẽ tìm tất cả class kế thừa SQLModel và tạo bảng tương ứng
    SQLModel.metadata.create_all(engine)

# 4. Dependency để lấy session làm việc với DB
def get_session():
    with Session(engine) as session:
        yield session