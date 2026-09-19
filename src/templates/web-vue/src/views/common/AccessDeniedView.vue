<template>
  <div class="access-denied-container">
    <div class="icon">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" fill="var(--danger-light)" />
        <path
          d="M8 8l8 8M16 8l-8 8"
          stroke="var(--danger-dark)"
          stroke-width="2"
          stroke-linecap="round"
        />
      </svg>
    </div>
    <h2>Access denied</h2>
    <p>You do not have permission to view this page.</p>
    <router-link to="/" class="home-link">Go to initial page</router-link>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.access-denied-container {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 40px 24px;
  margin: 40px auto;
  max-width: 400px;
}

.icon {
  margin-bottom: 20px;
}

h2 {
  margin-bottom: 8px;
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
}

p {
  margin-bottom: 24px;
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
}

.home-link {
  display: inline-block;
  padding: 10px 24px;
  border-radius: var(--radius-control);
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
  background: var(--primary);
  color: #fff;
  transition: background 0.15s ease;
}

.home-link:hover {
  background: var(--primary-dark);
}
</style>
