package monitor

import (
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// 统一注册监控启动函数
func RegisterAllUsageMonitor(app *application.App) {
	go syncTime(app)
	go syncUsage(app)
	// go syncTodoList(app)
}

// 时间推送
func syncTime(app *application.App) {
	for {
		now := time.Now().Format(time.DateTime)
		app.Event.Emit("time", now)
		time.Sleep(time.Second)
	}
}
