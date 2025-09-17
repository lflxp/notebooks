import { 
  PlusCircle, BookOpen, Bookmark,Trash2, 
  Clock, Home
} from 'lucide-react';

export type Book = {
  id?: number | string
  kind: string
  title: string
  content: any[]
  tags?: string
  isPinned?: boolean
  deleted?: boolean
  created?: string
  updated?: string
  username: string
}

export type Stats = {
  kind: string
  count: number
  icon?: React.ReactNode
  color?: string
  gradient?: string 
}

export const Notebooks = [
  { 
    id: 1, 
    name: "设计笔记", 
    icon: <BookOpen size={18} stroke="currentColor" className="text-blue-500" />, 
    color: "text-blue-500", 
    gradient: "bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600" 
  },
  { 
    id: 2, 
    name: "工作项目", 
    icon: <Bookmark size={18} stroke="currentColor" className="text-purple-500" />, 
    color: "text-purple-500", 
    gradient: "bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600" 
  },
  { 
    id: 3, 
    name: "学习笔记", 
    icon: <PlusCircle size={18} stroke="currentColor" className="text-cyan-500" />, 
    color: "text-cyan-500", 
    gradient: "bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600" 
  },
  { 
    id: 4, 
    name: "生活琐事", 
    icon: <Home size={18} stroke="currentColor" className="text-green-500" />, 
    color: "text-green-500", 
    gradient: "bg-gradient-to-r from-green-400 via-green-500 to-green-600" 
  },
  { 
    id: 5, 
    name: "奇思妙想", 
    icon: <Clock size={18} stroke="currentColor" className="text-yellow-500" />, 
    color: "text-yellow-500", 
    gradient: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600" 
  },
  { 
    id: 6, 
    name: "经典爽文", 
    icon: <Trash2 size={18} stroke="currentColor" className="text-pink-500" />, 
    color: "text-pink-500", 
    gradient: "bg-gradient-to-r from-pink-400 via-pink-500 to-pink-600" 
  },
  { 
    id: 7, 
    name: "收藏备用", 
    icon: <BookOpen size={18} stroke="currentColor" className="text-orange-500" />, 
    color: "text-orange-500", 
    gradient: "bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600" 
  },
  { 
    id: 8, 
    name: "佛系", 
    icon: <Bookmark size={18} stroke="currentColor" className="text-red-600" />, 
    color: "text-red-600", 
    gradient: "bg-gradient-to-r from-red-400 via-red-500 to-red-600" 
  },
];