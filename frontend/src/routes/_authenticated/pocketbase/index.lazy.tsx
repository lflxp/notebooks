import { createLazyFileRoute } from '@tanstack/react-router'
import PB from '@/features/pocketbase'
import Layout from "@/components/layout/layout";

export const Route = createLazyFileRoute('/_authenticated/pocketbase/')({
    component: () => (
        <Layout children={<PB />} topNav={topNav} />
    ),
    // You can add more options here
});

const topNav = [
  {
    title: '概览',
    href: '/',
    isActive: false,
    disabled: false,
  },
  {
    title: 'pocketbase',
    href: '/pocketbase',
    isActive: true,
    disabled: true,
  },
]