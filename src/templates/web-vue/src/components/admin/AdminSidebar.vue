<template>
  <aside :class="['sidebar', { open: props.open, collapsed: props.collapsed }]">
    <button
      class="sidebar-collapse-toggle"
      type="button"
      :aria-label="props.collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      @click="emit('toggle-sidebar')"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 6l-6 6 6 6"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>
    <div class="sidebar-inner">
      <div class="sidebar-content-wrapper">
        <div class="sidebar-content">
          <div class="sidebar-header">
            <SidebarLogo />
            <button
              class="toggle-sidebar"
              aria-label="Close sidebar"
              type="button"
              @click="emit('close-sidebar')"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
          <nav class="nav-menu">
            <SidebarSection
              v-for="section in menuSections"
              :key="section.title"
              :title="section.title"
            >
              <div
                v-for="item in section.items"
                :key="item.label"
                class="nav-item-wrap"
                @mouseenter="onNavHover(item, $event)"
                @mouseleave="clearNavHover"
              >
                <SidebarNavItem :href="item.href" :active="isLeafActive(item)">
                  <template #icon><span v-html="item.icon"></span></template>
                  {{ item.label }}
                </SidebarNavItem>
              </div>
            </SidebarSection>
          </nav>
        </div>

        <div class="sidebar-user-footer">
          <UserMenu />
        </div>

        <div class="sidebar-version">v{{ appVersion }}</div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="props.collapsed && hoverItem && hoverRect"
        class="nav-tooltip"
        :style="tooltipStyle"
      >
        {{ hoverItem.label }}
      </div>
    </Teleport>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { APP_VERSION } from '@/constants/version';
import SidebarLogo from '@/components/admin/SidebarLogo.vue';
import SidebarSection from '@/components/admin/SidebarSection.vue';
import SidebarNavItem from '@/components/admin/SidebarNavItem.vue';
import UserMenu from '@/components/admin/UserMenu.vue';

const appVersion = APP_VERSION;

const props = defineProps<{ open: boolean; collapsed?: boolean }>();
const emit = defineEmits(['toggle-sidebar', 'close-sidebar']);

const route = useRoute();
interface MenuItem {
  icon: string;
  label: string;
  href: string;
}

const hoverItem = ref<MenuItem | null>(null);
const hoverRect = ref<DOMRect | null>(null);
let clearHoverTimeout: ReturnType<typeof setTimeout> | null = null;

function onNavHover(item: MenuItem, event: MouseEvent) {
  if (clearHoverTimeout) {
    clearTimeout(clearHoverTimeout);
    clearHoverTimeout = null;
  }
  hoverItem.value = item;
  hoverRect.value = (event.currentTarget as HTMLElement).getBoundingClientRect();
}

function clearNavHover() {
  // Small delay so the pointer can travel from the trigger into the teleported flyout/tooltip.
  clearHoverTimeout = setTimeout(() => {
    hoverItem.value = null;
    hoverRect.value = null;
  }, 80);
}

const tooltipStyle = computed(() => {
  if (!hoverRect.value) return {};
  return {
    top: `${hoverRect.value.top + hoverRect.value.height / 2}px`,
    left: `${hoverRect.value.right + 12}px`,
  };
});

const icons = {
  dashboard:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/><rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.8"/></svg>',
  settings:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v3m0 14v3M4.2 4.2l2.1 2.1m11.4 11.4l2.1 2.1M2 12h3m14 0h3M4.2 19.8l2.1-2.1m11.4-11.4l2.1-2.1" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
};

const menuSections = computed(() => {
  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: 'Workspace',
      items: [{ icon: icons.dashboard, label: 'Dashboard', href: '/pages/dashboard' }],
    },
    {
      title: 'System',
      items: [{ icon: icons.settings, label: 'Settings', href: '/pages/users/profile' }],
    },
  ];

  return sections.filter((section) => section.items.length > 0);
});

function isLeafActive(item: MenuItem) {
  return route.path === item.href;
}
</script>

<style scoped>
.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  flex: 1;
}

.sidebar-content {
  flex: 1;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sidebar-version {
  width: 100%;
  padding: 0.48rem 0;
  text-align: center;
  font-size: 0.72rem;
  color: var(--layout-text);
  background: var(--layout-bg);
  border-top: 1px solid var(--layout-border);
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.toggle-sidebar {
  background: none;
  border: none;
  padding: 0.25rem;
  margin-left: 0.5rem;
  cursor: pointer;
  color: #4a5568;
  display: none;
}

@media (max-width: 1024px) {
  .toggle-sidebar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
}

.toggle-sidebar svg {
  width: 1.5rem;
  height: 1.5rem;
}

.sidebar-collapse-toggle {
  display: none;
  position: absolute;
  top: 22px;
  right: -13px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
  color: var(--text-muted);
  cursor: pointer;
  z-index: 1001;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.sidebar-collapse-toggle:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}

.sidebar.collapsed .sidebar-collapse-toggle svg {
  transform: rotate(180deg);
}

@media (min-width: 1025px) {
  .sidebar-collapse-toggle {
    display: flex;
  }
}

.sidebar-user-footer {
  flex-shrink: 0;
  padding: 8px 12px;
  border-top: 1px solid var(--layout-border);
}

.sidebar-user-footer :deep(.avatar) {
  width: 30px;
  height: 30px;
  font-size: 0.7rem;
}

.sidebar.collapsed .sidebar-header {
  justify-content: center;
  padding-left: 0;
  padding-right: 0;
}

.sidebar.collapsed .sidebar-header :deep(.sidebar-brand-text) {
  display: none;
}

.sidebar.collapsed .sidebar-user-footer :deep(.user-menu) {
  justify-content: center;
  gap: 0;
}

.sidebar.collapsed .sidebar-user-footer :deep(.user-menu > .user-info),
.sidebar.collapsed .sidebar-user-footer :deep(.user-menu > .user-menu-chevron) {
  display: none;
}

.nav-item-wrap {
  position: relative;
  margin: 2px 12px;
}

.sidebar.collapsed .nav-item-wrap {
  margin-left: 6px;
  margin-right: 6px;
}

.nav-tooltip {
  position: fixed;
  transform: translateY(-50%) translateX(-4px);
  background: #1c1c26;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  padding: 6px 10px;
  border-radius: 8px;
  z-index: 1002;
  pointer-events: none;
  animation: tooltip-in 0.12s ease-out forwards;
}

@keyframes tooltip-in {
  from {
    opacity: 0;
    transform: translateY(-50%) translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(-50%) translateX(0);
  }
}
</style>
