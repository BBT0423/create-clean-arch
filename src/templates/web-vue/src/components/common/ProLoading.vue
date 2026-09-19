<template>
  <div v-if="variant === 'skeleton'" class="pro-skeleton" aria-busy="true" aria-live="polite">
    <div
      v-for="n in lines"
      :key="n"
      class="pro-skeleton-bar"
      :style="{ width: n === lines && lines > 1 ? '60%' : '100%' }"
    ></div>
  </div>
  <div v-else class="pro-loading-overlay">
    <div class="pro-loading-spinner"></div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'spinner' | 'skeleton'; lines?: number }>(), {
  variant: 'spinner',
  lines: 3,
});
</script>

<style scoped>
.pro-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

[data-theme='dark'] .pro-loading-overlay {
  background: rgba(13, 17, 23, 0.8);
}

.pro-loading-spinner {
  border: 2.5px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 0.7s linear infinite;
}

.pro-skeleton {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pro-skeleton-bar {
  height: 11px;
  border-radius: 5px;
  background: var(--surface-dark);
  animation: pulse 1.4s ease-in-out infinite;
}

[data-theme='dark'] .pro-skeleton-bar {
  background: #232b36;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
