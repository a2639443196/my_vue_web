FROM node:18-alpine

WORKDIR /app

# 拷贝依赖文件并安装全部依赖（包括 devDependencies）
COPY frontend/package*.json ./
RUN npm install

# 拷贝前端源码
COPY frontend/ ./

EXPOSE 5173

# 开发模式启动，支持热重载
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
