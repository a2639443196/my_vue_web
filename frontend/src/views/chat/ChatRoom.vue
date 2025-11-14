<template>
  <div
      class="chat-page"
      :class="{
        'mobile-layout': shouldUseMobileLayout,
        'safe-area-mobile': hasSafeArea && shouldUseMobileLayout
      }"
    >
    <!-- 固定头部 -->
    <header class="chat-head">
      <div class="head-content">
        <div class="head-row primary">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            class="back-btn"
            @click="$router.back()"
          ></v-btn>
          <span class="status-dot" :class="{ online: isConnected }"></span>
          <span class="title">彦祖聊天室</span>
          <v-spacer></v-spacer>
          <v-btn
            icon="mdi-account-multiple"
            variant="text"
            class="members-btn"
            @click="showMembers = true"
          >
            <v-badge
              :content="onlineUsers.length.toString()"
              :model-value="onlineUsers.length > 0"
              color="primary"
            >
              <v-icon>mdi-account-multiple</v-icon>
            </v-badge>
          </v-btn>
        </div>
        <div class="head-row secondary">
          <span class="user-name">{{ userStore.userDisplayName }}</span>
          <span class="connection-status">{{ isConnected ? '已连接' : '连接中...' }}</span>
        </div>
      </div>
    </header>

    <!-- 消息区域 -->
    <section ref="messageContainer" class="chat-feed">
      <div class="feed-content">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-line', {
            mine: message.userId === currentUserId && !message.isSystem,
            system: message.isSystem
          }]"
        >
          <div v-if="!message.isSystem" class="avatar">
            <v-avatar size="36" color="primary">
              <template v-if="!message.avatar">
                {{ message.username.slice(0, 1).toUpperCase() }}
              </template>
              <img v-else :src="message.avatar" :alt="message.username" />
            </v-avatar>
          </div>
          <div class="bubble">
            <template v-if="message.isSystem">
              <div class="system-text">{{ message.content }}</div>
            </template>
            <template v-else>
              <div class="meta">
                <span class="author">{{ message.username }}</span>
                <span class="time">{{ formatTime(message.createdAt) }}</span>
              </div>
              <div class="content">{{ message.content }}</div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 固定底部输入框 -->
    <footer class="chat-input-bar">
      <div class="input-content">
        <div class="composer">
          <v-textarea
            v-model="draft"
            auto-grow
            max-rows="4"
            rows="1"
            variant="filled"
            placeholder="输入内容开始聊天（Enter 发送，Shift + Enter 换行）"
            @keydown.enter.prevent="handleEnter"
            bg-color="#f8f8f8"
            color="#333333"
            base-color="#333333"
          ></v-textarea>
        </div>
        <v-btn
          color="primary"
          class="send-btn"
          :disabled="!draft.trim()"
          @click="sendMessage"
          icon
        >
          <v-icon>mdi-send</v-icon>
        </v-btn>
      </div>
    </footer>

    <v-dialog v-model="showMembers" max-width="420">
      <v-card>
        <v-card-title class="d-flex align-center justify-space-between">
          <span>在线用户（{{ onlineUsers.length }}）</span>
          <v-btn icon variant="text" @click="showMembers = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="member-list">
          <template v-if="onlineUsers.length">
            <div v-for="user in sortedOnlineUsers" :key="user.id" class="member-item">
              <v-avatar size="36" color="primary">
                <template v-if="!user.avatar">
                  {{ user.username.slice(0, 1).toUpperCase() }}
                </template>
                <img v-else :src="user.avatar" :alt="user.username" />
              </v-avatar>
              <div class="member-meta">
                <div class="name">{{ user.username }}</div>
                <div class="time">{{ formatRelative(user.lastActive) }}</div>
              </div>
            </div>
          </template>
          <div v-else class="empty">暂无其他用户在线</div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useChatStore } from '@/stores/chat'
import { useUserStore } from '@/stores/user'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

const chatStore = useChatStore()
const userStore = useUserStore()
const { messages, onlineUsers, connecting, room } = storeToRefs(chatStore)
const { shouldUseMobileLayout, hasSafeArea } = useDeviceDetection()

const draft = ref('')
const showMembers = ref(false)
const messageContainer = ref<HTMLElement | null>(null)
const currentUserId = computed(() => userStore.user?.id ?? 'guest')
const isConnected = computed(() => !connecting.value && !!room.value)
const sortedOnlineUsers = computed(() =>
  [...onlineUsers.value].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  )
)

const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (messageContainer.value) {
      const container = messageContainer.value
      if (smooth) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        })
      } else {
        container.scrollTop = container.scrollHeight
      }
    }
  })
}

const sendMessage = () => {
  if (!draft.value.trim()) return
  try {
    chatStore.sendMessage(draft.value)
    draft.value = ''
    scrollToBottom()
  } catch (error: any) {
    console.error(error)
  }
}

const handleEnter = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    draft.value += '\n'
    return
  }
  sendMessage()
}

watch(
  () => messages.value.length,
  () => scrollToBottom()
)

