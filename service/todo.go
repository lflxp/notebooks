package service

import (
	"changeme/model"
)

type TodoService struct{}

func (g *TodoService) List() []model.Todo {
	return model.GetAll()
}

func (g *TodoService) Add(title, desc, date, tags string) string {
	return model.Add(title, desc, date, tags)
}

func (g *TodoService) Delete(id int64) string {
	return model.Delete(id)
}
