import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { pb } from '@/lib/pocketbase';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedLayout,
  beforeLoad: async ({ navigate }) => {
    // 检查认证状态
    if (!pb.authStore.isValid) {
      // 未登录则重定向到登录页
      navigate({
        to: '/sign-in',
        search: { redirect: window.location.pathname },
      });
    }
  },
})
