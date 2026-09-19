import { computed, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGlobalUi } from '@/composables/useGlobalUi';
import { authService } from '@/services/authService';
import { toProblemDetails } from '@/utils/utilities';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INVALID_LINK_MESSAGE = 'This reset link is invalid or incomplete. Request a new one.';

export const useResetPassword = () => {
  const route = useRoute();
  const router = useRouter();
  const { loading, showLoading, hideLoading, showMessage } = useGlobalUi();

  const token = computed(() => (route.query.token as string) || '');
  const pageData = reactive({ email: '', newPassword: '', confirmPassword: '' });
  const errors = reactive({ email: '', newPassword: '', confirmPassword: '' });

  // Mirrors the backend Identity password policy.
  const requirements = computed(() => {
    const password = pageData.newPassword;
    return [
      { label: 'At least 8 characters', met: password.length >= 8 },
      { label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { label: 'One number', met: /\d/.test(password) },
      { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
      { label: 'At least 4 unique characters', met: new Set(password).size >= 4 },
    ];
  });

  onMounted(() => {
    if (!token.value) {
      showMessage(INVALID_LINK_MESSAGE, 'error');
    }
  });

  const validate = (): boolean => {
    errors.email = '';
    errors.newPassword = '';
    errors.confirmPassword = '';

    if (!pageData.email) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(pageData.email.trim())) {
      errors.email = 'Invalid email address.';
    }
    if (!requirements.value.every((r) => r.met)) {
      errors.newPassword = 'Password does not meet all requirements.';
    }
    if (pageData.confirmPassword !== pageData.newPassword) {
      errors.confirmPassword = 'Values do not match.';
    }
    return !errors.email && !errors.newPassword && !errors.confirmPassword;
  };

  const resetPassword = async () => {
    if (!token.value) {
      showMessage(INVALID_LINK_MESSAGE, 'error');
      return;
    }
    if (!validate()) return;

    showLoading();
    try {
      const { data } = await authService.resetPassword({
        email: pageData.email.trim(),
        token: token.value,
        newPassword: pageData.newPassword,
      });
      if (data.isSuccess) {
        await router.push('/authorize/login');
      } else {
        showMessage(data.error || 'Failed to reset password.', 'error');
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      showMessage(toProblemDetails(error));
    } finally {
      hideLoading();
    }
  };

  return { pageData, errors, requirements, loading, resetPassword };
};
