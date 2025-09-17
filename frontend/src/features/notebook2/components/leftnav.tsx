import { 
  PlusCircle, BookOpen, Bookmark,Trash2, 
  Clock, Home
} from 'lucide-react';

// 导入shadcn-ui组件
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { type Book, type Stats, Notebooks } from './model';
import { pb } from '@/lib/pocketbase';
import { toast } from "sonner"
import { useState } from 'react';

export type NavProps = {
  statsKind: Stats[]
  statsTags: Stats[]
  currentKind: string
  setCurrentKind: (kind: string) => void
  currendTag?: string
  setCurrentTag?: (tag: string) => void
  setIsNewNoteDialogOpen?: (open: boolean) => void
  books?: Book[]
  setBooks?: (books: Book[]) => void
  setKindStats?: (stats: Stats[]) => void
  setTagStats?: (stats: Stats[]) => void
  isCycle?: boolean
  setIsCycle?: (isCycle: boolean) => void
  isAll?: boolean
  setisAll?: (isAll: boolean) => void
  deletedBooks?: number
  setDeletedBooks?: (count: number) => void
  noDeletebooks?: number
  setNoDeleteBooks?: (count: number) => void
  pinneds?: number
  setPinneds?: (count: number) => void
}

export default function LeftNav({ 
  statsKind, 
  statsTags, 
  currentKind, 
  setCurrentKind, 
  currendTag, 
  setCurrentTag, 
  setIsNewNoteDialogOpen,
  books, 
  setBooks,
  setKindStats,
  setTagStats,
  isCycle,
  setIsCycle,
  isAll,
  setisAll,
  deletedBooks,
  setDeletedBooks,
  noDeletebooks,
  setNoDeleteBooks,
  pinneds,
  setPinneds
}: NavProps) {
  // 状态管理
  const { toggleSidebar } = useSidebar()
  const [ispin, setIspin] = useState(false);
  const fetchKindStats = async (isDelete: boolean, isPinned: boolean) => {
    try {
      // 拉取所有未删除的笔记
      const records = await pb.collection('notebook').getFullList<Book>({
        filter: `username = '${pb.authStore.record?.name}'`,
        sort: '-created'
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      if (!isPinned) {
        if (isDelete) {
          setBooks?.(records.filter(r => r.deleted));
        } else {
          setBooks?.(records.filter(r => !r.deleted));
        }
      } else {
        setIspin(true);
        setBooks?.(records.filter(r => r.isPinned && !r.deleted));
      }

      setNoDeleteBooks?.(records.filter(item => !item.deleted).length)

      // 前端分组统计
      const stats: Record<string, number> = {};
      const tags: Record<string, number> = {};
      // 过滤tags
      records.forEach(item => {
        const tagList = item.tags ? item.tags.split(',') : ['未标签'];
        tagList.forEach(tag => {
          tags[tag] = (tags[tag] || 0) + 1;
        });
      });

      // 过滤kind
      records.filter(item => !item.deleted).forEach(item => {
        const kind = item.kind || '未分类';
        stats[kind] = (stats[kind] || 0) + 1;
      });

      // 过滤deleted
      setDeletedBooks?.(records.filter(item => item.deleted).length);
      setPinneds?.(records.filter(item => item.isPinned && !item.deleted).length);

      // 转换为数组用于渲染
      const kindStats = Object.entries(stats).map(([kind, count]) => ({
        kind,
        count,
        icon: Notebooks.find(nb => nb.name === kind)?.icon || <Bookmark size={18} />,
        color: Notebooks.find(nb => nb.name === kind)?.color || "text-gray-500",
        gradient: Notebooks.find(nb => nb.name === kind)?.gradient || "bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600"
      }));

      const tagColors = [
        "bg-blue-500", "bg-purple-500", "bg-cyan-500", "bg-green-500", "bg-yellow-500", "bg-orange-500",
        "bg-pink-500", "bg-indigo-500", "bg-teal-500", "bg-red-500", "bg-lime-500", "bg-amber-500",
        "bg-fuchsia-500", "bg-rose-500", "bg-violet-500", "bg-emerald-500", "bg-sky-500", "bg-gray-500",
        "bg-stone-500", "bg-slate-500"
      ];
      const tagsStats = Object.entries(tags).map(([kind, count]) => ({
        kind,
        count,
        color: tagColors[Math.floor(Math.random() * tagColors.length)]
      }));

      // console.log('分类统计结果:', kindStats);
      // 你可以 setState(kindStats) 用于展示
      setKindStats?.(kindStats);
      setTagStats?.(tagsStats);
    } catch (error) {
      // console.error('分类统计错误:', error);
      toast.error('获取分类统计失败 ' + error);
    }
  };

  return (
    <>
      {/* 侧边栏 - 桌面版 */}
      <div className="hidden md:flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800">
        {/* 应用标题 */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center space-x-2" onClick={() => toggleSidebar()} >
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
            <BookOpen size={18}/>
          </div>
          <h1 className="text-xl font-bold">OHYAMA</h1>
        </div>
        
        {/* 主导航 */}
        <div className="p-2">
          <Button 
            className="w-full justify-start mb-2"
            onClick={() => setIsNewNoteDialogOpen?.(true)}
          >
            <PlusCircle size={18} className="mr-2" />
            新建笔记
          </Button>
          
          <div className="space-y-1 mt-4">
            <Button 
              variant="ghost" 
              className={cn(
                  'group hover:bg-accent hover:text-accent-foreground',
                  `flex w-full items-center justify-between rounded-md px-1 py-2 text-start text-sm`,
                  isAll && 'sm:bg-muted'
                )}
              onClick={() => {
                // console.log("全部笔记")
                setCurrentKind("")
                setCurrentTag?.("")
                fetchKindStats?.(false, false)
                setIsCycle?.(false)
                setisAll?.(true)
                setIspin(false);
                // toast.success('已刷新笔记', { position: 'top-right'})
                }}
              >
                <Home size={18} className="mr-2" />
                <div className='w-full overflow-hidden'>
                  <span>
                    全部笔记
                  </span>
                </div>
                {books && (
                  <Badge
                    className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-2 bg-yellow-500 text-white dark:bg-orange-600"
                    variant="destructive"
                  >
                    {noDeletebooks}
                  </Badge>
                )}
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Clock size={18} className="mr-2" />
              最近编辑
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                'group hover:bg-accent hover:text-accent-foreground',
                `flex w-full items-center justify-between rounded-md px-1 py-2 text-start text-sm`,
                ispin && 'sm:bg-muted'
              )}
              onClick={()=>{
                // console.log("回收站")
                setCurrentKind("")
                setCurrentTag?.("")
                fetchKindStats?.(false, true)
                setIsCycle?.(false)
                setisAll?.(false)
                setIspin(true);
              }}>
                <Bookmark size={18} className="mr-2" />
                <div className='w-full overflow-hidden'>
                  <span>
                    已固定
                  </span>
                </div>
                <Badge
                  className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-2 bg-orange-500 text-white dark:bg-orange-600"
                  variant="destructive"
                >
                  {pinneds}
                </Badge>
            </Button>
            <Button 
              variant="ghost" 
              className={cn(
                'group hover:bg-accent hover:text-accent-foreground',
                `flex w-full items-center justify-between rounded-md px-1 py-2 text-start text-sm`,
                isCycle && 'sm:bg-muted'
              )}
              onClick={()=>{
                // console.log("回收站")
                setCurrentKind("")
                setCurrentTag?.("")
                fetchKindStats?.(true, false)
                setIsCycle?.(true)
                setisAll?.(false)
                setIspin(false);
              }}>
                <Trash2 size={18} className="mr-2" />
                <div className='w-full overflow-hidden'>
                  <span className='text-red-500 font-bold dark:text-red-400'>
                    回收站
                  </span>
                </div>
                {deletedBooks && (
                  <Badge
                    className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-2 bg-red-500 text-white dark:bg-orange-600"
                    variant="destructive"
                  >
                    {deletedBooks}
                  </Badge>
                )}
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* 笔记本列表 */}
        <div className="p-2 flex-1 overflow-y-auto">
          <h3 className="px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 mt-4">
            笔记本
          </h3>
          <div className="space-y-1">
            {statsKind.map(data => (
              <Button 
                key={data.kind}
                variant="ghost" 
                className={cn(
                  'group hover:bg-accent hover:text-accent-foreground',
                  `flex w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm`,
                  data.kind === currentKind && 'sm:bg-muted'
                )}
                onClick={() => {
                  setCurrentKind(data.kind)
                  setCurrentTag?.("")
                  setisAll?.(false)
                }}
              >
                <div className='flex gap-2 items-center min-w-0'>
                  <span className={`mr-2`}>{data.icon}</span>
                  <div className='w-full overflow-hidden'>
                    <span>
                      {data.kind}
                    </span>
                  </div>
                </div>
                {data.count && (
                  <Badge
                    className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums ml-2 bg-green-500 text-white dark:bg-red-600"
                    variant="destructive"
                  >
                    {data.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          <h3 className="px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 mt-6">
            标签
          </h3>
          <div className="space-y-1">
            {statsTags.map(data => (
              <Button 
                key={data.kind}
                variant="ghost" 
                className={cn(
                  'group hover:bg-accent hover:text-accent-foreground',
                  `flex w-full items-center justify-between rounded-md px-3 py-2 text-start text-sm`,
                  data.kind === currendTag && 'sm:bg-muted',
                  `text-${data.color?.replace('bg-', '')}`
                )}
                onClick={() => {
                  setCurrentTag?.(data.kind)
                  setCurrentKind("")
                  setIsCycle?.(false)
                  setisAll?.(false)
                }}
              >
                <span className={`w-2 h-2 rounded-full mr-2 ${data.color}`}></span>
                {data.kind}
                {data.count && (
                  <Badge
                    className="ml-auto h-5 min-w-5 rounded-full px-1 font-mono tabular-nums bg-blue-500 text-white dark:bg-blue-600"
                    variant="destructive"
                  >
                    {data.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
        
        {/* 用户信息 */}
        {/* <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start">
                <Avatar className="h-8 w-8 mr-2">
                  <img src="https://picsum.photos/id/64/40/40" alt="用户头像" />
                </Avatar>
                <div className="text-left">
                  <p className="text-sm font-medium">张明</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">个人账户</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>我的账户</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User size={16} className="mr-2" /> 个人资料
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings size={16} className="mr-2" /> 设置
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDarkMode(!isDarkMode)}>
                {isDarkMode ? <Sun size={16} className="mr-2" /> : <Moon size={16} className="mr-2" />}
                {isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 dark:text-red-400">
                <LogOut size={16} className="mr-2" /> 退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div> */}
      </div>
    </>
  );
};

    