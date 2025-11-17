<template>
  <div class="chat-container main-content-with-toolbar">
    <!-- 自定义顶部栏 - 替换原有header -->
    <div class="mobile-toolbar chat-toolbar">
      <button class="mobile-toolbar__icon" @click="$router.back()" aria-label="返回">
        <v-icon size="24">mdi-arrow-left</v-icon>
      </button>

      <h1 class="mobile-toolbar__title">彦祖聊天室</h1>

      <div class="flex--gap-2">
        <!-- 连接状态指示器 -->
        <div class="chat-status-indicator">
          <div class="status-dot" :class="{ online: isConnected }"></div>
        </div>

        <!-- 在线用户按钮 -->
        <button
          class="mobile-toolbar__icon"
          @click="showMembers = true"
          aria-label="在线用户"
        >
          <v-badge
            :content="onlineUsers.length.toString()"
            :model-value="onlineUsers.length > 0"
            color="var(--color-primary)"
          >
            <v-icon size="24">mdi-account-multiple</v-icon>
          </v-badge>
        </button>
      </div>
    </div>

    <!-- 用户信息条 -->
    <div class="chat-user-info">
      <span class="text-secondary">{{ userStore.userDisplayName }}</span>
      <span class="text-tertiary">{{ isConnected ? '已连接' : '连接中...' }}</span>
    </div>

    <!-- 消息区域 -->
    <section
      ref="messageContainer"
      class="chat-messages"
      :style="chatFeedStyle"
    >
      <div class="chat-messages__content">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['chat-message', {
            'chat-message--mine': message.userId === currentUserId && !message.isSystem,
            'chat-message--system': message.isSystem
          }]"
        >
          <!-- 头像 -->
          <div v-if="!message.isSystem" class="chat-message__avatar">
            <div class="avatar">
              <template v-if="!message.avatar">
                {{ message.username.slice(0, 1).toUpperCase() }}
              </template>
              <img v-else :src="message.avatar" :alt="message.username" />
            </div>
          </div>

          <!-- 消息气泡 -->
          <div class="chat-message__bubble">
            <template v-if="message.isSystem">
              <div class="chat-message__system-content text-word-break">
                {{ message.content }}
              </div>
            </template>
            <template v-else>
              <div class="chat-message__meta">
                <span class="chat-message__author">{{ message.username }}</span>
                <span class="chat-message__time">{{ formatTime(message.createdAt) }}</span>
              </div>
              <div class="chat-message__content text-word-break">
                {{ message.content }}
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- 底部输入框 -->
    <footer class="chat-input" ref="inputBarRef">
      <div class="chat-input__content">
        <div class="chat-input__field">
          <v-textarea
            v-model="draft"
            auto-grow
            max-rows="4"
            rows="1"
            variant="solo"
            placeholder="输入内容开始聊天（Enter 发送，Shift + Enter 换行）"
            @focus="handleComposerFocus"
            @keydown.enter.prevent="handleEnter"
            bg-color="var(--color-bg-elevated)"
            color="var(--color-text-primary)"
            base-color="var(--color-border-primary)"
            hide-details
            class="chat-textarea"
          ></v-textarea>
        </div>
        <button
          class="chat-input__send-btn"
          :class="{ 'chat-input__send-btn--disabled': !draft.trim() }"
          :disabled="!draft.trim()"
          @click="sendMessage"
          aria-label="发送消息"
        >
          <v-icon size="20">mdi-send</v-icon>
        </button>
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useEventListener, useResizeObserver } from '@vueuse/core'
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
const headerRef = ref<HTMLElement | null>(null)
const inputBarRef = ref<HTMLElement | null>(null)
const shouldStickToBottom = ref(true)
const feedHeight = ref<number | null>(null)
const currentUserId = computed(() => userStore.user?.id ?? 'guest')
const isConnected = computed(() => !connecting.value && !!room.value)
const sortedOnlineUsers = computed(() =>
  [...onlineUsers.value].sort(
    (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
  )
)

const chatFeedStyle = computed(() => (feedHeight.value ? { height: `${feedHeight.value}px` } : {}))

const recomputeFeedHeight = () => {
  if (typeof window === 'undefined') return
  const viewport = window.innerHeight
  const head = headerRef.value?.offsetHeight ?? 0
  const footer = inputBarRef.value?.offsetHeight ?? 0
  const available = Math.max(viewport - head - footer, 240)
  feedHeight.value = available
}

const scrollToBottom = (smooth = false) => {
  nextTick(() => {
    if (messageContainer.value) {
      const container = messageContainer.value
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      })
    }
  })
}

