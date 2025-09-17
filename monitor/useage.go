package monitor

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"time"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/load"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
	"github.com/wailsapp/wails/v3/pkg/application"
)

var (
	byteSendBefore uint64 = 0
	byteRecvBefore uint64 = 0
)

type MonitorLoad struct {
	//loadavg
	Load1  float64 `json:"load1"`
	Load5  float64 `json:"load5"`
	Load15 float64 `json:"load15"`
}

func getLoad() MonitorLoad {
	loadAvg, _ := load.Avg()
	return MonitorLoad{
		Load1:  loadAvg.Load1,
		Load5:  loadAvg.Load5,
		Load15: loadAvg.Load15,
	}
}

// 推送性能监控数据
func syncUsage(app *application.App) error {
	for {
		load := getLoad()
		cpuUsage, _ := cpu.Percent(0, false)
		memUsage, _ := mem.VirtualMemory()
		diskUsage, _ := disk.Usage("/")
		netIO, _ := net.IOCounters(false)
		netIn := float64(netIO[0].BytesRecv-byteRecvBefore) / 1024 / 1024 / 0.99
		netOut := float64(netIO[0].BytesSent-byteSendBefore) / 1024 / 1024 / 0.99
		// 每秒网速
		// fmt.Printf("in: %.2f MB/s, out: %.2f MB/s\n", netIn, netOut)
		tmp := map[string]any{
			"load":   load,
			"cpu":    fmt.Sprintf("%.2f", cpuUsage[0]),
			"mem":    fmt.Sprintf("%.2f", memUsage.UsedPercent),
			"disk":   fmt.Sprintf("%.2f", diskUsage.UsedPercent),
			"netin":  fmt.Sprintf("%.2fMB/s", netIn),
			"netout": fmt.Sprintf("%.2fMB/s", netOut),
		}
		info, err := json.Marshal(tmp)
		if err != nil {
			slog.With("error", err).Error("json.Marshal error")
			return err
		}
		app.Event.Emit("usage", string(info))
		// 每5秒推送一次
		time.Sleep(time.Second)
		// 更新数据
		byteRecvBefore = netIO[0].BytesRecv
		byteSendBefore = netIO[0].BytesSent
	}
}
