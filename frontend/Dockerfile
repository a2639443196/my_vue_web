# ===== Build stage =====
FROM node:18-alpine AS build-stage

WORKDIR /app

# 拷贝依赖文件并安装全部依赖（包括 devDependencies）
COPY frontend/package*.json ./
RUN npm install

# 拷贝前端源码并构建
COPY frontend/ ./
RUN npm run build

# ===== Production stage =====
FROM nginx:alpine AS production-stage

# 拷贝构建结果到 nginx 默认站点目录
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 拷贝 nginx 配置（如果有）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
