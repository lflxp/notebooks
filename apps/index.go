//go:build linux || darwin
// +build linux darwin

package apps

import "github.com/wailsapp/wails/v3/pkg/application"

func StartApps(app *application.App) {
	go startPocketbase(app)
}
