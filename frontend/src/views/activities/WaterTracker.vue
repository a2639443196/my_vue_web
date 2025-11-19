<template>
  <div class="min-h-screen bg-[rgb(var(--background))]">
    <TopNav title="喝水打卡" show-back show-profile />

    <main class="px-6 py-6 max-w-md mx-auto space-y-6 safe-bottom">
      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <div>
            <h4>今日喝水</h4>
            <p class="caption mt-1">目标 {{ goal }}ml</p>
          </div>
          <span class="text-2xl font-bold">{{ todayTotal }}ml</span>
        </div>
        <div class="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            class="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--primary))] rounded-full transition-all duration-500"
            :style="{ width: `${completion}%` }"
          />
        </div>
        <div class="flex items-center justify-between text-sm text-[rgb(var(--muted-foreground))]">
          <span>已完成 {{ completion }}%</span>
          <span>剩余 {{ Math.max(goal - todayTotal, 0) }}ml</span>
        </div>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <h4>选择饮品</h4>
          <button
            @click.stop="toggleCustomDrinkForm"
            class="flex items-center gap-1 px-3 py-1 text-sm text-[rgb(var(--foreground))] hover:bg-[rgb(var(--accent))]/10 rounded transition-colors"
          >
            添加自定义饮品
          </button>
        </div>

        <!-- 当前选中饮品显示 -->
        <div class="bg-[rgb(var(--accent))]/10 rounded-lg p-4 mb-4 border border-[rgb(var(--accent))]/20">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]">
                <Icon :icon="selectedDrink.icon" class="w-6 h-6" />
              </div>
              <div>
                <h5 class="font-medium">{{ selectedDrink.name }}</h5>
                <p v-if="selectedDrink.caffeineMg > 0" class="caption text-orange-400">咖啡因 {{ selectedDrink.caffeineMg }}mg</p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm text-[rgb(var(--muted-foreground))]">当前选中</p>
            </div>
          </div>
        </div>

        <!-- 常用饮品列表 -->
        <div class="mb-4">
          <div class="space-y-2">
            <!-- 内置饮品 -->
            <div v-for="drink in defaultDrinks" :key="drink.id"
                 class="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-[rgb(var(--accent))]/30 transition-colors cursor-pointer"
                 :class="{ 'bg-[rgb(var(--accent))]/10 border-[rgb(var(--accent))]/30': selectedDrink.id === drink.id }"
                 @click.stop="selectDrink(drink)">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]">
                  <Icon :icon="drink.icon || 'lucide:droplet'" class="w-5 h-5" />
                </div>
                <div>
                  <p class="text-sm font-medium">{{ drink.name }}</p>
                  <div class="flex items-center gap-2">
                    <p v-if="drink.caffeineMg > 0" class="caption text-orange-400">{{ drink.caffeineMg }}mg咖啡因</p>
                  </div>
                </div>
              </div>
              <Icon icon="lucide:chevron-right" class="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            </div>

            <!-- 自定义饮品 -->
            <div v-if="customDrinks.length > 0" class="pt-2 border-t border-white/10">
              <p class="text-xs text-[rgb(var(--muted-foreground))] mb-2">自定义饮品：</p>
              <div v-for="drink in customDrinks" :key="drink.id"
                   class="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-[rgb(var(--accent))]/30 transition-colors group cursor-pointer"
                   :class="{ 'bg-[rgb(var(--accent))]/10 border-[rgb(var(--accent))]/30': selectedDrink.id === drink.id }"
                   @click.stop="selectDrink(drink)">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400">
                    <Icon :icon="drink.icon || 'lucide:cup'" class="w-5 h-5" />
                  </div>
                  <div>
                    <p class="text-sm font-medium">{{ drink.name }}</p>
                    <div class="flex items-center gap-2">
                      <p v-if="drink.caffeineMg > 0" class="caption text-orange-400">{{ drink.caffeineMg }}mg咖啡因</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  class="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                  @click.stop="deleteCustomDrink(drink.id)"
                >
                  <Icon icon="lucide:trash-2" class="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        </div>

  
        <!-- 容量调整 -->
        <div v-if="!showCustomDrink" class="mt-4">
          <div class="flex items-center gap-3 mb-4">
            <Button variant="outline" size="icon" class="h-12 w-12 border-white/10" :disabled="hydrationStore.loading" @click="adjustAmount(-50)">
              <Icon icon="lucide:minus" class="w-5 h-5" />
            </Button>
            <div class="flex-1 text-center">
              <input
                v-model.number="selectedDrink.amount"
                type="number"
                class="w-full bg-transparent text-center text-2xl outline-none"
                min="1"
                max="5000"
              />
              <p class="caption">ml</p>
            </div>
            <Button variant="outline" size="icon" class="h-12 w-12 border-white/10" :disabled="hydrationStore.loading" @click="adjustAmount(50)">
              <Icon icon="lucide:plus" class="w-5 h-5" />
            </Button>
          </div>
        </div>

        <!-- 全局添加按钮 -->
        <Button
          v-if="!showCustomDrink"
          class="w-full h-11 gradient-primary"
          :disabled="hydrationStore.loading || isAddingWater"
          @click.stop="addRecordWithProtection"
        >
          <Icon :icon="selectedDrink.icon" class="w-5 h-5 mr-2" />
          添加{{ selectedDrink.name }}记录({{ selectedDrink.amount }}ml)
        </Button>
        <p v-if="hydrationStore.error" class="caption text-red-400 text-center mt-2">{{ hydrationStore.error }}</p>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <Icon icon="lucide:coffee" class="w-5 h-5 text-orange-400" />
            <h4>咖啡因摄入</h4>
          </div>
          <span class="caption">{{ caffeineStat }}</span>
        </div>
        <div class="h-3 bg-white/10 rounded-full overflow-hidden mb-3">
          <div
            class="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
            :style="{ width: caffeinePercent }"
          />
        </div>
        <div class="flex items-center justify-between">
          <span class="text-sm text-[rgb(var(--muted-foreground))]">{{ caffeineStatus }}</span>
          <span class="text-sm text-orange-400">剩余 {{ Math.max(caffeineLimit - caffeineToday, 0) }}mg</span>
        </div>
      </GlassCard>

      <GlassCard>
        <div class="flex items-center justify-between mb-4">
          <h4>本周记录</h4>
          <Icon icon="lucide:calendar" class="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        </div>
        <div class="grid grid-cols-7 gap-2">
          <div v-for="(day, i) in weekData" :key="i" class="flex flex-col items-center gap-2">
            <span class="caption text-xs">{{ day.day }}</span>
            <div
              class="w-full aspect-square rounded-lg flex flex-col items-center justify-center gap-1"
              :class="day.active ? 'bg-[rgb(var(--primary))] text-white' : day.amount >= goal ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-[rgb(var(--muted-foreground))]'"
            >
              <Icon icon="lucide:droplet" class="w-3 h-3" />
              <span class="text-xs">{{ (day.amount / 1000).toFixed(1) }}L</span>
            </div>
          </div>
        </div>
      </GlassCard>

      <div>
        <h4 class="mb-4">今日记录</h4>
        <div v-if="hydrationStore.loading" class="text-center text-secondary text-sm">加载中...</div>
        <div v-else-if="!todayLogs.length" class="text-center text-secondary text-sm">今日尚无记录</div>
        <div v-else class="space-y-3">
          <GlassCard v-for="log in todayLogs" :key="log.id">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center bg-[rgb(var(--accent))]/20 text-[rgb(var(--accent))]">
                  <Icon :icon="log.drinkIcon || 'lucide:droplet'" class="w-5 h-5" />
                </div>
                <div>
                  <p>{{ log.amount }}ml {{ log.drinkName || '纯净水' }}</p>
                  <p v-if="log.caffeineMg" class="caption">咖啡因 {{ log.caffeineMg }}mg</p>
                </div>
              </div>
              <div class="text-right">
                <p class="caption">{{ formatTime(log.recordedAt) }}</p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </main>
  </div>

  <!-- 悬浮弹窗 - 添加自定义饮品 -->
  <div v-if="showCustomDrink"
       class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
       @click.self="showCustomDrink = false">
    <div class="bg-[rgb(var(--background))] rounded-2xl border border-white/20 shadow-2xl w-full max-w-md mx-auto">
      <div class="flex items-center justify-between p-6 border-b border-white/10">
        <h3 class="text-lg font-semibold">添加自定义饮品</h3>
        <button @click.stop="showCustomDrink = false"
                class="w-8 h-8 rounded-full hover:bg-[rgb(var(--muted))]/20 flex items-center justify-center transition-colors">
          <Icon icon="lucide:x" class="w-5 h-5" />
        </button>
      </div>

      <div class="p-6 space-y-4">
        <div>
          <label class="block text-sm font-medium mb-2">饮品名称</label>
          <input
            v-model="customDrink.name"
            type="text"
            placeholder="例如：柠檬水、红茶、果汁等"
            class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20 transition-all"
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-2">容量(ml)</label>
            <input
              v-model.number="customDrink.amount"
              type="number"
              placeholder="250"
              min="1"
              max="5000"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20 transition-all"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">咖啡因含量(mg)</label>
            <input
              v-model.number="customDrink.caffeineMg"
              type="number"
              placeholder="0（不含咖啡因）"
              min="0"
              max="1000"
              class="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--primary))]/20 transition-all"
            />
          </div>
        </div>
      </div>

      <div class="flex gap-3 p-6 border-t border-white/10">
        <button
          @click.stop="showCustomDrink = false"
          class="flex-1 px-4 py-3 bg-white/10 hover:bg-white/20 text-[rgb(var(--foreground))] rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          @click.stop="addCustomDrink"
          :disabled="!customDrink.name || !customDrink.amount"
          class="flex-1 px-4 py-3 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--accent))] text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          添加到列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Icon } from '@iconify/vue'
