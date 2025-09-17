import { useState, useEffect } from 'react';
import { 
  Search, PlusCircle, BookOpen, Bookmark,
  Bell, Trash2,
  Clock, LayoutGrid, List, Check, 
  Moon, Sun, Home
} from 'lucide-react';

// 导入shadcn-ui组件
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { pb } from '@/lib/pocketbase';
import { toast } from "sonner"
import { type Book, type Stats, Notebooks } from './components/model';
import LeftNav from './components/leftnav';
import Note from './components/note';
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from '@/lib/utils'
import { VSCodeStyleFooter } from '@/components/layout/footer2'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'

const initData = {
    id: 1,
    title: 'title',
    kind: 'kind',
    content: [
      {
        "content": "Welcome to this demo!",
        "type": "paragraph"
      },
      {
        "content": "<- Notice the new button in the side menu",
        "type": "paragraph"
      },
      {
        "content": "Click it to remove the hovered block",
        "type": "paragraph"
      }
    ],
    username: pb.authStore.record?.name || 'unknown',
    tags: 'tag1,tag2',
    isPinned: false,
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
  }


// 模拟标签数据
const tags = [
  { id: 1, name: "设计", color: "bg-blue-500" },
  { id: 2, name: "工作", color: "bg-purple-500" },
  { id: 3, name: "React", color: "bg-cyan-500" },
  { id: 4, name: "生活", color: "bg-green-500" },
  { id: 5, name: "规范", color: "bg-yellow-500" },
  { id: 6, name: "会议", color: "bg-orange-500" },
  { id: 7, name: "创意", color: "bg-pink-500" },
  { id: 9, name: "笔记", color: "bg-purple-300" },
  { id: 8, name: "其它", color: "bg-gray-500" }
];

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffInDays === 1) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else if (diffInDays < 7) {
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${weekdays[date.getDay()]} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } else {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  }
};

