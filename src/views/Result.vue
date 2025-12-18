<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../composables/useAppStore'

const router = useRouter()
const store = useAppStore()

const detectionAccuracy = ref(0)
const detectionFpr = ref(0)
const detectionPrecision = ref(0)
const detectionRecall = ref(0)
const detectionF1 = ref(0)
const detectionAuc = ref(0)

const attackAsrBefore = ref(0)
const attackAsrAfter = ref(0)
const attackCda = ref(0)

const defenseAsrBefore = ref(0)
const defenseAsrAfter = ref(0)
const defenseCdaAfter = ref(0)

const attackMap: Record<string, string> = {
  attack1: 'BadNet',
  attack2: 'Blend',
  attack3: 'WaNet',
  attack4: 'SSDT',
  attack5: 'ISSBA'
}

const run = computed(() => store.state.currentRun)

const displayAttacks = computed(() => {
  const raw = run.value?.attacks || []
  if (!raw.length) return '未选择'
  const names = raw
    .map(id => attackMap[id] ?? id)
    .filter(Boolean)
  return names.join(', ')
})

const detectionStatus = computed(() => {
  if (detectionAccuracy.value > 95) return '优秀'
  if (detectionAccuracy.value > 90) return '良好'
  return '一般'
})

const statusColor = computed(() => {
  if (detectionAccuracy.value > 95) return '#60a5fa'
  if (detectionAccuracy.value > 90) return '#fbbf24'
  return '#f87171'
})

const suggestions = computed(() => run.value?.suggestions || [])