import { format } from 'date-fns'
import TopNav from '@/components/TopNav.vue'
import GlassCard from '@/components/GlassCard.vue'
import Button from '@/components/ui/Button.vue'
import { useHydrationStore } from '@/stores/hydration'
import { drinksApi, type DrinkOption } from '@/api/drinksApi'

const hydrationStore = useHydrationStore()

const presets = [200, 300, 500]

// 饮品选择相关状态
const drinkOptions = ref([])
const showCustomDrink = ref(false)
const customDrink = ref({
  name: '',
  amount: 250,
  caffeineMg: 0
})

// 当前选中的饮品
const selectedDrink = ref({
  name: '纯净水',
  amount: 250,
  icon: 'lucide:droplet',
  caffeineMg: 0,
  isCustom: false
})

// 分类饮品
const defaultDrinks = computed(() => drinkOptions.value.filter(drink => drink.isDefault))
const customDrinks = computed(() => drinkOptions.value.filter(drink => !drink.isDefault))


// 防重复点击保护
const isAddingDrink = ref(false)
const isAddingWater = ref(false)
// 选择饮品
const selectDrink = (drink: DrinkOption) => {
  selectedDrink.value = {
    id: drink.id,
    name: drink.name,
    amount: selectedDrink.value.amount || 250, // 保持当前选择的容量
    icon: drink.icon || (drink.isDefault ? 'lucide:droplet' : 'lucide:cup'),
    caffeineMg: drink.caffeineMg || 0,
    isCustom: !drink.isDefault
  }
  // 如果自定义表单打开，则关闭它
  showCustomDrink.value = false
}