export default function NoteApp() {
  // 状态管理
  const [notes, setNotes] = useState<Book[]>([initData]);
  const [selectedNote, setSelectedNote] = useState<Book | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // list 或 grid
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNewNoteDialogOpen, setIsNewNoteDialogOpen] = useState(false);
  const [newNote, setNewNote] = useState<{
    title: string;
    content: any[];
    kind: string;
    tags: string;
    isPinned?: boolean;
    username?: string;
  }>({
    title: '',
    kind: '',
    username: pb.authStore.record?.name || 'unknown',
    content: [
      {
        "content": "Welcome to this demo!",
        "type": "paragraph"
      },
      {
        "content": "<- Notice the new button in the side menu",
        "type": "paragraph"
      },
      {
        "content": "Click it to remove the hovered block",
        "type": "paragraph"
      }
    ],
    tags: '',
    isPinned: false
  });
  const [editedNote, setEditedNote] = useState<Book | null>(null);
  const [statsKind, setStatsKind] = useState<Stats[]>([]);
  const [statsTags, setStatsTags] = useState<Stats[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [currentKind, setCurrentKind] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [isCycle, setIsCycle] = useState(false);
  const [isAll, setisAll] = useState(false);
  const [deletedBooks, setDeletedBooks] = useState(0);
  const [noDeletebooks, setNoDeleteBooks] = useState(0)
  const [pinneds, setPinneds] = useState(0);

  // 分类统计示例
  const fetchKindStats = async () => {
    try {
      // 拉取所有未删除的笔记
      const records = await pb.collection('notebook').getFullList<Book>({
        filter: `username = '${pb.authStore.record?.name}'`,
        sort: '-created'
      });

      setBooks(records.filter(r => !r.deleted));
      setisAll(true)

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
      setDeletedBooks(records.filter(item => item.deleted).length);
      setNoDeleteBooks(records.filter(item => !item.deleted).length);
      setPinneds(records.filter(item => item.isPinned && !item.deleted).length);

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
      setStatsKind(kindStats);
      setStatsTags(tagsStats);
      setIsCycle(false);
    } catch (error) {
      // console.error('分类统计错误:', error);
      toast.error('获取分类统计失败 ' + error);
    }
  };

  const [editTitle, setEditTitle] = useState("");
  const updateTitle = async (title: string) => {
    if (!editedNote) return;
    try {
      setEditTitle(title)
      await pb.collection('notebook').update(String(editedNote.id), { title: title });
      setSelectedNote(prev => prev ? { ...prev, title: title } : prev);
      books.map(book => {
        if (book.id === editedNote.id) {
          book.title = title
        }
        return book
      })
      setBooks(books)
      setEditedNote(editedNote ? { ...editedNote, title: title } : editedNote)
      toast.success('已更新标题', { position: 'top-right' });
    } catch (error) {
      toast.error('Error updating note ' + editedNote.id + ': ' + error, { position: 'top-right' });
    }
  }

  const fetchNode = async (node: Book) => {
    try {
      setEditTitle(node.title)
      const record = await pb.collection('notebook').getOne<Book>(String(node.id));
      setSelectedNote(record);
    } catch (error) {
      // console.error('Error fetching note:', error);
      toast.error('Error fetching note ' + node.id + ': ' + error, { position: 'top-right' });
    }
  }

  // 获取分类统计
  useEffect(() => {
    fetchKindStats()
    setInterval(() => {
      fetchKindStats()
    }, 5 * 60 * 1000); // 每5分钟刷新一次
  }, []);

  // 切换暗黑模式
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 当选中笔记变化时更新编辑状态
  useEffect(() => {
    if (selectedNote) {
      setEditedNote({ ...selectedNote });
    }
  }, [selectedNote]);

  const changeKind = async (id: string, kind: string) => {
    try {
      setEditedNote(prev =>
        prev ? { ...prev, kind: kind } : prev
      )
      books.map(book => {
        if (book.id === id) {
          book.kind = kind
        }
        return book
      })
      setBooks(books)
      await pb.collection('notebook').update(id, { kind: kind });
      toast.success('已更新分类', { position: 'top-right' });
    } catch (error) {
      toast.error('Error updating note ' + id + ': ' + error, { position: 'top-right' });
    }
  };

  // 过滤笔记
  const filteredNotes = books.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    if (currentKind === "" && currentTag === "") {
      return note.title.toLowerCase().includes(searchLower);
    }
    // 判断标签是否匹配
    const tagMatch =
      !currentTag ||
      (typeof note.tags === "string"
        ? note.tags.split(",").map(t => t.trim()).includes(currentTag)
        : false);

    // 判断分类是否匹配
    const kindMatch =
      currentKind === "" || note.kind === currentKind;

    // 判断搜索是否匹配
    
    const searchMatch =
      note.title.toLowerCase().includes(searchLower) ||
      (Array.isArray(note.content)
        ? note.content.some(cc => cc.content.toLowerCase().includes(searchLower))
        : String(note.content).toLowerCase().includes(searchLower)) ||
      (typeof note.tags === "string"
        ? note.tags.toLowerCase().includes(searchLower)
        : false);

    return kindMatch && tagMatch && searchMatch;
  });

  // 处理新建笔记
  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    
    try {
      const noteToAdd = {
        ...newNote,
        username: pb.authStore.record?.name || 'unknown',
        isPinned: newNote.isPinned ?? false
      };

      const record = await pb.collection('notebook').create(noteToAdd);
      const newR: Book = {
        ...noteToAdd,
        id: record.id,
        created: record.created,
        updated: record.updated
      }
      // console.log('Created note:', record);
      fetchKindStats();
      
      // setNotes([noteToAdd, ...notes]);
      setSelectedNote(newR);
      setNewNote({
        title: '',
        kind: '',
        username: pb.authStore.record?.name || 'unknown',
        content: [
          {
            "content": "Welcome to this demo!",
            "type": "paragraph"
          },
          {
            "content": "<- Notice the new button in the side menu",
            "type": "paragraph"
          },
          {
            "content": "Click it to remove the hovered block",
            "type": "paragraph"
          }
        ],
        tags: '',
        isPinned: false
      });
      setIsNewNoteDialogOpen(false);
    } catch (error) {
      toast.error('Error creating note: ' + error, { position: 'top-right' });
    }
  };

  // 处理笔记更新
  const handleUpdateNote = () => {
    if (!editedNote?.title.trim()) return;
    
    const updatedNotes = notes.map(note => 
      note.id === editedNote.id 
        ? { ...editedNote, updatedAt: new Date().toISOString() } 
        : note
    );
    
    setNotes(updatedNotes);
    setSelectedNote({ ...editedNote, updated: new Date().toISOString() });
  };

  // 处理笔记删除
  const handleDeleteNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    // setNotes(updatedNotes);
    if (!isCycle) {
      await pb.collection('notebook').update(id, { deleted: true });
      toast.success('已放到回收站 ' + id, { position: 'top-right' });
    } else {
      await pb.collection('notebook').delete(id);
      toast.success('已删除笔记 ' + id, { position: 'top-right' });
    }
    fetchKindStats();
    
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
  };

  const handleRecoveryNote = async (id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    // setNotes(updatedNotes);
    if (!isCycle) return
    await pb.collection('notebook').update(id, { deleted: false });
    toast.success('已恢复 ' + id, { position: 'top-right' });
    fetchKindStats();
    
    if (selectedNote && selectedNote.id === id) {
      setSelectedNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
    }
  };

  // 处理标签切换
  const toggleTag = (tagName: string) => {
    setNewNote(prev => {
      const tagArr = prev.tags ? prev.tags.split(',').filter(t => t) : [];
      if (tagArr.includes(tagName)) {
        // 移除标签
        const newTags = tagArr.filter(tag => tag !== tagName).join(',');
        return {
          ...prev,
          tags: newTags
        };
      } else {
        // 添加标签
        const newTags = [...tagArr, tagName].join(',');
        return {
          ...prev,
          tags: newTags
        };
      }
    });
  };

  // 处理编辑中的标签切换
  const toggleEditedTag = async (tagName: string) => {
    if (!editedNote) return;
    // Ensure tags is always an array
    const tagsArr = typeof editedNote.tags === 'string' ? editedNote.tags.split(',').filter(Boolean) : [];
    const tagIndex = tagsArr.indexOf(tagName);
    let newTagsArr;
    if (tagIndex > -1) {
      // 移除标签
      newTagsArr = tagsArr.filter((_, index) => index !== tagIndex);
    } else {
      // 添加标签
      newTagsArr = [...tagsArr, tagName];
    }
    // 更新tags字段
    await pb.collection('notebook').update(String(editedNote.id), { tags: newTagsArr.join(',') });
    setSelectedNote(prev => 
      prev ? { ...prev, tags: newTagsArr.join(',') } : prev
    );
    books.map(book => {
      if (book.id === editedNote.id) {
        book.tags = newTagsArr.join(',')
      }
      return book
    })
    toast.success('已更新标签', { position: 'top-right' });
    setEditedNote({
      ...editedNote,
      tags: newTagsArr.join(',')
    });
  };

  // 渲染笔记列表项
  const renderNoteItem = (note: Book) => (
    <ContextMenu>
      <ContextMenuTrigger>
        {viewMode === "grid" ? (<Card 
          key={note.id}
          className={cn(
            `p-4 cursor-pointer transition-all duration-200`,
            selectedNote?.id === note.id 
              ? 'border-primary bg-primary/5 shadow-sm' 
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800',
            'w-full' // 保证在 list 模式下卡片宽度撑满父容器
          )}
          onClick={() => fetchNode(note)}
        >
            <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg truncate max-w-[260px]">{note.title}</h3>
            </div>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm line-clamp-2 mb-3">
            {Array.isArray(note.content[0].content)
              ? JSON.stringify(note.content[0].content[0].text)
              : String(note.content)}
          </p>
          <div className="flex flex-wrap gap-2 mb-2">
            {(typeof note?.tags === 'string'
              ? (note.tags ? note.tags.split(',').filter(Boolean) : [])
              : Array.isArray(note?.tags) ? note.tags : []
            ).map((tag: string, index: number) => {
              const tagObj = tags.find(t => t.name === tag);
              const colorClass = tagObj ? tagObj.color : "bg-neutral-300";
              return (
                <Badge key={index} variant="secondary" className={`text-xs text-${colorClass?.replace('bg-', '')}`}>
                  {tag}
                </Badge>
              );
            })}
          </div>
          <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-500">
            <span>{note.kind}</span>
            <span>{formatDate(note.updated ?? "")}</span>
          </div>
        </Card>)
        :
        <div>
          <Button
            type='button'
            className={cn(
              'group hover:bg-accent hover:text-accent-foreground bg-white', // 添加 bg-white
              `flex w-full items-center justify-between rounded-md px-2 py-2 text-start text-sm`,
              selectedNote?.id === note.id && 'sm:bg-muted'
            )}
            onClick={() => {
              fetchNode(note)
            }}
          >
            <div className="flex flex-col w-full min-w-0">
              <span className="font-bold truncate text-green-600">
              {note.title}
              </span>
              <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-neutral-500 dark:text-neutral-500">{note.kind}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-500">创建时间：{formatDate(note.created ?? "")}</span>
              </div>
            </div>
          </Button>
          <Separator className='my-1' />
        </div>
      }
      </ContextMenuTrigger>
      <ContextMenuContent className="w-52">
        <ContextMenuItem inset onClick={() => handleDeleteNote(String(note.id))}>
          {note.deleted ? <span className='font-bold text-red-500'>永久删除</span> : <span className='font-bold text-pink-500'>放到回收站</span>}
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        {note.deleted &&
          <ContextMenuItem inset onClick={() => handleRecoveryNote(String(note.id))}>
            <span className='font-bold text-green-500'>恢复</span>
            <ContextMenuShortcut>⌘]</ContextMenuShortcut>
          </ContextMenuItem>
        }
        <ContextMenuItem inset onClick={() => fetchKindStats()}>
          刷新 
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem inset disabled>
          返回
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-44">
            <ContextMenuItem>Save Page...</ContextMenuItem>
            <ContextMenuItem>Create Shortcut...</ContextMenuItem>
            <ContextMenuItem>Name Window...</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer Tools</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          Show Bookmarks
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>Show Full URLs</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="pedro">
          <ContextMenuLabel inset>People</ContextMenuLabel>
          <ContextMenuRadioItem value="pedro">
            Pedro Duarte
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="colm">Colm Tuite</ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent> 
    </ContextMenu>
  );

  return (
    <div className={`flex h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 overflow-hidden`}>
      {/* 侧边栏 - 桌面版 */}
      <LeftNav 
        key={currentKind + currentTag} 
        statsKind={statsKind} 
        currentKind={currentKind} 
        statsTags={statsTags} 
        setCurrentKind={setCurrentKind}
        setIsNewNoteDialogOpen={setIsNewNoteDialogOpen}
        currendTag={currentTag}
        setCurrentTag={setCurrentTag}
        setBooks={setBooks}
        setKindStats={setStatsKind}
        setTagStats={setStatsTags}
        setIsCycle={setIsCycle}
        isCycle={isCycle}
        books={books}
        isAll={isAll}
        setisAll={setisAll}
        deletedBooks={deletedBooks}
        setDeletedBooks={setDeletedBooks}
        noDeletebooks={noDeletebooks}
        setNoDeleteBooks={setNoDeleteBooks}
        pinneds={pinneds}
        setPinneds={setPinneds}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航栏 */}
        <header className="h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center">
            {/* 移动端菜单按钮 */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <LayoutGrid size={20} />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                {/* 移动端侧边栏内容 - 与桌面版相同 */}
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white">
                    <BookOpen size={18} />
                  </div>
                  <h1 className="text-xl font-bold">NoteVault</h1>
                </div>
                
                <div className="p-2">
                  <Button 
                    className="w-full justify-start mb-2"
                    onClick={() => {
                      setIsNewNoteDialogOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <PlusCircle size={18} className="mr-2" />
                    新建笔记
                  </Button>
                  
                  <div className="space-y-1 mt-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        // console.log("全部笔记")
                        setCurrentKind("")
                        setCurrentTag("")
                        setIsMobileMenuOpen(false)
                        fetchKindStats()
                        }}
                    >
                      <Home size={18} className="mr-2" />
                      全部笔记
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                      <Clock size={18} className="mr-2" />
                      最近编辑
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>
                      <Bookmark size={18} className="mr-2" />
                      已固定
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400" onClick={() => setIsMobileMenuOpen(false)}>
                      <Trash2 size={18} className="mr-2" />
                      回收站
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="p-2 flex-1 overflow-y-auto">
                  <h3 className="px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 mt-4">
                    笔记本
                  </h3>
                  <div className="space-y-1">
                    {Notebooks.map(notebook => (
                      <Button 
                        key={notebook.id}
                        variant="ghost" 
                        className={cn(
                          `w-full justify-start`,
                          notebook.color
                        )}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span className="mr-2">{notebook.icon}</span>
                        {notebook.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* 搜索框 */}
            <div className="relative max-w-md w-full">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="搜索笔记..."
                className="pl-10 bg-neutral-100 dark:bg-neutral-700 border-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* 视图切换 */}
            <div className="hidden md:flex border rounded-md overflow-hidden">
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="icon" 
                className="rounded-none"
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="icon" 
                className="rounded-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid size={18} />
              </Button>
            </div>
            
            {/* 通知按钮 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>通知</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* 暗黑模式切换 */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                  >
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ConfigDrawer />
            <ThemeSwitch />
            
            {/* 移动端新建按钮 */}
            <Button className="md:hidden" onClick={() => setIsNewNoteDialogOpen(true)}>
              <PlusCircle size={18} />
            </Button>
          </div>
        </header>
        
        {/* 笔记列表和编辑区 */}
        <div className="flex-1 flex overflow-hidden">
          {/* 笔记列表 */}
          <div className={`w-full md:w-80 border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-800 flex-shrink-0 flex flex-col ${!selectedNote && 'md:w-full'}`} style={{ minHeight: 0 }}>
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
              <h2 className="font-semibold">笔记</h2>
              <div className="flex space-x-1">
                <Button 
                  variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8 md:hidden"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid size={16} />
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'ghost'} 
                  size="icon" 
                  className="h-8 w-8 md:hidden"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
            
            {/* 笔记列表内容 */}
            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full p-3">
                {filteredNotes.length > 0 ? (
                  <div className={
                    viewMode === 'grid' 
                      ? 'grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-3' 
                      : 'space-y-3'
                  }>
                    {/* 先显示固定的笔记 */}
                    {filteredNotes.filter(note => note.isPinned).map(note => renderNoteItem(note))}
                    
                    {/* 再显示非固定的笔记 */}
                    {filteredNotes.filter(note => !note.isPinned).map(note => renderNoteItem(note))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-10 text-center text-neutral-500 dark:text-neutral-400">
                    <Search size={48} className="mb-4 opacity-30" />
                    <h3 className="text-lg font-medium mb-1">未找到笔记</h3>
                    <p className="max-w-xs mb-6">尝试使用不同的搜索词或创建新笔记</p>
                    <Button onClick={() => setIsNewNoteDialogOpen(true)}>
                      <PlusCircle size={18} className="mr-2" />
                      新建笔记
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          
          {/* 笔记编辑区 */}
          {selectedNote && (
            <div className="flex-1 flex flex-col bg-white dark:bg-neutral-800 overflow-hidden">
              {/* 编辑器工具栏 */}
              {/* 底部状态栏 */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 p-3 flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                <div>
                  上次编辑: {formatDate(editedNote?.updated ?? "")}
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <Select 
                      value={editedNote?.kind}
                      onValueChange={(value) =>
                        changeKind(String(editedNote?.id), value)
                      }
                    >
                      <SelectTrigger className="w-[130px] h-8">
                        <SelectValue placeholder="选择笔记本" />
                      </SelectTrigger>
                      <SelectContent>
                        {Notebooks.map(notebook => (
                          <SelectItem key={notebook.id} value={notebook.name}>
                            {notebook.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Label className="flex items-center gap-2 cursor-pointer select-none">
                    <span>固定</span>
                    <Button
                      variant={editedNote?.isPinned ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        editedNote?.isPinned ? "bg-yellow-400 text-white" : "bg-neutral-100 dark:bg-neutral-700"
                      )}
                      onClick={async () => {
                        if (!editedNote) return;
                        const newPinned = !editedNote.isPinned;
                        await pb.collection('notebook').update(String(editedNote.id), { isPinned: newPinned });
                        setEditedNote({ ...editedNote, isPinned: newPinned });
                        setSelectedNote(prev => prev ? { ...prev, isPinned: newPinned } : prev);
                        setBooks(books.map(book =>
                          book.id === editedNote.id ? { ...book, isPinned: newPinned } : book
                        ));
                        toast.success(newPinned ? "已固定笔记" : "已取消固定", { position: 'top-right' });
                      }}
                      aria-pressed={editedNote?.isPinned}
                    >
                      <Bookmark size={16} />
                    </Button>
                  </Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleUpdateNote()}
                  >
                    <Check size={16} className="mr-1" />
                    保存
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-red-600 dark:text-red-400"
                    onClick={() => editedNote?.id !== undefined && handleDeleteNote(String(editedNote.id))}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              
              {/* 编辑器内容 */}
              <ScrollArea className="flex-1 p-6">
                <div className="flex justify-center items-center mb-6">
                  <Input
                    value={editTitle}
                    onChange={(e) => updateTitle(e.target.value)}
                    className="text-3xl font-bold border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-center w-full max-w-xl"
                    placeholder="输入笔记标题..."
                  />
                </div>
                
                {selectedNote?.id && (
                  <Note
                    key={selectedNote?.id}
                    noteId={String(selectedNote.id)}
                    content={selectedNote.content}
                    fetchTodo={fetchKindStats}
                  />
                )}
                
                {/* 标签选择区 */}
                <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                  <h3 className="text-sm font-medium mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <div 
                        key={tag.name}
                        className={`flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                          editedNote?.tags && editedNote.tags.includes(tag.name)
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'bg-neutral-100 dark:bg-neutral-700 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                        onClick={() => toggleEditedTag(tag.name)}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${tag.color}`}></span>
                          {tag.name}
                          {editedNote?.tags && editedNote.tags.includes(tag.name) && (
                            <Check size={14} className="ml-1" />
                          )}
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
      
      {/* 新建笔记对话框 */}
      <Dialog open={isNewNoteDialogOpen} onOpenChange={setIsNewNoteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建新笔记</DialogTitle>
            <DialogDescription>
              添加标题、选择笔记本和标签来创建新笔记
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">笔记标题</Label>
              <Input
                id="title"
                placeholder="输入笔记标题"
                value={newNote.title}
                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notebook">笔记本</Label>
              <Select 
                value={newNote.kind}
                onValueChange={(value) => setNewNote({ ...newNote, kind: value })}
              >
                <SelectTrigger id="notebook">
                  <SelectValue placeholder="选择笔记本" />
                </SelectTrigger>
                <SelectContent>
                  {Notebooks.map(notebook => (
                    <SelectItem key={notebook.id} value={notebook.name}>
                      {notebook.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>标签</Label>
              <div className="flex flex-wrap gap-2">
                {tags.map(tag => (
                  <div 
                    key={tag.id}
                    className={`flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${
                      newNote.tags.includes(tag.name)
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'bg-neutral-100 dark:bg-neutral-700 border border-transparent hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                    onClick={() => toggleTag(tag.name)}
                  >
                    <span className={`w-2 h-2 rounded-full mr-2 ${tag.color}`}></span>
                    {tag.name}
                    {newNote.tags.includes(tag.name) && (
                      <Check size={14} className="ml-1" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsNewNoteDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateNote} disabled={!newNote.title.trim()}>
              创建笔记
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <VSCodeStyleFooter />
    </div>
  );
};

    