import {
  AlertCircle,
  CheckCircle2,
  // Clock,
  GitBranch,
  Split,
  Settings,
  X
} from "lucide-react"; // 引入VS Code风格图标（需安装lucide-react）
import { Button } from "@/components/ui/button"; // 引入shadcn按钮组件
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"; // 引入shadcn tooltip组件
import { useEffect, useState } from 'react'
import {Events, WML} from "@wailsio/runtime";
import { Link } from '@tanstack/react-router'

// VS Code风格Footer组件
export function VSCodeStyleFooter() {
  const [usage, setUsage] = useState<string>('');
  const [time, setTime] = useState<string>('Listening for Time event...');
  const [notebook, setNotebook] = useState<string>('');

  // const HandleOpenWindow = () => {
  //   if (dbopenWin) return;
  //   setDbopenWin(true);
  //   OpenService.Open("http://127.0.0.1:8088/_/").finally(() => {
  //     setDbopenWin(false);
  //   });
  // };

  useEffect(() => {
    Events.On('usage', (usageValue: any) => {
      const usageData = JSON.parse(usageValue.data);
      const usageString = `CPU: ${usageData.cpu}% | 内存 ${usageData.mem}% | 磁盘: ${usageData.disk}% | 网络: ${usageData.netin}/${usageData.netout}`;
      setUsage(usageString);
    });
    Events.On('time', (timeValue: any) => {
      setTime(timeValue.data);
    });
    Events.On('notebook', (data: any) => {
      const notebookData = `笔记本: ${data.data} 项`;
      setNotebook(notebookData);
      // 也可以直接使用 data.data 来访问传递的数据
      // 例如：
    });
    WML.Reload();
  }, []);

  return (
    // 外层容器：固定高度、深色背景、边框顶部，还原VS Code底部状态栏样式
    <footer className="fixed left-0 right-0 bottom-0 z-[100] h-5 bg-[#1e1e1e] border-t border-[#383838] flex items-center px-2 text-[#cccccc] text-xs"
      style={{ boxSizing: "border-box", width: "100vw" }}>
      <div className="flex items-center gap-3">
        {/* 错误提示 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
                <AlertCircle size={14} className="text-[#ff4444]" />
                <span>0 错误</span>
                <span>|</span>
                <CheckCircle2 size={14} className="text-[#00ff80]" />
                <span>0 警告</span>
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" className="w-64 bg-[#252526] border-[#444] text-[#ccc]">
              <p>问题面板</p>
              <p className="text-xs mt-1 text-[#aaa]">显示所有错误和警告 (Ctrl+Shift+M)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 版本控制分支 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
                <GitBranch size={14} />
                <span>main</span>
              </div>
            </TooltipTrigger>
            <TooltipContent align="start" className="bg-[#252526] border-[#444] text-[#ccc]">
              <p>当前分支: main</p>
              <p className="text-xs mt-1 text-[#aaa]">切换分支 (Ctrl+Shift+P → Git: 切换分支)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 行号/列号 */}
        <div className="px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
          <span>Ln 12, Col 45</span>
        </div>

        <div className="px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
          <span><Link to="/">{notebook}</Link></span>
        </div>

        {/* 文件格式 */}
        <div className="px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
          <span><Link to="/pocketbase">{time}</Link></span>
        </div>

        {/* 行号显示 */}
        <div className="px-1 py-0.5 rounded hover:bg-[#3a3a3a] cursor-pointer">
          <span>{usage}</span>
        </div>
      </div>

      {/* 中间区域：自动填充空白，实现左右分区 */}
      <div className="flex-1"></div>

      {/* 右侧区域：功能按钮（拆分视图、设置、关闭等） */}
      <div className="flex items-center gap-1">
        {/* 拆分编辑器按钮 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded hover:bg-[#3a3a3a] text-[#ccc] hover:text-white"
              >
                <Split size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" className="bg-[#252526] border-[#444] text-[#ccc]">
              <p>拆分编辑器 (Ctrl+\)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 设置按钮 */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded hover:bg-[#3a3a3a] text-[#ccc] hover:text-white"
              >
                <Settings size={14} />
              </Button>
            </TooltipTrigger>
            <TooltipContent align="end" className="bg-[#252526] border-[#444] text-[#ccc]">
              <p>设置 (Ctrl+,)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 关闭按钮（模拟） */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded hover:bg-[#ff4444] text-[#ccc] hover:text-white"
        >
          <X size={14} />
        </Button>
      </div>
    </footer>
  );
}