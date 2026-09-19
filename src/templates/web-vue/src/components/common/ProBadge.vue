<template>
  <span class="pro-badge" :class="badgeClass" :style="badgeStyle">
    <span v-if="showDot" class="status-dot" :class="badgeClass" :style="badgeStyle"></span>
    <slot>{{ statusText }}</slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  statusId?: number | null;
  statusBgColor?: string;
  statusBorderColor?: string;
  statusFontColor?: string;
  statusFontSize?: number;
  text?: string;
  hasDot?: boolean;
}>();

const showDot = computed(() => props.hasDot);

const statusClassMap = {
  100: 'warning',
  150: 'danger',
  200: 'info',
  300: 'warning',
  400: 'warning',
  500: 'success',
  2000: 'cancelled',
} as const;

const statusTextMap = {
  100: 'Pending',
  150: 'Rejected',
  200: 'Approved',
  300: 'Preparing',
  400: 'Waiting',
  500: 'Completed',
  2000: 'Cancelled',
} as const;

const badgeClass = computed(() => {
  if (props.statusBgColor || props.statusFontColor || props.statusBorderColor) {
    return {};
  }
  const id = props.statusId;
  if (id == null) {
    return { info: true };
  }
  const statusClass = statusClassMap[id as keyof typeof statusClassMap] || 'info';
  return { [statusClass]: true };
});

const badgeStyle = computed(() => {
  const style: Record<string, string> = {};
  if (props.statusBgColor) style.background = props.statusBgColor;
  if (props.statusBorderColor) style.borderColor = props.statusBorderColor;
  if (props.statusFontColor) style.color = props.statusFontColor;
  if (props.statusFontSize) style.fontSize = props.statusFontSize + 'px';
  return style;
});

const statusText = computed(() => {
  if (props.text) return props.text;
  const id = props.statusId;
  if (id == null) return 'Unknown Status';
  return statusTextMap[id as keyof typeof statusTextMap] || 'Unknown';
});
</script>

<style scoped>
.pro-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  font-weight: 700;
  background: var(--badge-bg, var(--surface-dark));
  color: var(--text);
  white-space: nowrap;
  border: 1px solid transparent;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 6px;
  display: inline-block;
  background: currentColor;
}

.success {
  background: var(--success-light);
  color: var(--success-dark);
}

.warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.danger {
  background: var(--danger-light);
  color: var(--danger-dark);
}

.info {
  background: var(--info-bg);
  color: var(--info-text);
}

.cancelled {
  background: var(--surface-dark);
  color: var(--text-muted);
}
</style>