const updateScrollAffinity = () => {
  if (!messageContainer.value) return
  const container = messageContainer.value
  const distance =
    container.scrollHeight - (container.scrollTop + container.clientHeight)
  shouldStickToBottom.value = distance <= 96
}

const sendMessage = () => {
  if (!draft.value.trim()) return
  try {
    chatStore.sendMessage(draft.value)
    draft.value = ''
    shouldStickToBottom.value = true
    scrollToBottom(true)
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
  (newVal, oldVal) => {
    if (!newVal) return
    if (shouldStickToBottom.value) {
      const smooth = typeof oldVal === 'number' ? newVal - oldVal <= 5 : false
      scrollToBottom(smooth)
    }
  }
)

onMounted(async () => {
  await chatStore.initialize()
  chatStore.fetchOnlineUsers().catch(() => undefined)
  scrollToBottom()
  updateScrollAffinity()
  recomputeFeedHeight()
})

const stopScrollListener = useEventListener(
  messageContainer,
  'scroll',
  () => updateScrollAffinity(),
  { passive: true }
)

const { stop: stopResizeObserver } = useResizeObserver(messageContainer, () => {
  if (shouldStickToBottom.value) {
    scrollToBottom(true)
  }
})

const { stop: stopHeaderObserver } = useResizeObserver(headerRef, () => {
  recomputeFeedHeight()
})

const { stop: stopInputObserver } = useResizeObserver(inputBarRef, () => {
  recomputeFeedHeight()
})

const stopWindowResize =
  typeof window !== 'undefined'
    ? useEventListener(window, 'resize', () => recomputeFeedHeight(), {
        passive: true
      })
    : () => {}

const handleComposerFocus = () => {
  shouldStickToBottom.value = true
  scrollToBottom(true)
}

watch(
  () => [shouldUseMobileLayout.value, hasSafeArea.value],
  () => {
    nextTick(() => recomputeFeedHeight())
  }
)

onBeforeUnmount(() => {
  stopScrollListener()
  stopResizeObserver()
  stopHeaderObserver()
  stopInputObserver()
  stopWindowResize()
})

const formatTime = (value: string) => format(new Date(value), 'MM-dd HH:mm')
const formatRelative = (value: string) =>
  formatDistanceToNow(new Date(value), { addSuffix: true, locale: zhCN })
</script>

<style scoped>
/* 聊天容器 */
.chat-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-primary);
  width: 100%;
}

/* 聊天顶部栏样式 */
.chat-toolbar {
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-primary);
}

.chat-status-indicator {
  display: flex;
  align-items: center;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: var(--color-text-quaternary);
  flex-shrink: 0;
}

.status-dot.online {
  background-color: var(--color-success);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
}

/* 用户信息条 */
.chat-user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-bg-surface);
  border-bottom: 1px solid var(--color-border-primary);
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background-color: var(--color-bg-primary);
  scroll-behavior: smooth;
  overscroll-behavior-y: contain;
}

.chat-messages__content {
  padding: var(--space-4);
  max-width: 100%;
}

/* 消息行 */
.chat-message {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  align-items: flex-start;
}

.chat-message--mine {
  flex-direction: row-reverse;
}

.chat-message--system {
  justify-content: center;
  margin-bottom: var(--space-3);
}

