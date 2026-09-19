<template>
  <header class="header">
    <div class="header-left">
      <button type="button" class="menu-btn" @click="$emit('toggle-sidebar')">☰</button>
      <nav class="header-crumb" aria-label="Breadcrumb">
        Workspace <span class="header-crumb-current">/ {{ pageTitle }}</span>
      </nav>
    </div>
    <div class="header-right">
      <span class="status-pill" :class="{ offline: isOffline }">
        <span class="status-dot"></span>{{ isOffline ? 'Offline' : 'Online' }}
      </span>
      <svg
        class="header-bell"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 10-12 0c0 3-1.5 4.5-1.5 6.5h15C18 12.5 18 11 18 8z" />
        <path d="M10 19a2 2 0 004 0" />
      </svg>
      <HeaderActions />
    </div>
  </header>
  <NetworkStatusBanner />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useNetworkStatus } from '@/composables/useNetworkStatus';

defineEmits(['toggle-sidebar']);

const route = useRoute();
const { isOffline } = useNetworkStatus();
const pageTitle = computed(() => (route.meta.title as string) || '');
</script>

<style scoped>
.header-crumb {
  font-size: 13px;
  color: var(--text-muted);
}

.header-crumb-current {
  color: var(--text);
  font-weight: 600;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--radius-pill);
  background: var(--success-light);
  color: var(--success);
  font-size: 11.5px;
  font-weight: 600;
}

.status-pill.offline {
  background: var(--danger-light);
  color: var(--danger);
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.header-bell {
  color: var(--text-muted);
}
</style>