const addDrinkWithProtection = async (drink: DrinkOption) => {
  if (isAddingDrink.value || hydrationStore.loading) {
    return
  }

  isAddingDrink.value = true
  try {
    await addDrink(drink)
  } finally {
    // 添加延迟以确保防抖效果
    setTimeout(() => {
      isAddingDrink.value = false
    }, 500)
  }
}

const addRecordWithProtection = async () => {
  if (isAddingWater.value || hydrationStore.loading) {
    return
  }

  isAddingWater.value = true
  try {
    await addSelectedDrink()
  } finally {
    // 添加延迟以确保防抖效果
    setTimeout(() => {
      isAddingWater.value = false
    }, 500)
  }
}

const goal = computed(() => hydrationStore.goal)
const todayTotal = computed(() => hydrationStore.todayTotal)
const completion = computed(() => Math.min(Math.round((todayTotal.value / goal.value) * 100), 100))

const caffeineToday = computed(() => {
  // 计算今日咖啡因摄入总量（只计算含咖啡因的饮品）
  const logs = todayLogs.value
  const caffeinatedLogs = logs.filter(log => log.caffeineMg && log.caffeineMg > 0)
  return caffeinatedLogs.reduce((total, log) => total + (log.caffeineMg || 0), 0)
})

const caffeineLimit = 300
const caffeinePercent = computed(() => `${Math.min((caffeineToday.value / caffeineLimit) * 100, 100)}%`)
const caffeineStat = computed(() => `${caffeineToday.value} / ${caffeineLimit}mg`)
const caffeineStatus = computed(() => {
  if (caffeineToday.value < caffeineLimit * 0.5) return '安全范围'
  if (caffeineToday.value < caffeineLimit * 0.8) return '适度摄入'
  return '接近上限'
})

const weekData = computed(() => {
  try {
    const weekly = hydrationStore.stats?.weekly ?? []
    return weekly.map(entry => {
      const date = new Date(entry.date)
      return {
        day: format(date, 'E'),
        amount: entry.total || 0,
        active: format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
      }
    })
  } catch (error) {
    console.error('Error processing week data:', error)
    return []
  }
})

