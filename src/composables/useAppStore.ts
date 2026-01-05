import { reactive, computed } from 'vue'

export interface Dataset {
  id: string
  name: string
  description?: string
  uploadedAt: string
}

export interface Model {
  id: string
  name: string
  datasetId?: string
  uploadedAt: string
}

export interface AttackReport {
  asrBeforeAttack: number
  asrAfterAttack: number
  cdaAfterAttack: number
}

export interface DetectionReport {
  accuracy: number
  fpr: number
  precision: number
  recall: number
  f1: number
  auc: number
}

export interface DefenseReport {
  asrBeforeDefense: number
  asrAfterDefense: number
  cdaAfterDefense: number
}

export interface RunContext {
  id: string
  attacks: string[]
  datasetId: string
  datasetName: string
  modelId: string
  modelName: string
  attackPoisonRate: string
  attackEpochs: string
  attackOptimizer: string
  attackTargetLabel: string
  detectionAlgorithm: string
  defenseAlgorithm: string
  attackReport: AttackReport
  detectionReport: DetectionReport
  defenseReport: DefenseReport
  suggestions: string[]
  createdAt: string
}

interface AuthState {
  isLoggedIn: boolean
  username: string
  token: string
}

interface StoreState {
  auth: AuthState
  datasets: Dataset[]
  models: Model[]
  currentRun: RunContext | null
}

const STORAGE_KEY = 'unidefense-state'

const defaults: StoreState = {
  auth: {
    isLoggedIn: false,
    username: '',
    token: ''
  },
  datasets: [
    {
      id: 'ds-cifar10',
      name: 'CIFAR-10',
      description: '10类自然图像，60k样本',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'ds-cifar100',
      name: 'CIFAR-100',
      description: '100类自然图像，60k样本',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'ds-imagenet',
      name: 'ImageNet',
      description: '经典大规模分类数据集',
      uploadedAt: new Date().toISOString()
    }
  ],
  models: [
    {
      id: 'mdl-resnet18',
      name: 'ResNet-18',
      datasetId: 'ds-cifar10',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'mdl-resnet50',
      name: 'ResNet-50',
      datasetId: 'ds-imagenet',
      uploadedAt: new Date().toISOString()
    },
    {
      id: 'mdl-vgg16',
      name: 'VGG-16',
      datasetId: 'ds-cifar100',
      uploadedAt: new Date().toISOString()
    }
  ],
  currentRun: null
}

const loadState = (): StoreState => {
  if (typeof window === 'undefined') return structuredClone(defaults)
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(defaults)
    const parsed = JSON.parse(raw) as StoreState
    return {
      ...structuredClone(defaults),
      ...parsed,
      datasets: parsed.datasets?.length ? parsed.datasets : structuredClone(defaults.datasets),
      models: parsed.models?.length ? parsed.models : structuredClone(defaults.models)
    }
  } catch (error) {
    console.warn('无法加载本地状态，将使用默认值', error)
    return structuredClone(defaults)
  }
}

const state = reactive<StoreState>(loadState())

const persist = () => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.warn('无法持久化状态', error)
  }
}

const randomBetween = (min: number, max: number, digits = 2) => {
  const value = Math.random() * (max - min) + min
  return Number(value.toFixed(digits))
}

/**
 * 构建一个自洽的检测指标集，保证派生值（F1、FPR、Accuracy 等）由同一组混淆矩阵推导。
 */
