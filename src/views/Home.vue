<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '../composables/useAppStore'

const router = useRouter()
const store = useAppStore()

const selectedAttacks = ref<string[]>([])
const selectedDatasetId = ref('')
const selectedModelId = ref('')
const selectedDetection = ref('')
const selectedDefense = ref('')
const poisonRate = ref('')
const trainEpochs = ref('')
const optimizer = ref('')
const targetLabel = ref('')

const datasetModalOpen = ref(false)
const modelModalOpen = ref(false)
const datasetName = ref('')
const datasetDesc = ref('')
const modelName = ref('')
const modelDatasetId = ref('')

const attackOptions = [
  { id: 'attack1', name: 'BadNet', desc: '经典触发器后门攻击' },
  { id: 'attack2', name: 'Blend', desc: '融合式图像触发' },
  { id: 'attack3', name: 'WaNet', desc: '扭曲式数据投毒' },
  { id: 'attack4', name: 'SSDT', desc: '静态少量数据投毒' },
  { id: 'attack5', name: 'ISSBA', desc: '子空间双向攻击' }
]

const detectionAlgorithms = [
  'Spectral Signatures',
  'Neural Cleanse',
  'Activation Clustering',
  'STRIP',
  'Fine-Pruning',
  'UniGuard'
]

const defenseAlgorithms = [
  'Fine-tuning + Data Aug',
  'ABL (Adversarial Backdoor Learning)',
  'Pruning + Distillation',
  'CT',
  'ASSET',
  'SSMT'
]

const poisonRates = ['1%', '3%', '5%', '10%', '20%']
const epochOptions = ['5', '10', '20', '30', '50']
const optimizers = ['SGD', 'Adam', 'AdamW', 'RMSProp']
const targetLabels = ['Class 0', 'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9']

const datasets = computed(() => store.state.datasets)
const models = computed(() => {
  if (!selectedDatasetId.value) return store.state.models
  return store.state.models.filter(model => model.datasetId === selectedDatasetId.value)
})

const currentUser = computed(() => store.state.auth.username || '未登录')

const readyState = computed(() => {
  if (!store.state.auth.isLoggedIn) return { ok: false, reason: '请先登录' }
  if (!selectedDatasetId.value) return { ok: false, reason: '请选择或上传数据集' }
  if (!selectedModelId.value) return { ok: false, reason: '请选择或上传模型' }
  if (selectedAttacks.value.length === 0) return { ok: false, reason: '至少选择一个攻击算法' }
  if (!poisonRate.value) return { ok: false, reason: '请选择投毒率' }
  if (!trainEpochs.value) return { ok: false, reason: '请选择训练轮数' }
  if (!optimizer.value) return { ok: false, reason: '请选择优化器' }
  if (!targetLabel.value) return { ok: false, reason: '请选择目标标签' }
  if (!selectedDetection.value) return { ok: false, reason: '请选择检测算法' }
  if (!selectedDefense.value) return { ok: false, reason: '请选择防御算法' }
  return { ok: true, reason: '' }
})

const toggleAttack = (attackId: string) => {
  const index = selectedAttacks.value.indexOf(attackId)
  if (index > -1) {
    selectedAttacks.value.splice(index, 1)
  } else {
    selectedAttacks.value.push(attackId)
  }
}

const resetModal = () => {
  datasetName.value = ''
  datasetDesc.value = ''
  modelName.value = ''
  modelDatasetId.value = selectedDatasetId.value
}

const handleDatasetUpload = () => {
  if (!datasetName.value.trim()) return
  const created = store.uploadDataset(datasetName.value.trim(), datasetDesc.value.trim())
  selectedDatasetId.value = created.id
  datasetModalOpen.value = false
  resetModal()
}

const handleModelUpload = () => {
  if (!modelName.value.trim()) return
  const created = store.uploadModel(modelName.value.trim(), modelDatasetId.value || selectedDatasetId.value)
  selectedModelId.value = created.id
  modelModalOpen.value = false
  resetModal()
}

