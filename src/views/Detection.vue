<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'
import { useAppStore } from '../composables/useAppStore'

const router = useRouter()
const store = useAppStore()

const progress = ref(0)
const status = ref('初始化检测环境...')
const canvasRef = ref<HTMLCanvasElement | null>(null)

const attackMap: Record<string, string> = {
  attack1: 'BadNet',
  attack2: 'Blend',
  attack3: 'WaNet',
  attack4: 'SSDT',
  attack5: 'ISSBA'
}

let scene: THREE.Scene
let camera: THREE.PerspectiveCamera
let renderer: THREE.WebGLRenderer
let particles: THREE.Points
let animationId: number

const statusMessages = [
  '初始化检测环境...',
  '加载数据集并绑定模型...',
  '执行攻击场景并记录 ASR/CDA...',
  '运行检测算法...',
  '生成检测报告...',
  '运行防御算法...',
  '评估防御后指标...',
  '整理可导出的报告...',
  '流程完成！'
]

const currentRun = computed(() => store.state.currentRun)

const displayAttacks = computed(() => {
  const raw = currentRun.value?.attacks || []
  if (!raw.length) return '未选择'
  const names = raw
    .map(id => attackMap[id] ?? id)
    .filter(Boolean)
  return names.join(', ')
})

const datasetName = computed(() => currentRun.value?.datasetName || '未选择')
const modelName = computed(() => currentRun.value?.modelName || '未选择')
const detectionAlgorithm = computed(() => currentRun.value?.detectionAlgorithm || '未选择')
const defenseAlgorithm = computed(() => currentRun.value?.defenseAlgorithm || '未选择')
const attackPoisonRate = computed(() => currentRun.value?.attackPoisonRate || '未选择')
const attackEpochs = computed(() => currentRun.value?.attackEpochs || '未设置')
const attackOptimizer = computed(() => currentRun.value?.attackOptimizer || '未选择')
const attackTargetLabel = computed(() => currentRun.value?.attackTargetLabel || '未选择')

const initThreeJS = () => {
  if (!canvasRef.value) return

  // 场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0a0a1a)

  // 相机
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )
  camera.position.z = 5

  // 渲染器
  renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value,
    antialias: true
  })
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setPixelRatio(window.devicePixelRatio)

  // 创建粒子
  const particlesGeometry = new THREE.BufferGeometry()
  const particlesCount = 5000
  const posArray = new Float32Array(particlesCount * 3)
  const colorArray = new Float32Array(particlesCount * 3)

  for (let i = 0; i < particlesCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 10
    posArray[i + 1] = (Math.random() - 0.5) * 10
    posArray[i + 2] = (Math.random() - 0.5) * 10

    // 渐变颜色：从蓝色到紫色到粉色
    const t = Math.random()
    colorArray[i] = 0.4 + t * 0.6     // R
    colorArray[i + 1] = 0.2 + t * 0.3 // G
    colorArray[i + 2] = 0.8 + t * 0.2 // B
  }

  particlesGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(posArray, 3)
  )
  particlesGeometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colorArray, 3)
  )

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  })

  particles = new THREE.Points(particlesGeometry, particlesMaterial)
  scene.add(particles)

  // 添加环境光
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  scene.add(ambientLight)

  animate()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  // 旋转粒子
  particles.rotation.x += 0.0005
  particles.rotation.y += 0.001

  // 根据进度更新粒子位置
  const positions = particles.geometry.attributes.position.array as Float32Array
  const time = Date.now() * 0.001

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]

    positions[i + 1] = y + Math.sin(time + x) * 0.002 * (progress.value / 100)
    positions[i + 2] = z + Math.cos(time + y) * 0.002 * (progress.value / 100)
  }

  particles.geometry.attributes.position.needsUpdate = true

  renderer.render(scene, camera)
}

const handleResize = () => {
  if (!camera || !renderer) return
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

const simulateDetection = () => {
  let currentProgress = 0
  let messageIndex = 0

  const interval = setInterval(() => {
    currentProgress += Math.random() * 3 + 1

    if (currentProgress >= 100) {
      currentProgress = 100
      clearInterval(interval)

      setTimeout(() => {
        router.push('/result')
      }, 800)
    }

    progress.value = currentProgress

    const newMessageIndex = Math.floor((currentProgress / 100) * (statusMessages.length - 1))
    if (newMessageIndex !== messageIndex) {
      messageIndex = newMessageIndex
      status.value = statusMessages[messageIndex]
    }
  }, 200)
}

onMounted(() => {
  if (!currentRun.value) {
    router.push('/')
    return
  }
  initThreeJS()
  simulateDetection()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer) {
    renderer.dispose()
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="detection-container">
    <canvas ref="canvasRef" class="background-canvas"></canvas>
    
    <div class="content-overlay">
      <div class="detection-card">
        <h1 class="detection-title">正在进行后门检测</h1>
        
        <div class="status-text">{{ status }}</div>
        
        <div class="progress-container">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: progress + '%' }"
            ></div>
            <div class="progress-glow" :style="{ width: progress + '%' }"></div>
          </div>
          <div class="progress-text">{{ Math.floor(progress) }}%</div>
        </div>

        <div class="detection-info">
          <div class="info-item">
            <span class="info-label">攻击形式:</span>
            <span class="info-value">{{ displayAttacks }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">数据集:</span>
            <span class="info-value">{{ datasetName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">模型:</span>
            <span class="info-value">{{ modelName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">检测算法:</span>
            <span class="info-value">{{ detectionAlgorithm }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">防御算法:</span>
            <span class="info-value">{{ defenseAlgorithm }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">投毒率:</span>
            <span class="info-value">{{ attackPoisonRate }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">训练轮数:</span>
            <span class="info-value">{{ attackEpochs }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">优化器:</span>
            <span class="info-value">{{ attackOptimizer }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">目标标签:</span>
            <span class="info-value">{{ attackTargetLabel }}</span>
          </div>
        </div>

        <div class="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detection-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
}

.background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.content-overlay {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.detection-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 3rem;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: fadeIn 0.6s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detection-title {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 2rem 0;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.status-text {
  color: #a0d8f1;
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 2rem;
  min-height: 1.5rem;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.progress-container {
  margin-bottom: 2rem;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.progress-fill {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, #60a5fa, #a78bfa, #c084fc);
  border-radius: 10px;
  transition: width 0.3s ease;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.5);
}

.progress-glow {
  position: absolute;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  border-radius: 10px;
  transition: width 0.3s ease;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.progress-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.detection-info {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  color: white;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 600;
  color: #a0d8f1;
}

.info-value {
  color: #fff;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.loading-dots span {
  width: 12px;
  height: 12px;
  background: white;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
