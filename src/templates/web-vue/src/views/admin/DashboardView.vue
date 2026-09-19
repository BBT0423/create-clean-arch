<template>
  <div class="dash">
    <PageHeader>
      <template #actions-left>
        <button type="button" class="btn btn-primary">+ New</button>
      </template>
    </PageHeader>

    <div class="dash-stats">
      <div v-for="stat in stats" :key="stat.label" class="dash-stat">
        <div class="dash-stat-label">{{ stat.label }}</div>
        <div class="dash-stat-value">{{ stat.value }}</div>
      </div>
    </div>

    <div class="dash-table">
      <div class="dash-row dash-row-head">
        <div>Name</div>
        <div>Status</div>
        <div>Updated</div>
      </div>
      <div v-for="row in rows" :key="row.name" class="dash-row">
        <div>{{ row.name }}</div>
        <div>
          <span class="dash-pill" :class="row.tone">{{ row.status }}</span>
        </div>
        <div class="dash-muted">{{ row.updated }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '@/components/admin/PageHeader.vue';

const stats = [
  { label: 'Active projects', value: 12 },
  { label: 'Features generated', value: 47 },
  { label: 'Team members', value: 6 },
];

const rows = [
  { name: 'Auth / JWT baseline', status: 'Complete', tone: 'success', updated: '2 days ago' },
  { name: 'Forgot / reset password', status: 'In progress', tone: 'warning', updated: 'just now' },
];
</script>

<style scoped>
.dash {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dash-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.dash-stat {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.dash-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 24, 40, 0.1);
}

.dash-stat-label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--text-muted);
}

.dash-stat-value {
  margin-top: 6px;
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
}

.dash-table {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
}

.dash-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  align-items: center;
  padding: 13px 16px;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
  transition: background 0.15s ease;
}

.dash-row:last-child {
  border-bottom: none;
}

.dash-row:not(.dash-row-head):hover {
  background: rgba(0, 84, 233, 0.04);
}

.dash-row-head {
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.dash-muted {
  color: var(--text-muted);
}

.dash-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
}

.dash-pill.success {
  background: var(--success-light);
  color: var(--success-dark);
}

.dash-pill.warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

@media (max-width: 768px) {
  .dash-stats {
    grid-template-columns: 1fr;
  }
}
</style>
