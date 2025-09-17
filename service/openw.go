package service

import "github.com/wailsapp/wails/v3/pkg/application"

type OpenService struct{}

func (o *OpenService) Open(url string) string {
	app := application.New(application.Options{
		Name: "Open Service",
	})
	window2 := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "Window2",
		Width:  1920,
		Height: 1080,
	})
	window2.SetURL(url)
	return "Window2 opened with URL: " + url
}
