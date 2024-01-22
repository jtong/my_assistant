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
- path: strategies.js
  reader: all
- path: StrategyManager.js
  reader: all
- path: package.json
  reader: all    
```
{{/related_files_from }}

## 任务

我希望 在界面上添加一个功能，按下去可以清除当前thread的所有对话记录。