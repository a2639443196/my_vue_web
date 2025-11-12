FROM python:3.11-alpine

# 环境变量
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# 安装系统依赖 (Alpine使用apk包管理器，更快更小)
RUN apk add --no-cache \
        postgresql-client \
        curl \
        gcc \
        musl-dev \
        libpq-dev \
        gettext

# 安装 Python 依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 清理构建依赖
RUN apk del gcc musl-dev libpq-dev

# 复制后端代码
COPY . ./

# 确保入口脚本可执行
RUN chmod +x entrypoint.sh

# 收集静态文件
RUN python manage.py collectstatic --noinput

EXPOSE 8000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "wellness_hub.asgi:application"]
