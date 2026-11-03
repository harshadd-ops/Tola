# Tola demo API. Build context: implementation/demo (see docker-compose.yml).
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
COPY services/api/pyproject.toml ./
COPY services/api/tola_api ./tola_api
RUN pip install --no-cache-dir .
# Seed resolves as ./seed from WORKDIR (repo runs resolve ../../seed). docker-compose also mounts ./seed read-only.
COPY seed ./seed
EXPOSE 8000
# Seeds the SQLite file on first start (idempotent), then serves.
CMD ["sh", "-c", "tola-seed --if-empty && uvicorn tola_api.main:app --host 0.0.0.0 --port 8000"]
