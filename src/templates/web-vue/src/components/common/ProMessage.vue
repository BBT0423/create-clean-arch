<template>
  <div v-if="message.show" class="pro-message-wrapper">
    <div class="pro-message" :class="message.type">
      <span class="pro-message-icon">
        <svg
          v-if="message.type === 'success'"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="10" cy="10" r="10" fill="var(--success-light)" />
          <path
            d="M6 10.5l2.5 2.5 5-5"
            stroke="var(--success-dark)"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <svg
          v-else-if="message.type === 'error'"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="10" cy="10" r="10" fill="var(--danger-light)" />
          <path
            d="M10 6v5m0 3h.01"
            stroke="var(--danger-dark)"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg
          v-else-if="message.type === 'warning'"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <circle cx="10" cy="10" r="10" fill="var(--warning-light)" />
          <path
            d="M10 6v5m0 3h.01"
            stroke="var(--warning-dark)"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="var(--info-bg)" />
          <path
            d="M10 7v3m0 3h.01"
            stroke="var(--info-text)"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </span>
      <span class="pro-message-content">
        {{ message.message }}
      </span>
      <button
        v-if="message.closable"
        class="pro-message-close"
        aria-label="Close this message"
        title="Close"
        @click="hideMessage"
      >
        <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
          <path
            d="M5 5l8 8M13 5l-8 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGlobalUi } from '@/composables/useGlobalUi';
const { message, hideMessage } = useGlobalUi();
</script>

<style scoped>
.pro-message-wrapper {
  width: 100%;
  margin-bottom: 1em;
  position: relative;
  box-sizing: border-box;
}

.pro-message {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.8em 1em;
  border-radius: var(--radius-control);
  font-size: 0.9em;
  background: var(--surface-dark);
  color: var(--text);
  border: 1px solid var(--border);
  position: relative;
  min-height: 44px;
}

.pro-message-icon {
  margin-right: 0.7em;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.pro-message-content {
  flex: 1;
  line-height: 1.24rem;
}

.pro-message-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  background: none;
  border: none;
  border-radius: 50%;
  color: var(--text-muted);
  cursor: pointer;
  margin-left: 0.5em;
  transition: background 0.15s ease;
}

.pro-message-close:hover {
  background: rgba(0, 0, 0, 0.08);
  color: var(--text);
}

.pro-message.success {
  background: var(--success-light);
  color: var(--success-dark);
  border-color: var(--success-light);
}

.pro-message.error {
  background: var(--danger-light);
  color: var(--danger-dark);
  border-color: var(--danger-light);
}

.pro-message.warning {
  background: var(--warning-light);
  color: var(--warning-dark);
  border-color: var(--warning-light);
}

.pro-message.info {
  background: var(--info-bg);
  color: var(--info-text);
  border-color: var(--info-border);
}
</style>
