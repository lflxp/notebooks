package apps

import (
	"changeme/model"
	"log/slog"
	"time"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/types"
	"github.com/wailsapp/wails/v3/pkg/application"
)

var App *pocketbase.PocketBase

func startPocketbase(app *application.App) {
	App = pocketbase.New()
	// You can modify the default PocketBase router or add custom routes/middleware in the OnServe hook or before app.Start().

	App.OnServe().BindFunc(func(se *core.ServeEvent) error {
		// registers new "GET /hello" route
		se.Router.GET("/hello", func(re *core.RequestEvent) error {
			return re.String(200, "Hello world!")
		}).Bind(apis.RequireAuth())

		err := CreateToDoListCollection(se)
		if err != nil {
			slog.With("error", err).Error("CreateToDoListCollection failed")
			return err
		}

		err = CreateNotebookListCollection(se)
		if err != nil {
			slog.With("error", err).Error("CreateNotebookListCollection failed")
			return err
		}

		return se.Next()
	})

	// if err := app.Start(); err != nil {
	// 	log.Fatal(err)
	// }
	go syncTodoList(app)
	go syncNotebook(app)

	App.Bootstrap()
	// serveCmd := cmd.NewServeCommand(app, true)
	// serveCmd.Execute()
	apis.Serve(App, apis.ServeConfig{
		HttpAddr:        "127.0.0.1:8088",
		ShowStartBanner: true,
	})
}

func syncTodoList(app *application.App) {
	for {
		if App != nil && App.DB() != nil {
			list := []model.Todo2{}
			err := App.DB().
				NewQuery("select title,desc,tags,created,updated from todolist").
				// Select("*").From("todolist").
				All(&list)
			if err != nil {
				app.Event.Emit("todolist", err.Error())
				continue
			}
			slog.With("count", len(list)).Debug("syncTodoList")
			app.Event.Emit("todolist", len(list))
			// 每5秒推送一次
			time.Sleep(1 * time.Second)
		}
	}
}

func syncNotebook(app *application.App) {
	for {
		if App != nil && App.DB() != nil {
			list := []model.Todo2{}
			err := App.DB().
				NewQuery("select 1 from notebook").
				// Select("*").From("todolist").
				All(&list)
			if err != nil {
				app.Event.Emit("notebook", err.Error())
				continue
			}
			slog.With("count", len(list)).Debug("notebook")
			app.Event.Emit("notebook", len(list))
			// 每5秒推送一次
			time.Sleep(1 * time.Second)
		}
	}
}

// 初始化创建collection
func CreateToDoListCollection(se *core.ServeEvent) error {
	// 初始化collection
	col, err := se.App.FindCollectionByNameOrId("todolist")
	if err != nil {
		slog.With("error", err).Error("FindCollectionByNameOrId failed")
	}

	if col == nil {
		slog.Info("Collection todolist not found, creating...")
		col = core.NewBaseCollection("todolist")

		// set rules
		col.ListRule = types.Pointer("")   // @request.auth.id != ''
		col.ViewRule = types.Pointer("")   // @request.auth.id != ''
		col.CreateRule = types.Pointer("") // @request.auth.id != '' && (@request.body.user:isset = false || @request.body.user = @request.auth.id)
		col.UpdateRule = types.Pointer("") // @request.auth.id != '' && (@request.body.user:isset = false || @request.body.user = @request.auth.id)
		col.DeleteRule = types.Pointer("") // @request.auth.id != '' && @request.data.user = @request.auth.id

		// add text field
		col.Fields.Add(&core.TextField{
			Name:     "title",
			Required: true,
			Max:      100,
		})

		col.Fields.Add(&core.TextField{
			Name:     "desc",
			Required: false,
			Max:      0,
		})

		col.Fields.Add(&core.TextField{
			Name:     "tags",
			Required: true,
			Max:      5000,
		})

		col.Fields.Add(&core.BoolField{
			Name:     "deleted",
			Required: false,
		})

		// add autodate/timestamp fields (created/updated)
		col.Fields.Add(&core.AutodateField{
			Name:     "created",
			OnCreate: true,
		})
		col.Fields.Add(&core.AutodateField{
			Name:     "updated",
			OnCreate: true,
			OnUpdate: true,
		})

		// or: collection.Indexes = []string{"CREATE UNIQUE INDEX idx_example_user ON example (user)"}
		col.AddIndex("idx_todolist_user", true, "title", "")

		err = se.App.Save(col)
		if err != nil {
			slog.With("error", err).Error("Failed to create collection todolist")
			return err
		}
	}
	return nil
}

// 初始化创建collection
func CreateNotebookListCollection(se *core.ServeEvent) error {
	// 初始化collection
	col, err := se.App.FindCollectionByNameOrId("notebook")
	if err != nil {
		slog.With("error", err).Error("FindCollectionByNameOrId failed")
	}

	if col == nil {
		slog.Info("Collection notebook not found, creating...")
		col = core.NewBaseCollection("notebook")

		// set rules
		col.ListRule = types.Pointer("")   // @request.auth.id != ''
		col.ViewRule = types.Pointer("")   // @request.auth.id != ''
		col.CreateRule = types.Pointer("") // @request.auth.id != '' && (@request.body.user:isset = false || @request.body.user = @request.auth.id)
		col.UpdateRule = types.Pointer("") // @request.auth.id != '' && (@request.body.user:isset = false || @request.body.user = @request.auth.id)
		col.DeleteRule = types.Pointer("") // @request.auth.id != '' && @request.data.user = @request.auth.id

		// add text field
		col.Fields.Add(&core.TextField{
			Name:     "title",
			Required: true,
			Max:      100,
		})

		col.Fields.Add(&core.JSONField{
			Name:     "content",
			Required: false,
			MaxSize:  1000000000,
		})

		col.Fields.Add(&core.TextField{
			Name:     "kind",
			Required: true,
			Max:      5000,
		})

		col.Fields.Add(&core.TextField{
			Name:     "tags",
			Required: false,
			Max:      5000,
		})

		col.Fields.Add(&core.BoolField{
			Name:     "deleted",
			Required: false,
		})

		col.Fields.Add(&core.TextField{
			Name:     "username",
			Required: true,
			Max:      200,
		})

		col.Fields.Add(&core.BoolField{
			Name:     "isPinned",
			Required: false,
		})

		// add autodate/timestamp fields (created/updated)
		col.Fields.Add(&core.AutodateField{
			Name:     "created",
			OnCreate: true,
		})
		col.Fields.Add(&core.AutodateField{
			Name:     "updated",
			OnCreate: true,
			OnUpdate: true,
		})

		// or: collection.Indexes = []string{"CREATE UNIQUE INDEX idx_example_user ON example (user)"}
		col.AddIndex("idx_notebook_title", false, "title", "")

		err = se.App.Save(col)
		if err != nil {
			slog.With("error", err).Error("Failed to create collection notebook")
			return err
		}
	}
	return nil
}
