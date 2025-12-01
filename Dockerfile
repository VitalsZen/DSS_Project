# Sử dụng Python nhẹ
FROM python:3.10-slim

# Thiết lập thư mục làm việc
WORKDIR /app

# Copy file requirements vào trước để cache
COPY backend/requirements.txt .

# Cài đặt thư viện (Thêm --no-cache-dir để nhẹ)
RUN pip install --no-cache-dir -r requirements.txt

# Copy toàn bộ code backend
COPY backend/ .

# Tạo thư mục temp
RUN mkdir temp_uploads

# Mở cổng 7860 (Cổng mặc định của HuggingFace)
EXPOSE 7860

# Lệnh chạy server
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
