<script setup lang="ts">
import { ref } from 'vue'
import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()
const isMaximized = ref(false)

const minimizeWindow = async () => {
  await appWindow.minimize()
}

const toggleMaximize = async () => {
  const maximized = await appWindow.isMaximized()
  if (maximized) {
    await appWindow.unmaximize()
    isMaximized.value = false
  } else {
    await appWindow.maximize()
    isMaximized.value = true
  }
}

const closeWindow = async () => {
  await appWindow.close()
}
</script>

<template>
  <div class="titlebar" data-tauri-drag-region>
    <div class="titlebar-title" data-tauri-drag-region>
      深度学习后门检测平台
    </div>
    <div class="titlebar-controls">
      <button class="titlebar-button minimize" @click="minimizeWindow">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <rect y="5" width="12" height="2" fill="currentColor" />
        </svg>
      </button>
      <button class="titlebar-button maximize" @click="toggleMaximize">
        <svg width="12" height="12" viewBox="0 0 12 12" v-if="!isMaximized">
          <rect x="1" y="1" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
        <svg width="12" height="12" viewBox="0 0 12 12" v-else>
          <rect x="2" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
          <rect x="0" y="2" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1.5" />
        </svg>
      </button>
      <button class="titlebar-button close" @click="closeWindow">
        <svg width="12" height="12" viewBox="0 0 12 12">
          <line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.titlebar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  z-index: 9999;
  user-select: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.titlebar-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.3px;
  flex: 1;
}

.titlebar-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag;
}

.titlebar-button {
  width: 32px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.titlebar-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.titlebar-button.close:hover {
  background: #ef4444;
  color: white;
}

.titlebar-button:active {
  transform: scale(0.95);
}
</style>
