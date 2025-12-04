<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const selectedAttack = ref<string[]>([])
const selectedDataset = ref('')
const selectedModel = ref('')

const attacks = [
  { id: 'attack1', name: '攻击形式 1' },
  { id: 'attack2', name: '攻击形式 2' },
  { id: 'attack3', name: '攻击形式 3' },
  { id: 'attack4', name: '攻击形式 4' },
  { id: 'attack5', name: '攻击形式 5' }
]

const datasets = [
  'CIFAR-10',
  'CIFAR-100',
  'ImageNet',
  'MNIST',
  'Fashion-MNIST'
]

const models = [
  'ResNet-18',
  'ResNet-50',
  'VGG-16',
  'MobileNet',
  'EfficientNet'
]

const toggleAttack = (attackId: string) => {
  const index = selectedAttack.value.indexOf(attackId)
  if (index > -1) {
    selectedAttack.value.splice(index, 1)
  } else {
    selectedAttack.value.push(attackId)
  }
}

const startDetection = () => {
  if (selectedAttack.value.length === 0 || !selectedDataset.value || !selectedModel.value) {
    alert('请选择攻击形式、数据集和模型！')
    return
  }
  
  router.push({
    path: '/detection',
    query: {
      attacks: selectedAttack.value.join(','),
      dataset: selectedDataset.value,
      model: selectedModel.value
    }
  })
}
</script>

<template>
  <div class="home-container">
    <header class="header">
      <h1 class="title">深度学习后门检测平台</h1>
    </header>

    <main class="main-content">
      <section class="section">
        <h2 class="section-title">选择攻击形式</h2>
        <div class="attack-grid">
          <div
            v-for="attack in attacks"
            :key="attack.id"
            :class="['attack-card', { active: selectedAttack.includes(attack.id) }]"
            @click="toggleAttack(attack.id)"
          >
            <div class="attack-icon">🎯</div>
            <div class="attack-name">{{ attack.name }}</div>
            <div class="check-mark" v-if="selectedAttack.includes(attack.id)">✓</div>
          </div>
        </div>
      </section>

      <section class="section">
        <h2 class="section-title">配置检测参数</h2>
        <div class="config-grid">
          <div class="config-item">
            <label class="config-label">选择数据集</label>
            <select v-model="selectedDataset" class="custom-select">
              <option value="" disabled>请选择数据集</option>
              <option v-for="dataset in datasets" :key="dataset" :value="dataset">
                {{ dataset }}
              </option>
            </select>
          </div>

          <div class="config-item">
            <label class="config-label">选择模型</label>
            <select v-model="selectedModel" class="custom-select">
              <option value="" disabled>请选择模型</option>
              <option v-for="model in models" :key="model" :value="model">
                {{ model }}
              </option>
            </select>
          </div>
        </div>
      </section>

      <div class="action-section">
        <button class="detect-button" @click="startDetection">
          <span class="button-icon">🔍</span>
          <span>开始检测</span>
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
  color: white;
  overflow-y: auto;
  overflow-x: hidden;
}

.header {
  padding: 2rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

.section {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 600;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.attack-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.attack-card {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.attack-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(96, 165, 250, 0.5);
  box-shadow: 0 10px 25px rgba(96, 165, 250, 0.2);
}

.attack-card.active {
  background: rgba(96, 165, 250, 0.15);
  border-color: #60a5fa;
  box-shadow: 0 0 20px rgba(96, 165, 250, 0.4);
}

.attack-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.attack-name {
  font-size: 1.2rem;
  font-weight: 500;
}

.check-mark {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  background: #60a5fa;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.config-label {
  font-size: 1.2rem;
  font-weight: 500;
}

.custom-select {
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.custom-select:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(96, 165, 250, 0.5);
}

.custom-select:focus {
  border-color: #60a5fa;
  box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
}

.custom-select option {
  background: #1a1a2e;
  color: white;
}

.action-section {
  margin-top: 3rem;
  text-align: center;
}

.detect-button {
  padding: 1.2rem 3rem;
  font-size: 1.3rem;
  font-weight: 600;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
  border: none;
  border-radius: 50px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(96, 165, 250, 0.3);
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
}

.detect-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 35px rgba(96, 165, 250, 0.4);
}

.detect-button:active {
  transform: translateY(-1px);
}

.button-icon {
  font-size: 1.5rem;
}
</style>
