# QuickServe Backend - Dockerfile for Coolify (Flask)
FROM python:3.11-slim

# Metadata
LABEL maintainer="Merit Royal Diamond Otel"
LABEL description="QuickServe Notification Backend (Flask)"

# Set environment
ENV PYTHONUNBUFFERED=1
ENV FLASK_ENV=production
ENV PORT=3000

# Create app directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY .env* ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3000/health')"

# Non-root user for security
RUN useradd -m -u 1001 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Start application with gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:3000", "--workers", "2", "--threads", "2", "--timeout", "60"]
