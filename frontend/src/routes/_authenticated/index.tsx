import { createFileRoute } from '@tanstack/react-router'
import NoteApp from '@/features/notebook2'

export const Route = createFileRoute('/_authenticated/')({
  component: NoteApp,
})

