# QuickServe - Production Dockerfile
FROM python:3.13-slim

# Çalışma dizini
WORKDIR /app

# Sistem bağımlılıkları
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıkları
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama dosyaları
COPY . .

# Port (Coolify otomatik atar)
EXPOSE ${PORT:-3000}

# Gunicorn ile başlat
CMD gunicorn app:app --bind 0.0.0.0:${PORT:-3000} --workers 2 --threads 2 --timeout 60