const logout = () => {
  store.logout()
  router.push('/login')
}

const startWorkflow = () => {
  if (!readyState.value.ok) {
    return
  }

  const dataset = store.state.datasets.find(item => item.id === selectedDatasetId.value)
  const model = store.state.models.find(item => item.id === selectedModelId.value)

  store.startRun({
    attacks: [...selectedAttacks.value],
    datasetId: selectedDatasetId.value,
    datasetName: dataset?.name || '未命名数据集',
    modelId: selectedModelId.value,
    modelName: model?.name || '未命名模型',
    detectionAlgorithm: selectedDetection.value,
    defenseAlgorithm: selectedDefense.value,
    // 记录攻击训练配置以便后续报告展示
    attackPoisonRate: poisonRate.value,
    attackEpochs: trainEpochs.value,
    attackOptimizer: optimizer.value,
    attackTargetLabel: targetLabel.value
  })

  router.push('/detection')
}
</script>

<template>
  <div class="home">
    <header class="top">
      <div>
        <p class="logo">UniDefense</p>
        <h1 class="title">后门攻击 · 检测 · 防御一体化流程</h1>
        <p class="subtitle">登录后可上传自定义数据集/模型，选择攻击、检测与防御算法并导出报告</p>
      </div>
      <div class="user-block">
        <div class="user-name">{{ currentUser }}</div>
        <div class="user-actions">
          <button class="secondary" @click="logout">切换账号</button>
          <button class="ghost" @click="logout">退出登录</button>
        </div>
      </div>
    </header>

    <section class="steps">
      <div class="step" v-for="(step, index) in 6" :key="index">
        <div class="dot">{{ index + 1 }}</div>
        <div class="step-text">
          <p class="step-title">
            {{ ['登录','上传/选择数据集','选择攻击','选择检测','选择防御','生成报告'][index] }}
          </p>
          <p class="step-desc">
            {{ ['登录自动关联 RBAC','上传或绑定数据集','支持多选攻击算法','检测算法生成检测报告','防御算法生成防御指标','导出检测与防御报告'][index] }}
          </p>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>数据集与模型</h2>
          <p>可上传自定义数据集与模型，模型支持绑定数据集</p>
        </div>
        <div class="actions">
          <button class="secondary" @click="datasetModalOpen = true">上传数据集</button>
          <button class="secondary" @click="modelModalOpen = true">上传模型</button>
        </div>
      </div>

      <div class="grid two">
        <div class="card">
          <div class="card-header">选择数据集</div>
          <select v-model="selectedDatasetId" class="select">
            <option value="" disabled>请选择或上传数据集</option>
            <option v-for="dataset in datasets" :key="dataset.id" :value="dataset.id">
              {{ dataset.name }}
            </option>
          </select>
          <ul class="list">
            <li v-for="dataset in datasets" :key="dataset.id">
              <div class="list-title">{{ dataset.name }}</div>
              <div class="list-sub">{{ dataset.description || '无描述' }}</div>
            </li>
          </ul>
        </div>

        <div class="card">
          <div class="card-header">选择模型（自动过滤绑定的数据集）</div>
          <select v-model="selectedModelId" class="select">
            <option value="" disabled>请选择或上传模型</option>
            <option v-for="model in models" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
          <ul class="list">
            <li v-for="model in models" :key="model.id">
              <div class="list-title">{{ model.name }}</div>
              <div class="list-sub">绑定数据集：{{ model.datasetId || '未绑定' }}</div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="panel-header">
        <div>
          <h2>攻击算法</h2>
          <p>支持多选，运行时自动串联模拟攻击</p>
        </div>
      </div>
      <div class="attack-grid">
        <div
          v-for="attack in attackOptions"
          :key="attack.id"
          :class="['attack-card', { active: selectedAttacks.includes(attack.id) }]"
          @click="toggleAttack(attack.id)"
        >
          <div class="attack-head">
            <div class="badge">攻击</div>
            <div class="check" v-if="selectedAttacks.includes(attack.id)">✓</div>
          </div>
          <div class="attack-name">{{ attack.name }}</div>
          <div class="attack-desc">{{ attack.desc }}</div>
        </div>
      </div>

      <div class="grid three">
        <div class="card">
          <div class="card-header">投毒率</div>
          <select v-model="poisonRate" class="select">
            <option value="" disabled>请选择投毒率</option>
            <option v-for="item in poisonRates" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">控制后门样本占比，需与攻防评估一致</p>
        </div>
        <div class="card">
          <div class="card-header">训练轮数</div>
          <select v-model="trainEpochs" class="select">
            <option value="" disabled>请选择训练轮数</option>
            <option v-for="item in epochOptions" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">决定攻击阶段的训练迭代</p>
        </div>
        <div class="card">
          <div class="card-header">优化器</div>
          <select v-model="optimizer" class="select">
            <option value="" disabled>请选择优化器</option>
            <option v-for="item in optimizers" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">选择攻击训练使用的优化器</p>
        </div>
        <div class="card">
          <div class="card-header">目标标签</div>
          <select v-model="targetLabel" class="select">
            <option value="" disabled>请选择目标标签</option>
            <option v-for="item in targetLabels" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">指定后门触发后重定向的类别</p>
        </div>
      </div>

      <div class="attack-preview">
        <div class="preview-left">
          <div class="preview-chip">后门样本预览</div>
          <div class="preview-title">{{ poisonRate || '未选投毒率' }} · {{ targetLabel || '未选目标标签' }}</div>
          <div class="preview-desc">使用 {{ optimizer || '未选优化器' }} 训练 {{ trainEpochs || '?' }} 轮，将触发器样本重定向到目标标签。</div>
        </div>
        <div class="preview-right">
          <div class="preview-box">
            <div class="preview-tag">Trigger</div>
            <div class="preview-img"></div>
            <div class="preview-footer">示例: 触发后输出 → {{ targetLabel || '目标标签' }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="panel">
      <div class="grid two">
        <div class="card">
          <div class="card-header">检测算法</div>
          <select v-model="selectedDetection" class="select">
            <option value="" disabled>请选择检测算法</option>
            <option v-for="item in detectionAlgorithms" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">检测完成后会生成可导出的检测报告</p>
        </div>

        <div class="card">
          <div class="card-header">防御算法</div>
          <select v-model="selectedDefense" class="select">
            <option value="" disabled>请选择防御算法</option>
            <option v-for="item in defenseAlgorithms" :key="item" :value="item">{{ item }}</option>
          </select>
          <p class="hint">防御阶段会输出攻击前后 ASR、CDA 等指标</p>
        </div>
      </div>

      <div class="center">
        <button class="primary" :class="{ disabled: !readyState.ok }" :disabled="!readyState.ok" @click="startWorkflow">
          启动攻击-检测-防御流程
        </button>
        <p v-if="!readyState.ok" class="inline-hint">{{ readyState.reason }}</p>
      </div>
    </section>

    <div v-if="datasetModalOpen" class="modal-mask">
      <div class="modal">
        <h3>上传数据集</h3>
        <label class="field">
          <span>名称</span>
          <input v-model="datasetName" type="text" placeholder="例如: MyDataset" />
        </label>
        <label class="field">
          <span>描述</span>
          <input v-model="datasetDesc" type="text" placeholder="可选" />
        </label>
        <div class="modal-actions">
          <button class="ghost" @click="datasetModalOpen = false">取消</button>
          <button class="primary" @click="handleDatasetUpload">保存</button>
        </div>
      </div>
    </div>

    <div v-if="modelModalOpen" class="modal-mask">
      <div class="modal">
        <h3>上传模型并绑定数据集</h3>
        <label class="field">
          <span>模型名称</span>
          <input v-model="modelName" type="text" placeholder="例如: MyModel" />
        </label>
        <label class="field">
          <span>绑定数据集</span>
          <select v-model="modelDatasetId" class="select">
            <option value="">可选：选择数据集</option>
            <option v-for="dataset in datasets" :key="dataset.id" :value="dataset.id">{{ dataset.name }}</option>
          </select>
        </label>
        <div class="modal-actions">
          <button class="ghost" @click="modelModalOpen = false">取消</button>
          <button class="primary" @click="handleModelUpload">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1e, #101827);
  color: #fff;
  padding-bottom: 4rem;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2.5rem 2rem 1rem 2rem;
  gap: 1rem;
}

