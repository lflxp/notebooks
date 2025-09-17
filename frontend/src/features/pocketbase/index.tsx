import { Card } from "@/components/ui/card"; 
import { Button } from "@/components/ui/button";
import { OpenService } from "../../../bindings/changeme/service";

export default function Draw() {
    return (
        <>
          <div className="w-full">
            <h1 className='text-2xl font-bold tracking-tight'>
                PocketBase
            </h1>
            <p className='text-muted-foreground'>
                提供在线 PocketBase 访问功能 http://localhost:8088/_/ <Button variant="link" onClick={() => OpenService.Open("http://localhost:8088/_/")}>窗口打开</Button> <a href="http://localhost:8088/_/" target="_blank" rel="noopener noreferrer">浏览器打开</a>
            </p>
        </div>
          <div>
            <Card className="h-[80vh] w-full py-0 flex justify-center items-center border-none">
              <iframe
              src="http://localhost:8088/_/"
              className="w-full h-full border-0"
              title="Draw"
              />
            </Card>
          </div>
        </>
        // 修改 Card 组件的样式，添加高度和左边距
    );
}
  