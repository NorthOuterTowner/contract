# 基于Web的合同管理系统
## 使用说明

### 1.使用数据库
本系统使用MySQL作为数据库，确保已安装MySQL并创建了名为`contract`的数据库。将`SQL/contract.sql`文件中的内容导入到数据库中。  
使用 mysql 命令将 SQL 文件导入到本地 MySQL 服务器，即可在本地使用该数据库。
```bash
mysql -u [username] -p [database_name] < [database_name.sql]
```
*方括号内为变量，根据实际情况填写。[username] 是本地 MySQL 的用户名，[database_name] 是数据库名称，[database_name.sql] 是 SQL 文件名。*  
如要将数据库导出为`SQL`文件，可以使用`mysqldump`命令导出。  
```bash
mysqldump -u [username] -p [database_name] > [database_name.sql]
```

### 2. 安装依赖
使用`npm install [xxx]`命令安装依赖包。  
前端需要安装的依赖有`axios` , `vue-router` ,  `pinia`,  `pdf-lib` 。  
此外还需要安装 Naive-UI 的 Vue 3 组件库`naive-ui`,与其他依赖安装方式略有不同，使用如下语句进行安装。  
```bash
npm i -D naive-ui
```
后端需要安装的依赖有`express` , `mysql2` , `cors`, `dotenv`。  
安装方式与前端一致，也使用`npm install [xxx]`命令安装依赖包。
  
### 3. 启动服务
确保当前处于contract目录下，接下来在终端中输入
```bash
cd backend
node app.js
```
重新启动一个终端，目录切换到contract目录下，输入
```bash
cd frontend
npm run dev
```
打开浏览器，输入`http://localhost:5173/`即可访问前端页面。

## 开发说明
（1） MySQL最好使用`5.7-8.0`版本均支持的操作，如`check`等命令在MySQL5.7中不报错，但不支持，最好使用触发器代替。  
（2） 后端backend文件夹下的`app.js`文件是后端服务的入口文件，充当后端API的中转作用，将请求转发到对应的路由处理函数。编写API时注意将一类功能新建一个js文件，在文件中编写，不要直接写在`app.js`中。  
（3） 由于系统采用B/S架构，所以在每个页面都需要进行权限的认证。（可以添加对登录状态的记录）  
（4） 对于前端中常用的组成部分，如侧边栏，应建立在component文件夹下（类似于Siderbar组件），便于在其他文件中使用
（5） 由于数据库中的内容是通过`mysqldump`进行导出的，所以直接修改可能造成一些问题，建议的方式是在本地修改数据库后进行导出，替换掉原有的`SQL/contract.sql`文件。