.logo {
  color: #60a5fa;
  font-weight: 700;
  letter-spacing: 1px;
  margin: 0 0 0.25rem 0;
}

.title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
}

.subtitle {
  margin: 0.5rem 0 0;
  color: rgba(255, 255, 255, 0.7);
}

.user-block {
  min-width: 220px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
}

.user-name {
  font-weight: 700;
}

.user-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.steps {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  padding: 0 2rem 1.5rem 2rem;
}

.step {
  display: flex;
  gap: 0.8rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
}

.dot {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  display: grid;
  place-items: center;
  font-weight: 700;
}

.step-title {
  margin: 0;
  font-weight: 700;
}

.step-desc {
  margin: 0.15rem 0 0 0;
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
}

.panel {
  margin: 0 2rem 1.5rem 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.panel-header h2 {
  margin: 0;
}

.panel-header p {
  margin: 0.2rem 0 0 0;
  color: rgba(255, 255, 255, 0.65);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.grid.two {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.grid.three {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.attack-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
}

.preview-left {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  justify-content: center;
}

.preview-chip {
  width: fit-content;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  font-weight: 700;
  font-size: 0.9rem;
}

.preview-title {
  font-weight: 700;
  font-size: 1.1rem;
}

.preview-desc {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
}

.preview-right {
  display: flex;
  justify-content: flex-end;
}

.preview-box {
  width: 220px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.25), rgba(167, 139, 250, 0.2));
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-tag {
  width: fit-content;
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.15);
  font-weight: 700;
  color: #fff;
}

.preview-img {
  height: 120px;
  border-radius: 10px;
  background: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.15) 10px, rgba(255, 255, 255, 0.05) 10px, rgba(255, 255, 255, 0.05) 20px);
  border: 1px dashed rgba(255, 255, 255, 0.2);
}

