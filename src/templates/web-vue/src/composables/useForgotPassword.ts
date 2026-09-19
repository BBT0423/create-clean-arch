import { reactive } from 'vue';
import { useGlobalUi } from '@/composables/useGlobalUi';
import { authService } from '@/services/authService';
import { toProblemDetails } from '@/utils/utilities';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useForgotPassword = () => {
  const { loading, showLoading, hideLoading, showMessage } = useGlobalUi();
  const pageData = reactive({ email: '' });
  const errors = reactive({ email: '' });

  const validate = (): boolean => {
    errors.email = '';
    if (!pageData.email) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_PATTERN.test(pageData.email.trim())) {
      errors.email = 'Invalid email address.';
    }
    return !errors.email;
  };

  const sendResetLink = async () => {
    if (!validate()) return;

    showLoading();
    try {
      const { data } = await authService.forgotPassword({ email: pageData.email.trim() });
      if (data.isSuccess) {
        showMessage('If the email is registered, a reset link has been sent.', 'success');
      } else {
        showMessage(data.error || 'Failed to send reset link.', 'error');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      showMessage(toProblemDetails(error));
    } finally {
      hideLoading();
    }
  };

  return { pageData, errors, loading, sendResetLink };
};
