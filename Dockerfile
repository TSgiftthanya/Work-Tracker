# Work Tracker — containerized Python stdlib server (no external deps)
FROM python:3.12-slim

WORKDIR /app
# App code only (index.html is prebuilt; /assets served from src/)
COPY app/ /app/

# Default data dir = /app/data (writable; EPHEMERAL on free tier).
# For paid tier with a persistent disk, override WT_DATA_DIR=/var/data via render.yaml.
# Render provides $PORT at runtime; server.py honors it (falls back to 8787 locally).
ENV WT_HOST=0.0.0.0 \
    WT_DATA_DIR=/app/data

CMD ["python", "server.py"]
