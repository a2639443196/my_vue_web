# Wellness Hub - Vue + Django 全栈健康生活管理平台

## 项目简介

Wellness Hub 是一个基于 Vue 3 + Django 的现代化健康生活管理平台，提供多种健康追踪功能、在线聊天室和休闲小游戏。平台支持多端适配（PC/Mobile），响应式设计，为用户提供优秀的使用体验。

## 技术栈

### 后端技术栈
- **框架**: Django 4.2 + Django REST Framework
- **数据库**: SQLite (开发) / PostgreSQL (生产)
- **实时通信**: Django Channels + Redis
- **认证**: JWT (JSON Web Token)
- **API文档**: Django REST Framework
- **任务队列**: Celery + Redis

### 前端技术栈
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite
- **UI框架**: Vuetify 3 + Naive UI
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **样式**: Tailwind CSS
- **图标**: Material Design Icons + Iconify
- **图表**: Chart.js + vue-chartjs
- **实时通信**: Socket.io Client

## 项目结构

```
wellness-hub-vue/
├── backend/                     # Django 后端
│   ├── wellness_hub/          # 主项目配置
│   │   ├── settings.py        # 项目设置
│   │   ├── urls.py           # URL路由
│   │   ├── wsgi.py           # WSGI配置
│   │   └── asgi.py           # ASGI配置 (WebSocket)
│   ├── apps/                  # 应用模块
│   │   ├── authentication/     # 用户认证
│   │   ├── users/             # 用户管理
│   │   ├── activities/        # 活动记录
│   │   ├── games/             # 游戏记录
│   │   └── chat/              # 聊天功能
│   ├── requirements.txt       # Python依赖
│   └── manage.py             # Django管理命令
└── frontend/                   # Vue 前端
    ├── src/
    │   ├── api/              # API 封装
    │   ├── assets/           # 静态资源
    │   ├── components/       # 公共组件
    │   ├── composables/      # 组合式函数
    │   ├── layouts/          # 布局组件
    │   ├── plugins/          # 插件配置
    │   ├── router/           # 路由配置
    │   ├── stores/           # Pinia状态管理
    │   ├── styles/           # 样式文件
    │   ├── types/            # TypeScript类型
    │   ├── utils/            # 工具函数
    │   └── views/            # 页面组件
    ├── public/               # 公共文件
    ├── package.json         # 依赖配置
    ├── vite.config.ts       # Vite配置
    └── tailwind.config.js   # Tailwind配置
```

## 功能特性

### 核心功能
- ✅ 用户注册/登录/退出
- ✅ JWT 认证系统
- ✅ 个人资料管理
- ✅ 密码修改

### 健康追踪
- ✅ 饮水记录与统计
- ✅ 健康记录（排便）
- ✅ 戒烟追踪
- ✅ 摸鱼时间记录
- ✅ 数据可视化图表
- ✅ 活动数据导出

### 社交功能
- ✅ 实时聊天室
- ✅ 在线用户列表
- ✅ WebSocket实时通信
- ✅ 输入状态提示

### 休闲游戏
- ✅ 舒尔特方格
- ✅ 记忆翻牌
- ✅ 反应时间测试
- ✅ 数独游戏
- ✅ 游戏成绩排行

### 多端适配
- ✅ 响应式设计（PC/Tablet/Mobile）
- ✅ 移动端优化
- ✅ 触摸友好的交互
- ✅ PWA 支持

## 快速开始

### 环境要求
- Python 3.8+
- Node.js 16+
- Redis
- PostgreSQL (可选)

### 后端设置

1. 克隆项目
```bash
git clone <repository-url>
cd wellness-hub-vue
```

2. 创建虚拟环境
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

3. 安装依赖
```bash
pip install -r requirements.txt
```

4. 配置环境变量
```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库等信息
```

5. 数据库迁移
```bash
python manage.py makemigrations
python manage.py migrate
```

6. 创建超级用户（可选）
```bash
python manage.py createsuperuser
```

7. 启动开发服务器
```bash
python manage.py runserver
```

### 前端设置

1. 安装依赖
```bash
cd frontend
npm install
```

2. 启动开发服务器
```bash
npm run dev
```

3. 构建生产版本
```bash
npm run build
```

## API 接口

### 认证相关
- `POST /api/auth/register/` - 用户注册
- `POST /api/auth/login/` - 用户登录
- `POST /api/auth/logout/` - 用户退出
- `GET /api/auth/profile/` - 获取用户信息
- `PUT /api/auth/profile/` - 更新用户信息
- `POST /api/auth/change-password/` - 修改密码

### 活动记录
- `GET /api/activities/` - 获取活动列表
- `POST /api/activities/water/` - 添加饮水记录
- `POST /api/activities/bowel/` - 添加健康记录
- `POST /api/activities/smoking/` - 添加戒烟记录
- `POST /api/activities/slack/` - 添加摸鱼记录
- `GET /api/activities/stats/` - 获取统计数据

### 聊天功能
- `GET /api/chat/rooms/` - 获取聊天室列表
- `POST /api/chat/rooms/` - 创建聊天室
- `GET /api/chat/rooms/{id}/messages/` - 获取消息列表
- `POST /api/chat/rooms/{id}/messages/` - 发送消息
- `GET /api/chat/online/` - 获取在线用户

### WebSocket 连接
- `ws://localhost:8000/ws/chat/` - 聊天WebSocket
- `ws://localhost:8000/ws/online/` - 在线用户WebSocket

## 开发指南

### 添加新功能模块

1. **后端添加应用**
```bash
python manage.py startapp newapp
```

2. **创建模型** (models.py)
3. **创建序列化器** (serializers.py)
4. **创建视图** (views.py)
5. **配置URL** (urls.py)

### 前端添加新页面

1. **创建页面组件** (views/NewPage.vue)
2. **配置路由** (router/index.ts)
3. **添加状态管理** (stores/newStore.ts)
4. **创建API调用** (api/newApi.ts)

### 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 规则
- 组件使用 Composition API
- 使用 Pinia 管理状态
- 保持代码注释清晰

## 部署

### Docker 部署

1. 构建镜像
```bash
docker-compose build
```

2. 启动服务
```bash
docker-compose up -d
```

### 生产环境

1. 收集静态文件
```bash
python manage.py collectstatic
```

2. 使用 Gunicorn + Nginx
```bash
gunicorn wellness_hub.wsgi:application
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 联系方式

- 邮箱: your-email@example.com
- 项目地址: https://github.com/yourusername/wellness-hub-vue

## 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✨ 完成基础功能
- 📱 支持多端适配
- 🚀 性能优化

---

感谢使用 Wellness Hub！如果觉得项目有用，请给个 ⭐ Star！