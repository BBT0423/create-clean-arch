<template>
  <div id="resetContainer" class="auth-login-container">
    <div class="auth-logo">
      <div class="auth-logo-mark">{}</div>
      <h1 class="auth-welcome-text">Reset password</h1>
      <p class="auth-subtitle">Choose a new password for your account.</p>
    </div>
    <ProMessage />
    <form novalidate @submit.prevent="resetPassword">
      <ProGrid :columns="1">
        <div class="form-group">
          <label class="form-label" for="resetEmail">Email address</label>
          <input
            id="resetEmail"
            v-model="pageData.email"
            class="form-input"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
          />
          <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="newPassword">New password</label>
          <input
            id="newPassword"
            v-model="pageData.newPassword"
            class="form-input"
            type="password"
            placeholder="Enter your new password"
            autocomplete="new-password"
          />
          <div v-if="errors.newPassword" class="form-error">{{ errors.newPassword }}</div>
        </div>

        <ul class="requirements">
          <li v-for="req in requirements" :key="req.label" :class="{ met: req.met }">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M5 12.5l4.5 4.5L19 7.5"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            {{ req.label }}
          </li>
        </ul>

        <div class="form-group mb-4">
          <label class="form-label" for="confirmPassword">Confirm new password</label>
          <input
            id="confirmPassword"
            v-model="pageData.confirmPassword"
            class="form-input"
            type="password"
            placeholder="Confirm your new password"
            autocomplete="new-password"
          />
          <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :class="{ 'btn-loading': loading }"
          :disabled="loading"
        >
          <span v-if="loading">Resetting...</span>
          <span v-else>Reset password</span>
        </button>
      </ProGrid>
    </form>
    <div class="auth-back">
      <RouterLink to="/authorize/login" class="link">Back to login</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useResetPassword } from '@/composables/useResetPassword';

const { pageData, errors, requirements, loading, resetPassword } = useResetPassword();
</script>

<style scoped>
.form-error {
  color: var(--danger);
  font-size: 0.85em;
  margin-top: 4px;
}

.requirements {
  list-style: none;
  margin: 0 0 16px;
  padding: 12px;
  background: var(--surface-dark);
  border: 1px solid var(--border);
  border-radius: var(--radius-control);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.requirements li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: var(--text-muted);
}

.requirements li svg {
  color: #9aa1ac;
}

.requirements li.met {
  color: var(--text);
}

.requirements li.met svg {
  color: var(--success);
}

.auth-back {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}
</style>
