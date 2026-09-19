<template>
  <PageHeader />

  <div class="settings">
    <aside class="settings-side">
      <div class="settings-user">
        <div class="settings-avatar">{{ initials }}</div>
        <div class="settings-name">{{ displayName }}</div>
        <div class="settings-email">{{ userInfo?.email }}</div>
      </div>
      <div class="settings-tabs" role="tablist" aria-orientation="vertical">
        <button
          v-for="t in tabs"
          :key="t.id"
          type="button"
          role="tab"
          class="settings-tab"
          :class="{ active: activeTab === t.id }"
          :aria-selected="activeTab === t.id"
          @click="activeTab = t.id"
        >
          {{ t.label }}
        </button>
      </div>
    </aside>

    <section class="settings-panel" role="tabpanel">
      <ProMessage />

      <template v-if="activeTab === 'profile'">
        <h3 class="panel-title">Profile</h3>
        <ProGrid :columns="2">
          <div class="form-group">
            <label class="form-label" for="firstName">First Name</label>
            <input id="firstName" v-model="formData.firstName" class="form-input" readonly />
          </div>
          <div class="form-group">
            <label class="form-label" for="lastName">Last Name</label>
            <input id="lastName" v-model="formData.lastName" class="form-input" readonly />
          </div>
          <div class="form-group">
            <label class="form-label" for="email">Email Address</label>
            <input id="email" v-model="formData.email" class="form-input" type="email" readonly />
          </div>
          <div class="form-group">
            <label class="form-label" for="userName">Username</label>
            <input id="userName" v-model="formData.userName" class="form-input" readonly />
          </div>
        </ProGrid>

        <h3 class="panel-title panel-title-spaced">Account</h3>
        <div class="info-list">
          <div class="info-item">
            <span class="info-label">User ID</span>
            <span class="info-value">{{ userInfo?.id }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Account Created</span>
            <span class="info-value">{{
              formatDate(userInfo?.metadata?.createdAt as string)
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Last Login</span>
            <span class="info-value">{{
              formatDate(userInfo?.metadata?.lastLogin as string)
            }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Email Verified</span>
            <span
              class="pill"
              :class="userInfo?.metadata?.emailConfirmed ? 'pill-success' : 'pill-warning'"
            >
              {{ userInfo?.metadata?.emailConfirmed ? 'Verified' : 'Not Verified' }}
            </span>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'security'">
        <h3 class="panel-title">Security</h3>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <h4 class="setting-title">Change Password</h4>
              <p class="setting-description">Update your password to keep your account secure</p>
            </div>
            <button class="btn btn-outline" @click="navigateToChangePassword">Change</button>
          </div>
          <div class="setting-item">
            <div>
              <h4 class="setting-title">Two-Factor Authentication</h4>
              <p class="setting-description">
                {{
                  userInfo?.metadata?.isMfaEnabled
                    ? 'MFA is currently enabled'
                    : 'Add an extra layer of security'
                }}
              </p>
            </div>
            <button
              v-if="!userInfo?.metadata?.isMfaEnabled"
              class="btn btn-outline"
              :disabled="loading"
              @click="enableMfa"
            >
              Enable MFA
            </button>
            <span v-else class="pill pill-success">Enabled</span>
          </div>
        </div>
      </template>

      <template v-else>
        <h3 class="panel-title">Notifications</h3>
        <div class="setting-list">
          <div class="setting-item">
            <div>
              <h4 class="setting-title">Email notifications</h4>
              <p class="setting-description">Receive account activity by email</p>
            </div>
            <button
              type="button"
              class="switch"
              role="switch"
              aria-label="Email notifications"
              :aria-checked="notifications.email"
              :class="{ on: notifications.email }"
              @click="notifications.email = !notifications.email"
            ></button>
          </div>
          <div class="setting-item">
            <div>
              <h4 class="setting-title">Product updates</h4>
              <p class="setting-description">News about new features and releases</p>
            </div>
            <button
              type="button"
              class="switch"
              role="switch"
              aria-label="Product updates"
              :aria-checked="notifications.product"
              :class="{ on: notifications.product }"
              @click="notifications.product = !notifications.product"
            ></button>
          </div>
        </div>
      </template>
    </section>

    <!-- MFA Setup Modal -->
    <ProModal
      v-model:show="showMfaModal"
      title="Set Up Two-Factor Authentication"
      size="md"
      :show-footer="false"
      :close-on-overlay-click="true"
      @close="closeMfaModal"
    >
      <div class="mfa-instructions">
        <p class="instruction-text">
          Scan this QR code with your authenticator app (Google Authenticator, Microsoft
          Authenticator, Authy, etc.)
        </p>
      </div>

      <div class="qr-code-container">
        <canvas ref="qrCanvas"></canvas>
      </div>

      <div v-if="mfaData?.sharedKey" class="manual-entry">
        <p class="manual-entry-label">Or enter this code manually:</p>
        <div class="secret-code">
          <code>{{ mfaData.sharedKey }}</code>
          <button class="btn-copy" title="Copy to clipboard" @click="copySecret">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          </button>
        </div>
      </div>

      <form class="confirm-form" novalidate @submit.prevent="confirmMfa">
        <label class="form-label" for="mfaCode"
          >Enter the 6-digit code from your app to finish</label
        >
        <input
          id="mfaCode"
          v-model="mfaCode"
          class="form-input mfa-code-input"
          inputmode="numeric"
          maxlength="6"
          autocomplete="one-time-code"
          placeholder="000000"
        />
        <div v-if="mfaError" class="form-error">{{ mfaError }}</div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeMfaModal">Cancel</button>
          <button
            type="submit"
            class="btn btn-primary"
            :class="{ 'btn-loading': confirming }"
            :disabled="confirming || mfaCode.length !== 6"
          >
            Verify &amp; enable
          </button>
        </div>
      </form>
    </ProModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGlobalUi } from '@/composables/useGlobalUi';
import { userService } from '@/services/userService';
import { toProblemDetails } from '@/utils/utilities';
import QRCode from 'qrcode';
import { type EnableMfaResponse } from '@/types';

const router = useRouter();

const authStore = useAuthStore();
const { loading, showLoading, hideLoading, showMessage } = useGlobalUi();

const userInfo = computed(() => authStore.user);

type SettingsTab = 'profile' | 'security' | 'notifications';
const tabs: { id: SettingsTab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'notifications', label: 'Notifications' },
];
const activeTab = ref<SettingsTab>('profile');

const displayName = computed(() => userInfo.value?.name || userInfo.value?.email || 'User');
const initials = computed(() =>
  displayName.value
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
);

// Demo-only preferences: no backend endpoint stores these.
const notifications = reactive({ email: true, product: false });

const showMfaModal = ref(false);
const mfaData = ref<EnableMfaResponse | null>(null);
const qrCanvas = ref<HTMLCanvasElement | null>(null);

const formData = reactive({
  firstName: '',
  lastName: '',
  email: '',
  userName: '',
});

const loadUserData = () => {
  if (userInfo.value) {
    formData.firstName = (userInfo.value.metadata?.firstName as string) || '';
    formData.lastName = (userInfo.value.metadata?.lastName as string) || '';
    formData.email = userInfo.value.email || '';
    formData.userName = (userInfo.value.metadata?.userName as string) || userInfo.value.email || '';
  }
};

const navigateToChangePassword = () => {
  router.push('/authorize/change-password');
};

onMounted(() => {
  loadUserData();
});

const enableMfa = async () => {
  showLoading();
  try {
    const { data } = await userService.enableMfa();
    if (data.isSuccess && data.value) {
      mfaData.value = data.value;
      showMfaModal.value = true;

      // Generate QR code after modal is shown
      await nextTick();
      await generateQrCode();

      showMessage(
        'MFA setup initiated. Please scan the QR code with your authenticator app.',
        'success'
      );
    } else {
      showMessage(data.error || 'Failed to enable MFA', 'error');
    }
  } catch (error: any) {
    console.error('Enable MFA error:', error);
    showMessage(toProblemDetails(error));
  } finally {
    hideLoading();
  }
};

const generateQrCode = async () => {
  if (!qrCanvas.value || !mfaData.value) return;

  try {
    // Use authenticatorUri from backend response
    const authenticatorUri = mfaData.value.authenticatorUri;

    await QRCode.toCanvas(qrCanvas.value, authenticatorUri, {
      width: 256,
      margin: 2,
      color: {
        dark: '#1a202c',
        light: '#ffffff',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    showMessage('Failed to generate QR code', 'error');
  }
};

const mfaCode = ref('');
const mfaError = ref('');
const confirming = ref(false);

const closeMfaModal = () => {
  showMfaModal.value = false;
  mfaData.value = null;
  mfaCode.value = '';
  mfaError.value = '';
};

// MFA only becomes active on the server once this code is verified.
const confirmMfa = async () => {
  mfaError.value = '';
  confirming.value = true;
  try {
    const { data } = await userService.confirmMfa(mfaCode.value);
    if (data.isSuccess) {
      authStore.updateUserMetadata({ ...authStore.user?.metadata, isMfaEnabled: true });
      closeMfaModal();
      showMessage('Two-factor authentication is now enabled.', 'success');
    } else {
      mfaError.value = data.error || 'Invalid verification code.';
    }
  } catch (error: any) {
    console.error('Confirm MFA error:', error);
    mfaError.value = toProblemDetails(error).detail || 'Verification failed. Please try again.';
  } finally {
    confirming.value = false;
  }
};

const copySecret = async () => {
  if (!mfaData.value?.sharedKey) return;

  try {
    await navigator.clipboard.writeText(mfaData.value.sharedKey);
    showMessage('Secret copied to clipboard', 'success');
  } catch (error) {
    console.error('Copy error:', error);
    showMessage('Failed to copy secret', 'error');
  }
};

const formatDate = (date: string | undefined) => {
  if (!date) return 'N/A';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
</script>

<style scoped>
.settings {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.settings-user {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 8px 0 16px;
}

.settings-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
}

.settings-name {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.settings-email {
  font-size: 12px;
  color: var(--text-muted);
  word-break: break-all;
}

.settings-tabs {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.settings-tab {
  text-align: left;
  padding: 9px 12px;
  border: none;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.settings-tab:hover {
  background: rgba(0, 84, 233, 0.05);
}

.settings-tab.active {
  background: var(--active-nav-bg);
  color: var(--active-nav-text);
}

.settings-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 24px;
  min-width: 0;
}

.panel-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
}

.panel-title-spaced {
  margin-top: 28px;
}

.setting-list,
.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-item,
.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 14px 16px;
  background: var(--surface-dark);
  border-radius: var(--radius-control);
}

.setting-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  margin: 0 0 2px;
}

.setting-description {
  font-size: 12.5px;
  color: var(--text-muted);
  margin: 0;
}

.info-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
}

.info-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--text);
  word-break: break-all;
  text-align: right;
}

.pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
}

.pill-success {
  background: var(--success-light);
  color: var(--success-dark);
}

.pill-warning {
  background: var(--warning-light);
  color: var(--warning-dark);
}

.switch {
  position: relative;
  flex-shrink: 0;
  width: 38px;
  height: 22px;
  border: none;
  border-radius: var(--radius-pill);
  background: var(--input-border);
  cursor: pointer;
  transition: background 0.15s ease;
}

.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.15s ease;
}

