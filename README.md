# io-global  
dingdong自用开发变量的集合 最常用io.c(),表console.log()  
将可能做成全局变量  
    
    
    io.prototype.description = {
      c: "io.c(str) console.log"
      , ce: "io.ce(str) console.error()"
      , project: "io.project={} ,io原则上不在其他js文件中做修改,所以暴露一个供修改的,这个对象主要根据不同的站点需要设置不同的全局而留下的(注意隔离这些生效的场景)"
      , isDir: "io.isDir(str) 智能判断是路径还是文件; 返回值都有三种,true(文件夹),false(文件),和'ENOENT'(未找到) 由于'ENOENT'的存在,推荐用===比对,避免if(isDir(str))的判断"
      , isJs: "io.isJs(str);isJs函数,判断当前目录下有没有x.js文件,包括隐藏.js后缀的写法;结果两种,true,false(找不到也归为false)"
      , isExist: "文件(夹)是否存在"
      , path: "io.path作用,类似于node系统模块path.parse:1.路径的反斜杠改为斜杠(为windows); 2."
    }  
    
