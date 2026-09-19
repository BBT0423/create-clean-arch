<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1>404</h1>
      <h2>Page not found</h2>
      <p>Sorry, the page you are looking for does not exist or has been moved.</p>
      <router-link to="/" class="home-link">Back to safety</router-link>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(120% 120% at 50% 0%, #eef2ff 0%, #f6f7f9 60%);
}

[data-theme='dark'] .not-found-container {
  background: radial-gradient(120% 120% at 50% 0%, #151a21 0%, #0d1117 60%);
}

.not-found-content {
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  padding: 48px 32px;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
}

.not-found-content h1 {
  font-family: var(--font-mono);
  font-size: 4rem;
  font-weight: 700;
  color: var(--danger);
  margin-bottom: 0.5rem;
}

.not-found-content h2 {
  font-size: 19px;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text);
}

.not-found-content p {
  color: var(--text-muted);
  font-size: 13px;
  margin-bottom: 1.5rem;
}

.home-link {
  color: var(--active-nav-text);
  text-decoration: none;
  font-weight: 600;
  font-size: 13px;
}

.home-link:hover {
  color: var(--active-nav-text);
  text-decoration: underline;
}
</style>
