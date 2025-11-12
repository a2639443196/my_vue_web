import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { NavigationCard } from '@/types/navigation'

const STORAGE_KEY = 'yanzu-home-navigation'

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const defaultCards = (): NavigationCard[] => [
  {
    id: 'water-tracker',
    title: '喝水打卡',
    description: '记录每日饮水进度，守护健康习惯',
    icon: 'mdi-water-outline',
    color: '#2F88FF',
    to: '/water',
    highlight: true
  },
  {
    id: 'chat-room',
    title: '聊天室',
    description: '加入实时交流，与在线伙伴互动',
    icon: 'mdi-chat-processing-outline',
    color: '#9C27B0',
    to: '/chat'
  },
  {
    id: 'games-hub',
    title: '专注训练',
    description: '舒尔特方格 & 反应力小游戏合集',
    icon: 'mdi-gamepad-variant-outline',
    color: '#43A047',
    to: '/games'
  },
  {
    id: 'activity-hub',
    title: '活动记录',
    description: '抽烟与摸鱼日志集中管理',
    icon: 'mdi-notebook-edit-outline',
    color: '#FF7043',
    to: '/activities'
  },
  {
    id: 'daily-notes',
    title: '每日灵感',
    description: '收集来自社区的灵感与提示',
    icon: 'mdi-lightbulb-outline',
    color: '#FF9800',
    externalUrl: 'https://www.bilibili.com',
    badge: '外链'
  }
]

const loadCards = (): NavigationCard[] => {
  if (typeof localStorage === 'undefined') return defaultCards()
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return defaultCards()
  try {
    const parsed = JSON.parse(raw) as NavigationCard[]
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultCards()
    }
    return parsed
  } catch (error) {
    console.error('Failed to parse navigation config', error)
    return defaultCards()
  }
}

export const useNavigationStore = defineStore('navigation', () => {
  const cards = ref<NavigationCard[]>(loadCards())

  const persist = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards.value))
  }

  const addCard = (card: Omit<NavigationCard, 'id'>) => {
    const newCard: NavigationCard = { ...card, id: generateId() }
    cards.value = [...cards.value, newCard]
    persist()
    return newCard
  }

  const updateCard = (id: string, patch: Partial<NavigationCard>) => {
    cards.value = cards.value.map(card =>
      card.id === id
        ? { ...card, ...patch, id: card.id }
        : card
    )
    persist()
  }

  const removeCard = (id: string) => {
    cards.value = cards.value.filter(card => card.id !== id)
    persist()
  }

  const reset = () => {
    cards.value = defaultCards()
    persist()
  }

  const internalCards = computed(() => cards.value.filter(card => card.to))
  const externalCards = computed(() => cards.value.filter(card => card.externalUrl))

  return {
    cards: readonly(cards),
    internalCards,
    externalCards,
    addCard,
    updateCard,
    removeCard,
    reset
  }
})
