<template>
  <div class="user-menu" @click="toggleDropdown">
    <UserAvatar :name="user?.name" />
    <UserInfo :name="user?.name" :email="user?.email" />
    <svg class="user-menu-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    <UserDropdown :open="dropdownOpen" :user="user" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
const { user } = useAuthStore();

const dropdownOpen = ref(false);

function toggleDropdown(e: MouseEvent) {
  e.stopPropagation();
  dropdownOpen.value = !dropdownOpen.value;
}

function closeDropdown() {
  dropdownOpen.value = false;
}

function handleClickOutside() {
  closeDropdown();
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.user-menu-chevron {
  flex-shrink: 0;
  margin-left: auto;
  color: var(--text-muted);
}
</style>
