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

我希望 generateReply能够变成一个扩展点，能够接受注入进来的不同的生成函数，要根据thread、message等选择对应的处理函数，目前的generateReply行为抽取为默认的处理函数。帮我设计怎么样才能方便的注入并且在运行时判断使用哪个注入的处理函数。