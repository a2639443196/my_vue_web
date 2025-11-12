<template>
  <div class="chat-room">
    <v-card elevation="6" class="chat-card">
      <v-row no-gutters>
        <v-col cols="12" md="8" class="chat-main">
          <header class="chat-header">
            <div>
              <h2>彦祖聊天室</h2>
              <p>与在线伙伴实时互动，分享你的喝水、训练和日常灵感。</p>
            </div>
            <v-btn color="primary" variant="flat" class="ml-auto" @click="sendQuickMessage">
              <v-icon start>mdi-send</v-icon>
              快速问候
            </v-btn>
          </header>

          <div ref="messageContainer" class="chat-messages">
            <div v-for="message in chatStore.orderedMessages" :key="message.id" :class="['message', { system: message.isSystem, mine: message.authorId === currentUserId }]">
              <div class="avatar" v-if="!message.isSystem">
                <v-avatar size="32" color="primary">
                  <span>{{ message.authorName.slice(0, 1).toUpperCase() }}</span>
                </v-avatar>
              </div>
              <div class="bubble">
                <div class="meta">
                  <span class="author">{{ message.isSystem ? '系统提示' : message.authorName }}</span>
                  <span class="time">{{ formatTime(message.createdAt) }}</span>
                </div>
                <div class="content">{{ message.content }}</div>
              </div>
            </div>
          </div>

          <div class="chat-input">
            <v-textarea
              v-model="message"
              auto-grow
              max-rows="3"
              rows="1"
              variant="outlined"
              placeholder="输入内容开始聊天（按 Ctrl + Enter 发送）"
              @keydown.enter.prevent="handleEnter"
            ></v-textarea>
            <div class="chat-actions">
              <v-btn color="primary" :disabled="!message.trim()" @click="send">
                <v-icon start>mdi-send</v-icon>
                发送
              </v-btn>
            </div>
          </div>
        </v-col>

        <v-col cols="12" md="4" class="chat-sidebar">
          <div class="sidebar-section">
            <h3>在线用户</h3>
            <p class="subtitle">实时统计当前在线与最近活跃成员。</p>
            <div class="online-list" v-if="onlineUsers.length">
              <div v-for="user in onlineUsers" :key="user.id" class="online-item">
                <v-avatar size="40" color="primary" class="mr-3">
                  <span>{{ user.name.slice(0, 1).toUpperCase() }}</span>
                </v-avatar>
                <div>
                  <div class="name">{{ user.name }}</div>
                  <div class="last-active">{{ formatRelative(user.lastActive) }}</div>
                </div>
              </div>
            </div>
            <div v-else class="empty">当前只有你在线，发送一条消息激活社区吧。</div>
          </div>

          <div class="sidebar-section">
            <h3>聊天室小贴士</h3>
            <ul class="tips">
              <li>向大家汇报今日饮水或训练成果，共同监督。</li>
              <li>随时可以在个人主页配置新的外链导航卡片。</li>
              <li>刷新页面不会丢失消息，数据保存在浏览器本地。</li>
            </ul>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { format, formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()

const message = ref('')
const messageContainer = ref<HTMLElement | null>(null)

const currentUserId = computed(() => userStore.user?.id ?? 'guest')
const onlineUsers = computed(() => chatStore.onlineUsers)

const send = () => {
  if (!message.value.trim()) return
  chatStore.sendMessage(message.value)
  message.value = ''
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.ctrlKey || event.metaKey) {
    send()
  } else {
    message.value += '\n'
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messageContainer.value) {
      messageContainer.value.scrollTop = messageContainer.value.scrollHeight
    }
  })
}

const sendQuickMessage = () => {
  const templates = ['大家今天喝水多少啦？', '坚持训练，冲刺一下舒尔特成绩～', '记得补水，关心一下身体状态。']
  const text = templates[Math.floor(Math.random() * templates.length)]
  message.value = text
  send()
}

onMounted(() => {
  chatStore.initialize()
  scrollToBottom()
})

onUnmounted(() => {
  chatStore.announcePresence('away')
})

watch(
  () => chatStore.orderedMessages.length,
  () => scrollToBottom()
)

const formatTime = (date: string) => format(new Date(date), 'MM-dd HH:mm')
const formatRelative = (date: string) =>
  formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })
</script>

<style scoped>
.chat-room {
  display: flex;
  justify-content: center;
}

.chat-card {
  width: 100%;
  border-radius: 24px;
  overflow: hidden;
}

.chat-main {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-sidebar {
  padding: 1.5rem;
  background: rgba(99, 102, 241, 0.08);
  display: grid;
  gap: 1.5rem;
}

.chat-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.chat-header h2 {
  margin: 0;
}

.chat-header p {
  margin: 0.4rem 0 0;
  color: rgba(0, 0, 0, 0.55);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  padding: 1rem;
  display: grid;
  gap: 0.75rem;
}

.message {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  align-items: flex-start;
}

.message.mine {
  justify-content: end;
}

.message.mine .bubble {
  background: rgba(79, 70, 229, 0.12);
}

.message.system {
  grid-template-columns: 1fr;
  justify-items: center;
}

.message.system .bubble {
  background: rgba(0, 0, 0, 0.05);
  text-align: center;
}

.bubble {
  background: white;
  border-radius: 16px;
  padding: 0.75rem 1rem;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.5);
  margin-bottom: 0.3rem;
}

.content {
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.5;
  white-space: pre-wrap;
}

.chat-input {
  margin-top: 1.5rem;
  display: grid;
  gap: 0.75rem;
}

.chat-actions {
  display: flex;
  justify-content: flex-end;
}

.sidebar-section {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.sidebar-section h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-section .subtitle {
  margin: 0.4rem 0 1rem;
  color: rgba(0, 0, 0, 0.55);
  font-size: 0.9rem;
}

.online-list {
  display: grid;
  gap: 1rem;
}

.online-item {
  display: flex;
  align-items: center;
}

.online-item .name {
  font-weight: 600;
}

.online-item .last-active {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.45);
}

.tips {
  margin: 0.75rem 0 0;
  padding-left: 1.2rem;
  color: rgba(0, 0, 0, 0.65);
  line-height: 1.6;
}

.empty {
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  padding: 1rem 0;
}

@media (max-width: 960px) {
  .chat-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
