<template>
  <div id="forgotContainer" class="auth-login-container">
    <div class="auth-logo">
      <div class="auth-logo-mark">{}</div>
      <h1 class="auth-welcome-text">Forgot password?</h1>
      <p class="auth-subtitle">Enter your email and we will send you a reset link.</p>
    </div>
    <ProMessage />
    <form novalidate @submit.prevent="sendResetLink">
      <ProGrid :columns="1">
        <div class="form-group mb-4">
          <label class="form-label" for="forgotEmail">Email address</label>
          <input
            id="forgotEmail"
            v-model="pageData.email"
            class="form-input"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
          />
          <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full"
          :class="{ 'btn-loading': loading }"
          :disabled="loading"
        >
          <span v-if="loading">Sending...</span>
          <span v-else>Send reset link</span>
        </button>
      </ProGrid>
    </form>
    <div class="auth-back">
      <RouterLink to="/authorize/login" class="link">Back to login</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForgotPassword } from '@/composables/useForgotPassword';

const { pageData, errors, loading, sendResetLink } = useForgotPassword();
</script>

<style scoped>
.form-error {
  color: var(--danger);
  font-size: 0.85em;
  margin-top: 4px;
}

.auth-back {
  margin-top: 1.25rem;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
}
</style>