.switch.on {
  background: var(--primary);
}

.switch.on::after {
  transform: translateX(16px);
}

/* MFA Modal Styles */
.mfa-instructions {
  margin-bottom: 1.5rem;
}

.instruction-text {
  font-size: 0.95rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: var(--surface-dark);
  border-radius: var(--radius-card);
  margin-bottom: 1.5rem;
}

.qr-code-container canvas {
  border-radius: var(--radius-control);
  background: white;
  padding: 1rem;
}

.manual-entry {
  background: var(--surface-dark);
  padding: 1.25rem;
  border-radius: var(--radius-control);
  text-align: center;
  margin-bottom: 1.5rem;
}

.manual-entry-label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin: 0 0 0.75rem 0;
  font-weight: 600;
}

.secret-code {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: var(--surface);
  padding: 0.75rem 1rem;
  border-radius: var(--radius-control);
  border: 2px dashed var(--input-border);
}

.secret-code code {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--primary);
  font-weight: 600;
  letter-spacing: 0.05em;
}

.btn-copy {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--primary);
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.btn-copy:hover {
  background: var(--surface-dark);
}

.confirm-form {
  margin-top: 0.5rem;
}

.mfa-code-input {
  margin-top: 6px;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  letter-spacing: 0.3em;
  text-align: center;
}

.form-error {
  color: var(--danger);
  font-size: 0.85em;
  margin-top: 6px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .settings {
    grid-template-columns: 1fr;
  }

  .settings-user {
    flex-direction: row;
    gap: 12px;
    text-align: left;
  }

  .settings-name {
    margin-top: 0;
  }

  .settings-tabs {
    flex-direction: row;
    overflow-x: auto;
  }
}
</style>
