<template>
  <div class="games-hub">
    <header class="hub-header">
      <div>
        <h1>专注训练中心</h1>
        <p>通过舒尔特方格和反应力小游戏，训练视野扩展、注意力与反应速度，刷新个人最佳成绩。</p>
      </div>
      <v-btn color="primary" variant="outlined" @click="goProfile">
        查看我的数据
      </v-btn>
    </header>

    <div class="cards">
      <v-card class="game-card" elevation="4">
        <div class="card-hero schulte">
          <v-icon size="36">mdi-grid-large</v-icon>
        </div>
        <div class="card-body">
          <h2>舒尔特方格</h2>
          <p>强化注意力和视觉搜索能力，从 4x4 到 6x6 难度随心切换。</p>
          <div class="card-stats">
            <div>
              <span>最佳成绩</span>
              <strong>{{ bestSchulte ? `${bestSchulte.score.toFixed(2)} 秒` : '尚未挑战' }}</strong>
            </div>
            <div>
              <span>最近成绩</span>
              <strong>{{ latestSchulte?.summary || '暂无记录' }}</strong>
            </div>
          </div>
          <v-btn color="primary" @click="goGame('SchulteGrid')">
            开始训练
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>

      <v-card class="game-card" elevation="4">
        <div class="card-hero reaction">
          <v-icon size="36">mdi-flash</v-icon>
        </div>
        <div class="card-body">
          <h2>反应力测试</h2>
          <p>挑战手眼反应速度，连续 5 次统计平均值，看看你的神经反射速度有多快。</p>
          <div class="card-stats">
            <div>
              <span>最佳成绩</span>
              <strong>{{ bestReaction ? `${Math.round(bestReaction.score)} ms` : '尚未测试' }}</strong>
            </div>
            <div>
              <span>最近成绩</span>
              <strong>{{ latestReaction?.summary || '暂无记录' }}</strong>
            </div>
          </div>
          <v-btn color="primary" @click="goGame('ReactionTime')">
            立即测试
            <v-icon end>mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const bestSchulte = computed(() => userStore.bestSchulteRecord)
const bestReaction = computed(() => userStore.bestReactionRecord)
const latestSchulte = computed(() => userStore.gameRecords.find(record => record.game === 'schulte'))
const latestReaction = computed(() => userStore.gameRecords.find(record => record.game === 'reaction'))

const goGame = (name: string) => {
  router.push({ name })
}

const goProfile = () => router.push({ name: 'Profile' })
</script>

<style scoped>
.games-hub {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.hub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.hub-header h1 {
  margin: 0 0 0.5rem;
}

.hub-header p {
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
  max-width: 720px;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.game-card {
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  grid-template-rows: auto 1fr;
  background: white;
}

.card-hero {
  height: 140px;
  display: grid;
  place-items: center;
  color: white;
}

.card-hero.schulte {
  background: linear-gradient(135deg, #5c6bc0 0%, #42a5f5 100%);
}

.card-hero.reaction {
  background: linear-gradient(135deg, #ff7043 0%, #ffca28 100%);
}

.card-body {
  padding: 1.5rem;
  display: grid;
  gap: 1rem;
}

.card-body p {
  margin: 0;
  color: rgba(0, 0, 0, 0.65);
}

.card-stats {
  display: grid;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.03);
  padding: 0.75rem 1rem;
  border-radius: 16px;
}

.card-stats span {
  display: block;
  color: rgba(0, 0, 0, 0.5);
}

.card-stats strong {
  font-size: 1.1rem;
}
</style>
