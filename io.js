//io.js dingdong自用开发变量的集合 最常用io.c(),表console.log() ,该文件底部有io总浏览

var io = {}
  , fs = require('fs')

io.c = console.log.bind(console)
io.c('引入了io.js,为全局变量的集合,详参io.prototype.description')

var isDir = function (sFile) {
    var t = false;
    try {
      //找到sFile,为目录true,否false  只要能找到,不判断是否存在+.js后缀的文件
      t = fs.statSync(sFile).isDirectory()
    } catch (e) {
      //未找到目录或文件的错误
      if (e.code === 'ENOENT')
        t = e.code
        //未知的错误
      else
        throw e
    }
    return t
  }


var isExist = function (sFile) {
    if (isDir(sFile) === 'ENOENT') {
      if (/\.js$/.test(sFile)) return false
      else return isExist(sFile + '.js')
    } else return true
  }


var isJs = function (sFile) {

    //匹配.js后缀,其它不关心
    if (/\.js$/.test(sFile)) {
      var t = false
      try {
        //windows不允许同目录完全相同的命名,如.js文件和.js结尾的文件夹 ,只要能找到,不是文件就是文件夹
        t = !fs.statSync(sFile).isDirectory()
      } catch (e) {
        //找不到也归到false,因为人为加.js结尾,不能反映原文件是否存在
        if (e.code === 'ENOENT')
          t = false;
        else throw e
      }
      return t
    }
    //匹配忽略.js后缀的情况 ;非.js后缀也强制加了.js,返false
    else {
      return isJs(sFile + '.js')
    }

  }


//io.path作用,1.路径的反斜杠改为斜杠(为windows);2.若是文件夹且末位无"/",加上"/";3.智能判断忽略.js后缀的写法; 4.
var pathT = {}
//只用一个参数,次参数是内部回调用的,表人为添加了.js后缀
var path = function (sFile,isIAddLastJs) {
    var oFile = {}
    sFile = sFile.replace(/\\/g, '/')
    var t = isDir(sFile)
    if (t === true) {
      oFile.dir = sFile
      if (!/\/$/.test(sFile)) {
        //与node自有模块path.dirname(只返父级)不同,如果是目录,这里将完全返给dir
        oFile.dir += '/'
      }
    } else if (t === 'ENOENT') {
      if(isIAddLastJs){
        oFile = pathT
        oFile.error = 'ENOENT'
//        io.c(oFile)
      }
      else{
        sFile.match(/(.*\/)(.*)/)
        pathT.dir = RegExp.$1
        pathT.name = RegExp.$2
//        io.c(pathT)
        //只有这种情况会回调,二参true,限制其不再循环 return使其不再回第一次执行体中(或者oFile=path(sFile+'.js',true),使其回来后仍带值 )
        return path(sFile+'.js',true)
      }
    }
    //t===false 找到,且为文件
    else {
      sFile.match(/(.*\/)(.*)/)
      oFile.dir = RegExp.$1
      oFile.name = RegExp.$2
    }
  oFile.all = oFile.dir+ (oFile.name?oFile.name:'')
//  io.c(oFile)
  return oFile
      //返回值如下oFile={"dir":"C:/x/x/","name":"x.js","all":"C:/x/x/x.js","error":"ENOENT"}
  }

//node中prototype不是默认建立的?
io.prototype = Object.create(require('events').EventEmitter.prototype);

io.prototype.description = {
  c: "io.c(str) console.log"
  , ce: "io.ce(str) console.error()"
  , project: "io.project={} ,io原则上不在其他js文件中做修改,所以暴露一个供修改的,这个对象主要根据不同的站点需要设置不同的全局而留下的(注意隔离这些生效的场景)"
  , isDir: "io.isDir(str) 智能判断是路径还是文件; 返回值都有三种,true(文件夹),false(文件),和'ENOENT'(未找到) 由于'ENOENT'的存在,推荐用===比对,避免if(isDir(str))的判断"
  , isJs: "io.isJs(str);isJs函数,判断当前目录下有没有x.js文件,包括隐藏.js后缀的写法;结果两种,true,false(找不到也归为false)"
  , isExist: "文件(夹)是否存在"
  , path: "io.path作用,类似于node系统模块path.parse:1.路径的反斜杠改为斜杠(为windows); "
}

//io各属性方法,参io.prototype.description
io = {
  c: console.log.bind(console)
  , ce: console.error.bind(console)
  , project: {}
  , isDir: isDir
  , isJs: isJs
  , isExist: isExist
  , path: path
};

module.exports = global.io = io