const todayLogs = computed(() => {
  try {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const allEntries = hydrationStore.entries || []

    return allEntries.filter(entry => {
      if (!entry.recordedAt) return false
      const entryDate = new Date(entry.recordedAt).toISOString().split('T')[0]
      return entryDate === today
    })
  } catch (error) {
    console.error('Error filtering today logs:', error)
    return []
  }
})

const addSelectedDrink = async () => {
  const drink = selectedDrink.value
  if (!drink || !drink.amount) return

  try {
    const entry = await hydrationStore.createEntry({
      amount: drink.amount,
      drink_name: drink.name,  // 使用后端期望的字段名 drink_name
      caffeine_mg: drink.caffeineMg  // 修复：使用后端期望的字段名 caffeine_mg
    })
    console.log('记录添加成功:', drink.name, drink.amount + 'ml', drink.caffeineMg ? `咖啡因 ${drink.caffeineMg}mg` : '')
  } catch (error) {
    console.error('Failed to add record:', error)
  }
}

const addWater = async (amount: number) => {
  if (!amount) return
  try {
    const entry = await hydrationStore.createEntry({
      amount,
      drink_name: '纯净水'  // 明确指定饮品名称为纯净水
    })
    console.log('纯净水记录添加成功:', amount + 'ml')
  } catch (error) {
    console.error('Failed to add water record:', error)
  }
}

const addDrink = async (drink: DrinkOption) => {
  try {
    const entry = await hydrationStore.createEntry({
      amount: drink.amount,
      drink_id: drink.id, // 使用后端期望的参数名
      drink_name: drink.name, // 修复字段名
      caffeine_mg: drink.caffeineMg  // 修复：使用后端期望的字段名 caffeine_mg
    })
    console.log('饮品记录添加成功:', drink.name, drink.amount + 'ml', drink.caffeineMg ? `咖啡因 ${drink.caffeineMg}mg` : '')
  } catch (error) {
    console.error('Failed to add drink record:', error)
  }
}

const toggleCustomDrinkForm = () => {
  showCustomDrink.value = !showCustomDrink.value
}

const addCustomDrink = async () => {
  if (!customDrink.value.name || !customDrink.value.amount) return

  try {
    // 创建自定义饮品并添加到列表
    const newDrink = await drinksApi.createDrink(customDrink.value)

    // 添加到饮品选项列表
    drinkOptions.value.push(newDrink)

    // 自动选择新创建的自定义饮品
    selectedDrink.value = {
      id: newDrink.id,
      name: newDrink.name,
      amount: selectedDrink.value.amount || newDrink.amount, // 保持当前选择的容量
      icon: 'lucide:cup',
      caffeineMg: newDrink.caffeineMg || 0,
      isCustom: true
    }

    // 重置表单
    customDrink.value = {
      name: '',
      amount: 250,
      caffeineMg: 0
    }
    showCustomDrink.value = false
  } catch (error) {
    console.error('Failed to add custom drink:', error)
  }
}

const deleteCustomDrink = async (drinkId: number | string) => {
  try {
    // 删除自定义饮品
    await drinksApi.deleteDrink(drinkId)

    // 从列表中移除
    const index = drinkOptions.value.findIndex(drink => drink.id === drinkId)
    if (index > -1) {
      drinkOptions.value.splice(index, 1)
    }

    // 如果删除的是当前选中的饮品，则切换到默认饮品
    if (selectedDrink.value.id === drinkId) {
      selectedDrink.value = {
        name: '纯净水',
        amount: selectedDrink.value.amount || 250,
        icon: 'lucide:droplet',
        caffeineMg: 0,
        isCustom: false
      }
    }
  } catch (error) {
    console.error('Failed to delete custom drink:', error)
  }
}

const adjustAmount = (delta: number) => {
  selectedDrink.value.amount = Math.max(1, Math.min(5000, selectedDrink.value.amount + delta))
}

const fetchDrinkOptions = async () => {
  try {
    drinkOptions.value = await drinksApi.fetchDrinkOptions()
  } catch (error) {
    console.error('Failed to fetch drink options:', error)
  }
}


const formatTime = (value: string) => format(new Date(value), 'HH:mm')

onMounted(async () => {
  try {
    await Promise.all([
      hydrationStore.fetchEntries().catch(err => console.error('Failed to fetch entries:', err)),
      hydrationStore.fetchStats().catch(err => console.error('Failed to fetch stats:', err)),
      fetchDrinkOptions().catch(err => console.error('Failed to fetch drink options:', err))
    ])
  } catch (error) {
    console.error('WaterTracker initialization error:', error)
  }
})
</script>
