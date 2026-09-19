<template>
  <div id="otpContainer" class="auth-login-container">
    <div class="auth-logo">
      <div class="auth-logo-mark">{}</div>
      <h1 class="auth-welcome-text">Two-Factor Authentication</h1>
      <p class="auth-subtitle">Enter the 6-digit code from your authenticator app</p>
    </div>

    <ProMessage />

    <form class="otp-form" @submit.prevent="verifyOtp">
      <div class="otp-input-group">
        <input
          v-for="(digit, index) in otpDigits"
          :key="index"
          :ref="(el) => (otpInputs[index] = el as HTMLInputElement)"
          v-model="otpDigits[index]"
          type="text"
          inputmode="numeric"
          maxlength="1"
          class="otp-input"
          :class="{ 'has-error': hasError, filled: digit.length > 0 }"
          placeholder="•"
          autocomplete="off"
          :disabled="loading"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste($event)"
        />
      </div>

      <div v-if="hasError" class="form-error text-center">
        {{ errorMessage }}
      </div>

      <button
        type="submit"
        class="btn btn-primary btn-full"
        :class="{ 'btn-loading': loading }"
        :disabled="loading || !isOtpComplete"
      >
        <span v-if="loading">Verifying...</span>
        <span v-else>Verify Code</span>
      </button>

      <div class="otp-help">
        <p class="help-text">Can't access your authenticator?</p>
        <button type="button" class="btn-link" @click="goBackToLogin">Back to Login</button>
      </div>
    </form>

    <div class="app-version">v{{ appVersion }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGlobalUi } from '@/composables/useGlobalUi';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';
import { toProblemDetails } from '@/utils/utilities';
import { APP_VERSION } from '@/constants/version';
import { SecureStorage } from '@/utils/storage';
import { STORAGE_APP_LOCKED, STORAGE_LAST_ACTIVITY } from '@/constants/storage';

const router = useRouter();
const route = useRoute();
const { loading, showLoading, hideLoading, showMessage } = useGlobalUi();
const { setAuth } = useAuthStore();

const appVersion = APP_VERSION;
const otpDigits = reactive<string[]>(Array(6).fill(''));
const otpInputs = ref<HTMLInputElement[]>([]);
const hasError = ref(false);
const errorMessage = ref('');

// Get userId from route query (passed from login)
const userId = computed(() => (route.query.userId as string) || '');

const isOtpComplete = computed(() => {
  return otpDigits.every((digit) => digit.length === 1 && /^\d$/.test(digit));
});

const otpCode = computed(() => otpDigits.join(''));

onMounted(() => {
  // Check if userId exists
  if (!userId.value) {
    showMessage('Invalid access. Please login again.', 'error');
    router.push('/authorize/login');
    return;
  }

  // Focus first input
  if (otpInputs.value[0]) {
    otpInputs.value[0].focus();
  }
});

const handleInput = (index: number, event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;

  // Reset error state when user types
  hasError.value = false;
  errorMessage.value = '';

  // Only allow digits
  if (value && !/^\d$/.test(value)) {
    otpDigits[index] = '';
    return;
  }

  // Move to next input if digit is entered
  if (value && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handleKeydown = (index: number, event: KeyboardEvent) => {
  // Handle backspace
  if (event.key === 'Backspace') {
    if (!otpDigits[index] && index > 0) {
      // Move to previous input if current is empty
      otpInputs.value[index - 1]?.focus();
    }
  }
  // Handle arrow keys
  else if (event.key === 'ArrowLeft' && index > 0) {
    otpInputs.value[index - 1]?.focus();
  } else if (event.key === 'ArrowRight' && index < 5) {
    otpInputs.value[index + 1]?.focus();
  }
};

const handlePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedData = event.clipboardData?.getData('text') || '';
  const digits = pastedData.replace(/\D/g, '').slice(0, 6);

  if (digits.length === 6) {
    digits.split('').forEach((digit, index) => {
      otpDigits[index] = digit;
    });
    // Focus last input
    otpInputs.value[5]?.focus();
    hasError.value = false;
    errorMessage.value = '';
  }
};

const verifyOtp = async () => {
  if (!isOtpComplete.value) {
    hasError.value = true;
    errorMessage.value = 'Please enter all 6 digits';
    return;
  }

  showLoading();
  try {
    const { data } = await authService.verifyMfa({
      mfaCode: otpCode.value,
      userId: userId.value,
    });

    if (data.isSuccess && data.value) {
      // Set auth state
      setAuth(data.value);

      // Clear app lock state
      SecureStorage.removeItem(STORAGE_APP_LOCKED);
      localStorage.removeItem(STORAGE_LAST_ACTIVITY);

      // Navigate to admin pages
      showMessage('Login successful', 'success');
      await router.push('/pages');
      globalThis.location.reload();
    } else {
      // Handle verification failure
      hasError.value = true;
      errorMessage.value = data.error ?? 'Invalid verification code';

      // Clear inputs and focus first
      otpDigits.forEach((_, index) => {
        otpDigits[index] = '';
      });
      otpInputs.value[0]?.focus();
    }
  } catch (e: any) {
    console.error('OTP verification error:', e);
    hasError.value = true;
    const problem = toProblemDetails(e);
    errorMessage.value = problem.detail || 'Verification failed. Please try again.';

    // Clear inputs and focus first
    otpDigits.forEach((_, index) => {
      otpDigits[index] = '';
    });
    otpInputs.value[0]?.focus();
  } finally {
    hideLoading();
  }
};

const goBackToLogin = () => {
  router.push('/authorize/login');
};
</script>

<style scoped>
.otp-form {
  width: 100%;
}

.otp-input-group {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.otp-input {
  width: 34px;
  height: 40px;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 600;
  text-align: center;
  border: 1.5px solid var(--input-border);
  border-radius: var(--radius-control);
  background: var(--surface);
  color: var(--text);
  transition: all 0.15s ease;
  outline: none;
}

.otp-input.filled {
  border-color: var(--primary);
}

.otp-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 84, 233, 0.12);
}

.otp-input.has-error {
  border-color: var(--danger);
  animation: shake 0.3s ease;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.otp-input:disabled {
  background-color: var(--surface-dark);
  cursor: not-allowed;
  opacity: 0.6;
}

.text-center {
  text-align: center;
}

.otp-help {
  margin-top: 1.5rem;
  text-align: center;
}

.help-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.btn-link {
  background: none;
  border: none;
  color: var(--active-nav-text);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem;
}

.btn-link:hover {
  color: var(--active-nav-text);
  text-decoration: underline;
}
</style>
