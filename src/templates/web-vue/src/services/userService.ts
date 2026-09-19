import type { ChangePasswordRequest, EnableMfaResponse, Result } from '@/types';
import { httpClient } from '@/utils/httpClient';

export const userService = {
  /**
   * POST /api/user/mfa/enable
   * Enable Multi-Factor Authentication for the current user
   */
  async enableMfa() {
    return httpClient.post<Result<EnableMfaResponse>>(`/api/user/mfa/enable`);
  },

  /**
   * POST /api/user/mfa/confirm
   * Confirm MFA setup with a code from the authenticator app; MFA is only active after this succeeds
   */
  async confirmMfa(code: string) {
    return httpClient.post<Result<boolean>>(`/api/user/mfa/confirm`, { code });
  },

  /**
   * POST /api/user/change-password
   * Change password for the current user
   */
  async changePassword(request: ChangePasswordRequest) {
    return httpClient.post<Result<void>>(`/api/user/change-password`, request);
  },
};
