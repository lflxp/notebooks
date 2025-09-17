import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Tasks } from '@/features/tasks'
import { priorities, statuses } from '@/features/tasks/data/data'
import Layout from "@/components/layout/layout";

const taskSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  priority: z
    .array(z.enum(priorities.map((priority) => priority.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/tasks/')({
  validateSearch: taskSearchSchema,
  component: () => (
    <Layout children={<Tasks />} topNav={topNav} />
  ),
})

const topNav = [
  {
    title: '概览',
    href: '/',
    isActive: false,
    disabled: false,
  },
  {
    title: '任务',
    href: '/tasks',
    isActive: true,
    disabled: true,
  },
]