onMounted(async () => {
  await chatStore.initialize()
  chatStore.fetchOnlineUsers().catch(() => undefined)
  scrollToBottom()
})

const formatTime = (value: string) => format(new Date(value), 'MM-dd HH:mm')
const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true, locale: zhCN })
</script>

<style scoped>
.chat-page {
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  width: 100%;
}

/* 移动端浏览器 - 减去顶部AppBar的高度 */
.mobile-layout .chat-page {
  height: calc(100vh - 48px);
  height: calc(100dvh - 48px);
}

/* 有安全区域时调整 */
.safe-area-mobile .chat-page {
  height: calc(100vh - 48px - env(safe-area-inset-top));
  height: calc(100dvh - 48px - env(safe-area-inset-top));
}

/* 头部 */
.chat-head {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid #e5e5e7;
  flex-shrink: 0;
}

.head-content {
  padding: 8px 16px;
}

.head-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.head-row.primary {
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  align-items: center;
}

.back-btn,
.members-btn {
  margin: 0;
}

.connection-status {
  font-size: 0.813rem;
  color: #666666;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #9ca3af;
  display: inline-block;
  flex-shrink: 0;
}

.status-dot.online {
  background: #22c55e;
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.8);
}

.title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1d1d1f;
}

.head-row.secondary {
  font-size: 0.875rem;
  color: #666666;
}

.user-name {
  font-weight: 600;
  color: #333333;
}

.online-btn {
  text-transform: none;
  font-weight: 500;
  font-size: 0.875rem;
  color: #333333;
}

/* 消息区域 */
.chat-feed {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #f5f5f7;
  will-change: scroll-position;
}

.feed-content {
  padding: 16px;
  padding-bottom: 32px;
  max-width: 100%;
}

.chat-line {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.75rem;
  margin-bottom: 0.9rem;
  align-items: flex-start;
}

.chat-line.mine .bubble {
  background: #007AFF;
  color: white;
}

.chat-line.mine .meta {
  color: rgba(255, 255, 255, 0.85);
}

.chat-line.mine .content {
  color: white;
  font-size: 16px;
}

.chat-line.mine {
  justify-content: end;
}

.chat-line.mine .bubble {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.14), rgba(99, 102, 241, 0.18));
}

.chat-line.system {
  grid-template-columns: 1fr;
}

.chat-line.system .bubble {
  background: transparent;
  text-align: center;
  box-shadow: none;
  color: #888888;
  font-size: 0.875rem;
}

.bubble {
  background: white;
  border-radius: 18px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 75%;
  word-wrap: break-word;
}

.meta {
  display: flex;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #666666;
  margin-bottom: 0.35rem;
}

.content {
  white-space: pre-wrap;
  color: #333333;
  font-size: 16px;
  line-height: 1.5;
}

/* 底部输入框 */
.chat-input-bar {
  flex-shrink: 0;
  background: #ffffff;
  border-top: 1px solid #e5e5e7;
}

.input-content {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 16px;
}

.composer {
  flex: 1;
  min-height: 44px;
}

.composer :deep(.v-textarea .v-field) {
  border-radius: 22px;
  padding: 8px 16px;
  min-height: 44px;
}

.composer :deep(.v-textarea .v-field__input) {
  padding: 0;
  min-height: auto;
  font-size: 16px;
  color: #333333;
  opacity: 1;
}

.composer :deep(.v-textarea .v-field__input::placeholder) {
  color: #999999;
  opacity: 1;
}

.composer :deep(.v-textarea .v-field__outline) {
  display: none;
}

.send-btn {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  flex-shrink: 0;
}

.member-list {
  max-height: 420px;
  overflow-y: auto;
  padding-top: 1rem;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 0;
}

.member-meta .name {
  font-weight: 600;
}

.member-meta .time {
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.55);
}

.empty {
  text-align: center;
  color: rgba(15, 23, 42, 0.45);
  padding: 1rem 0;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .chat-page {
    background: #ffffff;
  }

  .feed-content {
    padding: 8px;
  }

  .chat-line {
    gap: 8px;
    margin-bottom: 12px;
  }

  .bubble {
    max-width: 80%;
    padding: 8px 12px;
    font-size: 15px;
  }

  .meta {
    font-size: 12px;
    margin-bottom: 4px;
  }

  .content {
    font-size: 15px;
    line-height: 1.4;
  }

  .input-content {
    padding: 6px 8px;
    gap: 6px;
  }

  .composer :deep(.v-textarea .v-field__input) {
    font-size: 16px;
  }

  .title {
    font-size: 1.125rem;
  }

  .head-row.secondary {
    font-size: 0.813rem;
  }

  .head-content {
    padding: 6px 8px;
    padding-top: calc(6px + env(safe-area-inset-top));
  }

  /* 超小屏幕优化 */
  @media (max-width: 375px) {
    .feed-content {
      padding: 6px;
    }

    .input-content {
      padding: 4px 6px;
    }

    .bubble {
      padding: 6px 10px;
    }
  }
}
</style>
