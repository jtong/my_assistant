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

我希望 给message加入text之外的数据，数据可能有boolean，可能有字符串，整体表现为一个json，而boolean会在页面上渲染为button，字符串会渲染为select。当我们点击按钮的时候，会把这个json构造出来，有个专门的属性挂在message上，text也会显示为这个json。