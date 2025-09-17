package service

import (
	"encoding/json"

	"gopkg.in/yaml.v2"
)

type FormatService struct{}

func (f *FormatService) JaonToTaml(data string) string {

	var jsonObj interface{}
	err := json.Unmarshal([]byte(data), &jsonObj)
	if err != nil {
		return "json解析失败: " + err.Error()
	}
	yamlData, err := yaml.Marshal(jsonObj)
	if err != nil {
		return "yaml转换失败: " + err.Error()
	}
	return string(yamlData)
}
