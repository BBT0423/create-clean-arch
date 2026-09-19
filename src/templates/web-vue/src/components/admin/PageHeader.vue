<template>
  <div class="page-header">
    <div>
      <h1 v-if="pageTitle" class="page-title">{{ pageTitle }}</h1>
      <p v-if="pageSubtitle" class="page-subtitle">{{ pageSubtitle }}</p>
    </div>
    <div class="action-left">
      <slot name="actions-left" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const pageTitle = computed(() => route.meta.title || '');
const pageSubtitle = computed(() => route.meta.subtitle || '');
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 20px;
}

.page-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
}

.page-subtitle {
  margin-top: 4px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.action-left {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}
</style>
