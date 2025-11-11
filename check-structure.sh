#!/bin/bash

echo "=== 检查项目目录结构 ==="
echo "当前目录: $(pwd)"
echo ""

echo "=== 检查根目录文件 ==="
ls -la

echo ""
echo "=== 检查backend目录 ==="
if [ -d "backend" ]; then
    echo "backend目录存在"
    ls -la backend/
    echo ""
    echo "backend/Dockerfile存在: $([ -f "backend/Dockerfile" ] && echo '是' || echo '否')"
    echo "backend/requirements.txt存在: $([ -f "backend/requirements.txt" ] && echo '是' || echo '否')"
else
    echo "backend目录不存在"
fi

echo ""
echo "=== 检查frontend目录 ==="
if [ -d "frontend" ]; then
    echo "frontend目录存在"
    ls -la frontend/
    echo ""
    echo "frontend/Dockerfile存在: $([ -f "frontend/Dockerfile" ] && echo '是' || echo '否')"
    echo "frontend/package.json存在: $([ -f "frontend/package.json" ] && echo '是' || echo '否')"
else
    echo "frontend目录不存在"
fi

echo ""
echo "=== 检查nginx.conf ==="
echo "nginx.conf存在: $([ -f "nginx.conf" ] && echo '是' || echo '否')"
echo "nginx.conf大小: $([ -f "nginx.conf" ] && wc -l < nginx.conf || echo '0') 行"

echo ""
echo "=== 检查docker-compose.yml ==="
echo "docker-compose.yml存在: $([ -f "docker-compose.yml" ] && echo '是' || echo '否')"