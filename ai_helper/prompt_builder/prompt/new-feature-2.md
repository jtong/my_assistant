## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
{{ folder_tree }}
```

## 前端相关文件

{{#related_files_from }}
```yaml
- path: public/index.html
  reader: all
- path: public/style.css
  reader: all
- path: public/script.js
  reader: all  
```
{{/related_files_from }}

## 后端相关文件

{{#related_files_from }}
```yaml
- path: server.js
  reader: all    
- path: agents.js
  reader: all
- path: AgentManager.js
  reader: all
- path: package.json
  reader: all    
```
{{/related_files_from }}

## 任务

我希望 button情况不只是一个button，而是button是一类，可以有多个属性，每个属性显示为一个button，点击表示将这个属性提交为true。