const exportReport = (type: 'detection' | 'defense') => {
  if (!run.value) return
  const payload = {
    id: run.value.id,
    dataset: run.value.datasetName,
    model: run.value.modelName,
    attackPoisonRate: run.value.attackPoisonRate,
    attackEpochs: run.value.attackEpochs,
    attackOptimizer: run.value.attackOptimizer,
    attackTargetLabel: run.value.attackTargetLabel,
    detectionAlgorithm: run.value.detectionAlgorithm,
    defenseAlgorithm: run.value.defenseAlgorithm,
    generatedAt: new Date().toISOString(),
    ...(type === 'detection'
      ? { attacks: run.value.attacks, detectionReport: run.value.detectionReport }
      : { attacks: run.value.attacks, defenseReport: run.value.defenseReport, attackReport: run.value.attackReport })
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `unidefense-${type}-report-${run.value.id}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

const hydrateMetrics = () => {
  if (!run.value) return

  detectionAccuracy.value = run.value.detectionReport.accuracy
  detectionFpr.value = run.value.detectionReport.fpr
  detectionPrecision.value = run.value.detectionReport.precision
  detectionRecall.value = run.value.detectionReport.recall
  detectionF1.value = run.value.detectionReport.f1
  detectionAuc.value = run.value.detectionReport.auc

  attackAsrBefore.value = run.value.attackReport.asrBeforeAttack
  attackAsrAfter.value = run.value.attackReport.asrAfterAttack
  attackCda.value = run.value.attackReport.cdaAfterAttack

  defenseAsrBefore.value = run.value.defenseReport.asrBeforeDefense
  defenseAsrAfter.value = run.value.defenseReport.asrAfterDefense
  defenseCdaAfter.value = run.value.defenseReport.cdaAfterDefense
}

const backToHome = () => {
  router.push('/')
}

onMounted(() => {
  if (!run.value) {
    router.push('/')
    return
  }
  hydrateMetrics()
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
            <span class="info-value">{{ run?.datasetName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">模型</span>
            <span class="info-value">{{ run?.modelName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">检测算法</span>
            <span class="info-value">{{ run?.detectionAlgorithm }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">防御算法</span>
            <span class="info-value">{{ run?.defenseAlgorithm }}</span>
          </div>
        </div>

        <div class="info-row secondary-row">
          <div class="info-item">
            <span class="info-label">投毒率</span>
            <span class="info-value">{{ run?.attackPoisonRate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">训练轮数</span>
            <span class="info-value">{{ run?.attackEpochs }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优化器</span>
            <span class="info-value">{{ run?.attackOptimizer }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">目标标签</span>
            <span class="info-value">{{ run?.attackTargetLabel }}</span>
          </div>
        </div>

        <div class="export-actions">
          <button class="secondary" @click="exportReport('detection')">导出检测报告</button>
          <button class="primary" @click="exportReport('defense')">导出防御报告</button>
        </div>
      </div>

      <div class="metrics-section">
        <h2 class="section-title">攻击阶段指标</h2>
        <div class="metrics-grid three">
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🧪</div>
            </div>
            <div class="metric-label">攻击前 ASR</div>
            <div class="metric-value">{{ attackAsrBefore.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: attackAsrBefore + '%' }"></div>
            </div>
          </div>
          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">🎯</div>
            </div>
            <div class="metric-label">攻击后 ASR</div>
            <div class="metric-value">{{ attackAsrAfter.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: attackAsrAfter + '%' }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">📈</div>
            </div>
            <div class="metric-label">CDA (攻击后)</div>
            <div class="metric-value">{{ attackCda.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: attackCda + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="metrics-section">
        <h2 class="section-title">检测指标</h2>
        <div class="metrics-grid">
          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">🎯</div>
              <span class="metric-badge" :style="{ background: statusColor }">{{ detectionStatus }}</span>
            </div>
            <div class="metric-label">检测准确率</div>
            <div class="metric-value">{{ detectionAccuracy.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: detectionAccuracy + '%' }"></div>
            </div>
          </div>

          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">📊</div>
            </div>
            <div class="metric-label">AUROC</div>
            <div class="metric-value">{{ detectionAuc.toFixed(4) }}</div>
            <div class="metric-bar">
              <div class="metric-bar-fill auc" :style="{ width: (detectionAuc * 100) + '%' }"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🎖️</div>
            </div>
            <div class="metric-label">精确率</div>
            <div class="metric-value">{{ detectionPrecision.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: detectionPrecision + '%' }"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🔍</div>
            </div>
            <div class="metric-label">召回率</div>
            <div class="metric-value">{{ detectionRecall.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: detectionRecall + '%' }"></div>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">⭐</div>
            </div>
            <div class="metric-label">F1 分数</div>
            <div class="metric-value">{{ detectionF1.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: detectionF1 + '%' }"></div>
            </div>
          </div>

          <div class="metric-card warning">
            <div class="metric-header">
              <div class="metric-icon">⚠️</div>
            </div>
            <div class="metric-label">假阳性率</div>
            <div class="metric-value">{{ detectionFpr.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill warning" :style="{ width: (detectionFpr * 10) + '%' }"></div>
            </div>
            <div class="metric-hint">越低越好</div>
          </div>
        </div>
      </div>

      <div class="metrics-section">
        <h2 class="section-title">防御后指标</h2>
        <div class="metrics-grid three">
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">🛡️</div>
            </div>
            <div class="metric-label">防御前 ASR</div>
            <div class="metric-value">{{ defenseAsrBefore.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: defenseAsrBefore + '%' }"></div>
            </div>
          </div>
          <div class="metric-card primary">
            <div class="metric-header">
              <div class="metric-icon">✅</div>
            </div>
            <div class="metric-label">防御后 ASR</div>
            <div class="metric-value">{{ defenseAsrAfter.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: defenseAsrAfter + '%' }"></div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-header">
              <div class="metric-icon">📈</div>
            </div>
            <div class="metric-label">CDA (防御后)</div>
            <div class="metric-value">{{ defenseCdaAfter.toFixed(2) }}<span class="unit">%</span></div>
            <div class="metric-bar">
              <div class="metric-bar-fill" :style="{ width: defenseCdaAfter + '%' }"></div>
            </div>
          </div>
        </div>
      </div>

      <div class="metrics-section">
        <h2 class="section-title">建议</h2>
        <ul class="suggest-list">
          <li v-for="item in suggestions" :key="item">{{ item }}</li>
        </ul>
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

.export-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.info-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.secondary-row {
  margin-top: 1rem;
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

.metrics-grid.three {
  grid-template-columns: repeat(3, 1fr);
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

.primary,
.secondary {
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.2rem;
  font-weight: 700;
  cursor: pointer;
  color: #fff;
}

.primary {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.35);
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.suggest-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggest-list li {
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.9);
}
</style>
