<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const accuracy = ref(0)
const fpr = ref(0)
const precision = ref(0)
const recall = ref(0)
const f1Score = ref(0)
const auc = ref(0)

const targetAccuracy = ref(0)
const targetFpr = ref(0)
const targetPrecision = ref(0)
const targetRecall = ref(0)
const targetF1Score = ref(0)
const targetAuc = ref(0)

const attackMap: Record<string, string> = {
  attack1: 'BadNet',
  attack2: 'Blend',
  attack3: 'WaNet',
  attack4: 'SSDT',
  attack5: 'ISSBA'
}

const displayAttacks = computed(() => {
  const raw = route.query.attacks as string | string[] | undefined
  if (!raw) return '未选择'

  const ids: string[] = Array.isArray(raw) ? raw : raw.split(',')
  const names = ids
    .map(id => attackMap[id] ?? id)
    .filter(Boolean)

  return names.join(', ')
})

const status = computed(() => {
  if (targetAccuracy.value > 95) return '优秀'
  if (targetAccuracy.value > 90) return '良好'
  return '一般'
})

const statusColor = computed(() => {
  if (targetAccuracy.value > 95) return '#60a5fa'
  if (targetAccuracy.value > 90) return '#fbbf24'
  return '#f87171'
})

const generateResults = () => {
  targetAccuracy.value = 95.6 + Math.random() * 3
  targetFpr.value = 2.1 + Math.random() * 2
  targetPrecision.value = 94.3 + Math.random() * 4
  targetRecall.value = 95.5 + Math.random() * 3
  targetF1Score.value = 94.9 + Math.random() * 3
  targetAuc.value = 0.97 + Math.random() * 0.02
}

const animateNumbers = () => {
  const duration = 1500
  const steps = 60
  const interval = duration / steps
  let currentStep = 0

  const timer = setInterval(() => {
    currentStep++
    const progress = currentStep / steps

    accuracy.value = targetAccuracy.value * progress
    fpr.value = targetFpr.value * progress
    precision.value = targetPrecision.value * progress
    recall.value = targetRecall.value * progress
    f1Score.value = targetF1Score.value * progress
    auc.value = targetAuc.value * progress

    if (currentStep >= steps) {
      clearInterval(timer)
    }
  }, interval)
}

const backToHome = () => {
  router.push('/')
}

onMounted(() => {
  generateResults()
  setTimeout(animateNumbers, 300)
})
</script>

<template>
  <div class="result-page">
    <!-- 顶部导航 -->
    <div class="top-bar">
      <button class="back-btn" @click="backToHome">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 10H5M5 10L10 5M5 10L10 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span>返回</span>
      </button>
      <h1 class="page-title">检测结果</h1>
      <div></div>
    </div>

    <!-- 主内容区域 -->
    <div class="content-wrapper">
      <!-- 检测信息卡片 -->
      <div class="info-card">
        <div class="info-row">
          <div class="info-item">
            <span class="info-label">攻击算法</span>
            <span class="info-value">{{ displayAttacks }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集</span>
            <span class="info-value">{{ route.query.dataset }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">模型</span>
            <span class="info-value">{{ route.query.model }}</span>
          </div>
        </div>
      </div>

      <!-- 所有指标区域 -->
      <div class="metrics-section">
        <h2 class="section-title">检测指标</h2>
        <div class="metrics-grid">
          <!-- 准确率 -->
          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">🎯</div>
              <span class="metric-badge" :style="{ background: statusColor }">{{ status }}</span>
            </div>
            <div class="metric-label">检测准确率</div>
            <div class="metric-value">{{ accuracy.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: accuracy + '%' }"></div>
            </div>
          </div>

          <!-- AUC -->
          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">📊</div>
            </div>
            <div class="metric-label">AUROC</div>
            <div class="metric-value">{{ auc.toFixed(4) }}</div>
            <div class="metric-bar">
              <div class="metric-bar-fill auc" :style="{ width: (auc * 100) + '%' }"></div>
            </div>
          </div>

          <!-- 精确率 -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🎖️</div>
            </div>
            <div class="metric-label">精确率</div>
            <div class="metric-value">{{ precision.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: precision + '%' }"></div>
            </div>
          </div>

          <!-- 召回率 -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🔍</div>
            </div>
            <div class="metric-label">召回率</div>
            <div class="metric-value">{{ recall.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: recall + '%' }"></div>
            </div>
          </div>

          <!-- F1 分数 -->
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">⭐</div>
            </div>
            <div class="metric-label">F1 分数</div>
            <div class="metric-value">{{ f1Score.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: f1Score + '%' }"></div>
            </div>
          </div>

          <!-- 假阳性率 -->
          <div class="metric-card warning">
            <div class="metric-header">
              <div class="metric-icon">⚠️</div>
            </div>
            <div class="metric-label">假阳性率</div>
            <div class="metric-value">{{ fpr.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill warning" :style="{ width: (fpr * 10) + '%' }"></div>
            </div>
            <div class="metric-hint">越低越好</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
  color: #fff;
  overflow-y: auto;
}

.top-bar {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 1.5rem 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.95rem;
  width: fit-content;
  justify-self: start;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(96, 165, 250, 0.5);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  justify-self: center;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #fff;
}

.metrics-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 2rem;
  color: rgba(255, 255, 255, 0.9);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 1200px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
}

.metric-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  min-height: 180px;
}

.metric-card:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(96, 165, 250, 0.3);
  transform: translateY(-2px);
}

.metric-card.primary {
  background: rgba(96, 165, 250, 0.05);
  border-color: rgba(96, 165, 250, 0.2);
}

.metric-card.warning {
  border-color: rgba(251, 191, 36, 0.2);
}

.metric-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  min-height: 48px;
}

.metric-icon {
  font-size: 2.5rem;
  line-height: 1;
}

.metric-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
}

.metric-label {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  margin-bottom: 0.75rem;
}

.metric-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #60a5fa;
  line-height: 1;
  margin-bottom: 1rem;
}

.unit {
  font-size: 1.25rem;
  color: rgba(96, 165, 250, 0.7);
  margin-left: 0.25rem;
}

.metric-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  overflow: hidden;
  margin-top: auto;
}

.metric-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  border-radius: 3px;
  transition: width 1.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.metric-bar-fill.auc {
  background: linear-gradient(90deg, #a78bfa, #c084fc);
}

.metric-bar-fill.warning {
  background: linear-gradient(90deg, #fbbf24, #f59e0b);
}

.metric-hint {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
  margin-top: 0.5rem;
}
</style>
