# Work Tracker — containerized Python stdlib server (no external deps)
FROM python:3.12-slim

WORKDIR /app
# App code only (index.html is prebuilt; /assets served from src/)
COPY app/ /app/

# Cloud defaults. Data lives on a mounted persistent disk at /var/data.
# Render provides $PORT at runtime; server.py honors it (falls back to 8787 locally).
ENV WT_HOST=0.0.0.0 \
    WT_DATA_DIR=/var/data

CMD ["python", "server.py"]