.preview-footer {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
}

.card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1rem;
}

.card-header {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.select {
  width: 100%;
  padding: 0.9rem;
  margin-bottom: 0.6rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.list-title {
  font-weight: 600;
}

.list-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
}

.attack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.attack-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.attack-card.active {
  border-color: #60a5fa;
  background: rgba(96, 165, 250, 0.08);
  transform: translateY(-2px);
}

.attack-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.badge {
  padding: 0.2rem 0.6rem;
  border-radius: 8px;
  background: rgba(96, 165, 250, 0.2);
  color: #60a5fa;
  font-weight: 700;
}

.check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #60a5fa;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.attack-name {
  margin: 0.6rem 0 0.2rem 0;
  font-weight: 700;
}

.attack-desc {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.hint {
  margin: 0.4rem 0 0 0;
  color: rgba(255, 255, 255, 0.65);
}

.center {
  text-align: center;
  margin-top: 1rem;
}

.primary,
.secondary,
.ghost {
  border: none;
  border-radius: 10px;
  padding: 0.85rem 1.2rem;
  cursor: pointer;
  font-weight: 700;
  color: #fff;
}

.primary {
  background: linear-gradient(135deg, #60a5fa, #a78bfa);
  box-shadow: 0 12px 30px rgba(96, 165, 250, 0.35);
}

.primary.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.secondary {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.inline-hint {
  margin-top: 0.4rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: grid;
  place-items: center;
  z-index: 1000;
}

.modal {
  background: #0f172a;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  width: min(420px, 90%);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
}

.modal h3 {
  margin: 0 0 1rem 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.8rem;
}

.field input {
  padding: 0.85rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .top {
    flex-direction: column;
  }
}
</style>