/* 头像 */
.chat-message__avatar {
  flex-shrink: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 消息气泡 */
.chat-message__bubble {
  max-width: 70%;
  min-width: 0;
}

.chat-message--mine .chat-message__bubble {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.chat-message--system .chat-message__bubble {
  text-align: center;
  max-width: 80%;
}

/* 系统消息 */
.chat-message__system-content {
  background-color: transparent;
  color: var(--color-text-quaternary);
  font-size: var(--font-size-sm);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
}

/* 普通消息 */
.chat-message__meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-1);
  font-size: var(--font-size-xs);
}

.chat-message--mine .chat-message__meta {
  flex-direction: row-reverse;
}

.chat-message__author {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

.chat-message__time {
  color: var(--color-text-quaternary);
}

.chat-message__content {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-normal);
  box-shadow: var(--shadow-sm);
}

.chat-message--mine .chat-message__content {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

.chat-message--mine .chat-message__author,
.chat-message--mine .chat-message__time {
  color: rgba(255, 255, 255, 0.8);
}

/* 输入框 */
.chat-input {
  flex-shrink: 0;
  background-color: var(--color-bg-surface);
  border-top: 1px solid var(--color-border-primary);
  padding-bottom: var(--safe-bottom);
}

.chat-input__content {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
}

.chat-input__field {
  flex: 1;
  min-height: var(--input-height);
}

.chat-textarea :deep(.v-field) {
  border-radius: var(--radius-lg);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-primary);
  box-shadow: none;
  min-height: var(--input-height);
}

.chat-textarea :deep(.v-field__input) {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  padding: var(--space-3) var(--space-3);
  min-height: var(--input-height);
  line-height: var(--line-height-normal);
}

.chat-textarea :deep(.v-field__input::placeholder) {
  color: var(--color-text-quaternary);
}

.chat-textarea :deep(.v-field__outline) {
  display: none;
}

/* 发送按钮 */
.chat-input__send-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  background-color: var(--color-primary);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  box-shadow: var(--shadow-md);
}

.chat-input__send-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: var(--shadow-lg);
}

.chat-input__send-btn:active {
  transform: scale(0.95);
}

.chat-input__send-btn--disabled {
  background-color: var(--color-bg-overlay);
  color: var(--color-text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}

.chat-input__send-btn--disabled:hover {
  transform: none;
  background-color: var(--color-bg-overlay);
  box-shadow: none;
}

/* 成员列表样式 */
:deep(.member-list) {
  max-height: 400px;
  overflow-y: auto;
}

:deep(.member-item) {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

:deep(.member-meta .name) {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

:deep(.member-meta .time) {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

:deep(.empty) {
  text-align: center;
  color: var(--color-text-quaternary);
  padding: var(--space-6) 0;
  font-size: var(--font-size-sm);
}

/* 移动端优化 */
@media (max-width: 768px) {
  .chat-messages__content {
    padding: var(--space-3);
  }

  .chat-message {
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .chat-message__bubble {
    max-width: 80%;
  }

  .chat-message__content {
    padding: var(--space-2) var(--space-3);
    font-size: var(--font-size-base);
  }

  .chat-input__content {
    padding: var(--space-2) var(--space-3);
    gap: var(--space-2);
  }

  .avatar {
    width: 32px;
    height: 32px;
    font-size: var(--font-size-sm);
  }

  .chat-user-info {
    padding: var(--space-2) var(--space-3);
  }
}

/* 小屏幕优化 */
@media (max-width: 375px) {
  .chat-messages__content {
    padding: var(--space-2);
  }

  .chat-message__bubble {
    max-width: 85%;
  }

  .chat-message__content {
    padding: var(--space-2);
    font-size: var(--font-size-sm);
  }

  .chat-input__content {
    padding: var(--space-2);
  }

  .avatar {
    width: 28px;
    height: 28px;
    font-size: var(--font-size-xs);
  }
}
</style>
