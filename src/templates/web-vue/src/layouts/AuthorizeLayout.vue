<template>
  <div class="auth-login-outer">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { STORAGE_THEME } from '@/constants/storage';
import { SecureStorage } from '@/utils/storage';
import { onMounted, provide, ref } from 'vue';

// THEME STATE (shared)
const isDark = ref(false);

function toggleTheme() {
  isDark.value = !isDark.value;
  if (isDark.value) {
    document.body.dataset.theme = 'dark';
    SecureStorage.setItem(STORAGE_THEME, 'dark');
  } else {
    delete document.body.dataset.theme;
    SecureStorage.setItem(STORAGE_THEME, 'light');
  }
}

provide('isDark', isDark);
provide('toggleTheme', toggleTheme);

onMounted(() => {
  const savedTheme = SecureStorage.getItem(STORAGE_THEME);
  if (savedTheme === 'dark') {
    isDark.value = true;
    document.body.dataset.theme = 'dark';
  }
});
</script>

<style>
.auth-login-outer {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100vw;
  background: radial-gradient(120% 120% at 50% 0%, #eef2ff 0%, #f6f7f9 60%);
  overflow: hidden;
  font-family: var(--font-ui);
}

[data-theme='dark'] .auth-login-outer {
  background: radial-gradient(120% 120% at 50% 0%, #151a21 0%, #0d1117 60%);
}

.auth-login-container {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-lg);
  padding: 40px;
  width: 100%;
  max-width: 360px;
  animation: slideUp 0.6s ease-out;
  transition:
    background-color 0.3s ease,
    border-color 0.3s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.auth-login-container:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-logo {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.auth-logo-mark {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 16px;
}

.auth-welcome-text {
  font-size: 19px;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  margin-bottom: 8px;
  margin-top: 0;
}

.auth-subtitle {
  color: var(--text-muted);
  font-size: 13px;
  text-align: center;
  margin-bottom: 24px;
}

.auth-checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.auth-checkbox {
  width: 18px;
  height: 18px;
  margin-right: 12px;
  accent-color: var(--primary);
}

.auth-checkbox-label {
  color: var(--text-light);
  font-size: 15px;
  cursor: pointer;
}

@media (max-width: 480px) {
  .auth-login-container {
    padding: 48px 24px 24px 24px;
    margin: 0;
    box-shadow: none;
    height: 100vh;
    border-radius: 0;
  }

  .auth-welcome-text {
    font-size: 20px;
  }
}

.auth-theme-toggle {
  position: absolute;
  top: 16px;
  right: 16px;
}

.app-version {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
  font-size: 0.85rem;
  color: var(--text-light);
}
</style>
