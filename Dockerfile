# ================================
# Stage 1: Builder
# ================================
FROM python:3.9-slim-bullseye as builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt

# ================================
# Stage 2: Runtime (Production)
# ================================
FROM python:3.9-slim-bullseye

LABEL maintainer="PGD Website" version="1.0" description="PGD Website - B2B Export Platform"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install tini for process management
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    tini \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Create directories BEFORE copying code to optimize build caching
RUN mkdir -p instance && \
    chown -R appuser:appuser /app

COPY --from=builder /build/wheels /wheels
RUN pip install --no-cache-dir --no-index --find-links /wheels /wheels/* && \
    rm -rf /wheels

# Copy application code (changes frequently, put near the end)
COPY --chown=appuser:appuser . .

USER appuser
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Use Tini as the entrypoint to handle zombie processes
ENTRYPOINT ["/usr/bin/tini", "--"]

# Use Gunicorn for production traffic
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--threads", "4", "app:app"]
