## 技术上下文

我们在开发一个 基于 nodejs 的 web 应用，其工程的文件夹树形结构如下：

```
{{ folder_tree }}
```

## 相关文件

{{#related_files_from }}
```yaml
- path: public/index.html
  reader: all
- path: public/style.css
  reader: all
- path: public/script.js
  reader: all  
- path: server.js
  reader: all    
- path: package.json
  reader: all    
```
{{/related_files_from }}

## 任务

我希望 后端的reply里的message是可以通过一个函数生成的，这个函数可能会访问AI，甚至这个函数里可能是个agent，会进行好几步处理，所以这里面的处理策略可能是多样化的，那么基于这个目标，请给我改进后端的代码，以支持这种扩展。