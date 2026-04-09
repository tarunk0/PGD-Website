# ================================
# Stage 1: Builder (Dependency Stage)
# ================================
FROM python:3.9-slim-bullseye as builder

# Set working directory
WORKDIR /build

# Install build dependencies (minimal set)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and build wheels
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt

# ================================
# Stage 2: Runtime (Production Stage)
# ================================
FROM python:3.9-slim-bullseye

# Set metadata labels
LABEL maintainer="PGD Website" \
      version="1.0" \
      description="PGD Website - B2B Export Platform"

# Security: Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install only runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy wheels from builder stage
COPY --from=builder /build/wheels /wheels

# Install wheels
RUN pip install --no-cache-dir --no-index --find-links /wheels /wheels/* && \
    rm -rf /wheels

# Copy application code
COPY --chown=appuser:appuser . .

# Create instance directory for database (with proper permissions)
RUN mkdir -p instance && chown appuser:appuser instance

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/ || exit 1

# Use exec form for proper signal handling
CMD ["python", "app.py"]