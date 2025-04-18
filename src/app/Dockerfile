# define an alias for the specific python version used in this file.
FROM docker.io/python:3.12.10-slim-bookworm AS python
# Install uv (Python package manager)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

ARG BUILD_ENVIRONMENT=local
ENV BUILD_ENV=${BUILD_ENVIRONMENT}

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN addgroup --system django \
    && adduser --system --ingroup django django

WORKDIR /app

# Install required system dependencies
RUN apt-get update && apt-get install --no-install-recommends -y \
  # dependencies for building Python packages
  build-essential \
  # psycopg dependencies
  libpq-dev \
  # Translations dependencies
  gettext \
  # cleaning up unused files
  && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
  && rm -rf /var/lib/apt/lists/*

# Tell uv to install the venv somewhere else (so it doesn't sync outside the container and cause issues)
ENV UV_PROJECT_ENVIRONMENT=/venv
# Add uv venv to path
ENV PATH=/venv/bin:$PATH

# Tell uv where to cache installs
ENV UV_CACHE_DIR=/usr/local/bin/uv_cache
# Set link mode to copy so the cache works https://docs.astral.sh/uv/guides/integration/docker/#caching
ENV UV_LINK_MODE=copy

# Install UV dependencies
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/usr/local/bin/uv_cache \
    uv sync --frozen

COPY --chown=django:django ./docker/entrypoint /entrypoint
RUN sed -i 's/\r$//g' /entrypoint
RUN chmod +x /entrypoint

COPY --chown=django:django ./docker/start /start
RUN sed -i 's/\r$//g' /start
RUN chmod +x /start

# copy application code to WORKDIR
COPY . /app

ENTRYPOINT ["/entrypoint"]
