package model

import (
	"changeme/utils/db"
	"fmt"
	"time"
)

func init() {
	db.NewOrm().Sync2(new(Todo))
}

type Todo struct {
	Id     int64     `db:"id" xorm:"id notnull unique pk autoincr" name:"id"`
	Title  string    `db:"title" xorm:"title" name:"title"`
	Desc   string    `db:"desc" xorm:"desc" name:"desc"`
	Tags   string    `db:"tags" xorm:"tags" name:"tags"`
	Date   string    `db:"date" xorm:"date" name:"date"`
	Create time.Time `db:"created" xorm:"created"` //这个Field将在Insert时自动赋值为当前时间
	Update time.Time `db:"updated" xorm:"updated"`
}

type Todo2 struct {
	Id     string `db:"id" xorm:"id notnull unique pk autoincr" name:"id"`
	Title  string `db:"title" xorm:"title" name:"title"`
	Desc   string `db:"desc" xorm:"desc" name:"desc"`
	Tags   string `db:"tags" xorm:"tags" name:"tags"`
	Date   string `db:"date" xorm:"date" name:"date"`
	Create string `db:"created" xorm:"created"` //这个Field将在Insert时自动赋值为当前时间
	Update string `db:"updated" xorm:"updated"`
}

// 查询全量数据
func GetAll() []Todo {
	var todos []Todo
	err := db.NewOrm().Find(&todos)
	if err != nil {
		return nil
	}
	return todos
}

// 添加todo
func Add(title, desc, date, tags string) string {
	todo := &Todo{
		Title: title,
		Desc:  desc,
		Tags:  tags,
		Date:  date,
	}
	_, err := db.NewOrm().Insert(todo)
	if err != nil {
		return err.Error()
	}
	return "Todo added successfully"
}

// 完成其余crud操作
func Get(id int64) string {
	todo := &Todo{Id: id}
	has, err := db.NewOrm().Get(todo)
	if err != nil {
		return err.Error()
	}
	if !has {
		return "Todo not found"
	}
	return fmt.Sprintf("Todo found: %v", todo)
}

func Updated(id int64, title, desc, tags string) string {
	todo := &Todo{Id: id}
	has, err := db.NewOrm().Get(todo)
	if err != nil {
		return err.Error()
	}
	if !has {
		return "Todo not found"
	}
	todo.Title = title
	todo.Desc = desc
	todo.Tags = tags
	_, err = db.NewOrm().Update(todo)
	if err != nil {
		return err.Error()
	}
	return "Todo updated successfully"
}

func Delete(id int64) string {
	todo := &Todo{Id: id}
	_, err := db.NewOrm().Delete(todo)
	if err != nil {
		return err.Error()
	}
	return "Todo deleted successfully"
}