const buildReports = (payload: {
  attacks: string[]
  detectionAlgorithm: string
  defenseAlgorithm: string
}) => {
  const attackReport: AttackReport = {
    asrBeforeAttack: randomBetween(0.5, 1.5),
    asrAfterAttack: randomBetween(72, 88),
    cdaAfterAttack: randomBetween(70, 88)
  }

  // 生成混淆矩阵并据此计算所有检测指标，避免各指标之间不一致
  const total = 1000
  const positiveRate = randomBetween(0.25, 0.45, 3) // 数据集中正样本占比
  const positives = Math.max(1, Math.round(total * positiveRate))
  const negatives = total - positives

  const tpr = randomBetween(0.9, 0.98, 4) // 召回率 = TPR
  const fprRatio = randomBetween(0.012, 0.045, 4) // FPR 按比例存储

  const tp = Math.round(positives * tpr)
  const fn = Math.max(positives - tp, 0)
  const fp = Math.round(negatives * fprRatio)
  const tn = Math.max(negatives - fp, 0)

  const precisionRatio = tp + fp === 0 ? 1 : tp / (tp + fp)
  const recallRatio = positives === 0 ? 1 : tp / positives
  const accuracyRatio = (tp + tn) / total
  const f1Ratio = precisionRatio + recallRatio === 0 ? 0 : (2 * precisionRatio * recallRatio) / (precisionRatio + recallRatio)

  const detectionReport: DetectionReport = {
    accuracy: Number((accuracyRatio * 100).toFixed(2)),
    fpr: Number((fprRatio * 100).toFixed(2)),
    precision: Number((precisionRatio * 100).toFixed(2)),
    recall: Number((recallRatio * 100).toFixed(2)),
    f1: Number((f1Ratio * 100).toFixed(2)),
    auc: Number((((tpr + (1 - fprRatio)) / 2).toFixed(4)))
  }

  const defenseReport: DefenseReport = {
    asrBeforeDefense: attackReport.asrAfterAttack,
    asrAfterDefense: randomBetween(3, 12),
    cdaAfterDefense: randomBetween(90, 97)
  }

  const suggestions = [
    `优先采用 ${payload.detectionAlgorithm} 监测触发模式，并结合阈值调优降低误报`,
    `针对 ${payload.defenseAlgorithm}，建议在重训练阶段增加数据增强抑制后门特征`,
    '上线前执行一次灰盒评估，覆盖不同触发器尺寸与位置',
    '启用输入检测与模型防御的双通道策略，持续监测漂移'
  ]

  return { attackReport, detectionReport, defenseReport, suggestions }
}

export const useAppStore = () => {
  const login = (username: string) => {
    state.auth.isLoggedIn = true
    state.auth.username = username
    state.auth.token = `token-${Date.now()}`
    persist()
  }

  const logout = () => {
    state.auth.isLoggedIn = false
    state.auth.username = ''
    state.auth.token = ''
    state.currentRun = null
    persist()
  }

  const uploadDataset = (name: string, description?: string): Dataset => {
    const dataset: Dataset = {
      id: `ds-${Date.now()}`,
      name,
      description,
      uploadedAt: new Date().toISOString()
    }
    state.datasets.push(dataset)
    persist()
    return dataset
  }

  const uploadModel = (name: string, datasetId?: string): Model => {
    const model: Model = {
      id: `mdl-${Date.now()}`,
      name,
      datasetId,
      uploadedAt: new Date().toISOString()
    }
    state.models.push(model)
    persist()
    return model
  }

  const startRun = (payload: {
    attacks: string[]
    datasetId: string
    datasetName: string
    modelId: string
    modelName: string
    attackPoisonRate: string
    attackEpochs: string
    attackOptimizer: string
    attackTargetLabel: string
    detectionAlgorithm: string
    defenseAlgorithm: string
  }): RunContext => {
    const metrics = buildReports({
      attacks: payload.attacks,
      detectionAlgorithm: payload.detectionAlgorithm,
      defenseAlgorithm: payload.defenseAlgorithm
    })

    state.currentRun = {
      id: `run-${Date.now()}`,
      ...payload,
      ...metrics,
      createdAt: new Date().toISOString()
    }
    persist()
    return state.currentRun
  }

  const clearRun = () => {
    state.currentRun = null
    persist()
  }

  const modelsByDataset = computed(() => (datasetId?: string) => {
    if (!datasetId) return state.models
    return state.models.filter(model => model.datasetId === datasetId)
  })

  const datasetMap = computed(() => {
    const map: Record<string, Dataset> = {}
    state.datasets.forEach(item => {
      map[item.id] = item
    })
    return map
  })

  return {
    state,
    login,
    logout,
    uploadDataset,
    uploadModel,
    startRun,
    clearRun,
    modelsByDataset,
    datasetMap
  }
}
