export const UserRoutes = [
  {
    path: '',
    redirect: { name: 'Dashboard' },
  },
  {
    path: 'dashboard',
    name: 'Dashboard',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: {
      title: 'Dashboard',
      subtitle: 'Overview of your workspace',
    },
  },
  {
    path: 'users/profile',
    name: 'UserProfile',
    component: () => import('@/views/user/ProfileView.vue'),
    meta: {
      title: 'Settings',
      subtitle: 'Manage your account information and settings',
    },
  },
];
