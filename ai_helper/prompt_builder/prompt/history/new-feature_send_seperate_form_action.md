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

我希望 返回的form自带一个提交目标地址，这个form提交的时候，读取这个地址并提交到这个地址。同时，当有两个form的时候，不要出现混淆，每个按钮或取消按钮都要处理自己所在的form。