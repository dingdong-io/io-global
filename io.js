//io.js 工具集,无业务藕合,主要用于输入输出处理,路径转换,该文件底部有io总浏览
//todo-低 弄一个io-async.js版。isExist等可以做成异步promise版。问题是如果外面必await，似乎意义不大


//考虑吸收自己写的一些tool，包括readJsonFile函数和log模块， 及一些第三方如extend

var io = {},
    fs = require('fs'),
    nodePath = require('path'),
    cp = require('child_process')

io.c = console.log.bind(console)

//返True,False和'ENOENT'，需要严格===，不推荐向外暴露
var isDir = function (sFile) {
    var t = false;
    try {
        //找到sFile,为目录true,否false  只要能找到,不判断是否存在+.js后缀的文件
        t = fs.statSync(sFile).isDirectory()
    } catch (e) {
        //未找到目录或文件的错误;　遇到了这种情况，磁盘有分配符D:，但未格式式，或光驱预留位E：，这时返'UNKNOWN'，统归为'ENOENT'
        if (e.code === 'ENOENT' || e.code === 'UNKNOWN')
            t = 'ENOENT'
            //未知的错误
        else
            throw e
    }
    return t
}

//只返True,False
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
            if (e.code === 'ENOENT' || e.code === 'UNKNOWN')
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
//待加入 type,绝对相对 逻辑 x/y/z/../ = x/y/ 用来地址相加
var pathT = {}
    //只用一个参数,次参数是内部回调用的,表人为添加了.js后缀

var path = function (sFile, isIAddLastJs) {
        var oFile = {}
		if(!sFile) return {error:'ENOENT'}; //''
        sFile = nodePath.normalize(sFile) //包括了'./'处理为空,多斜杠转单, 还有最麻烦的, '../'中和掉前一段/xx/路径,但对web有破坏性，http://剩http:/
            .replace(/\\/g, '/') //反斜杠转正
            .replace(/\:\//,'://') //修复web

        var t = isDir(sFile)
        if (t === true) {
            oFile.dir = sFile
            if (!/\/$/.test(sFile)) {
                //与node自有模块path.dirname(只返父级)不同,如果是目录,这里将完全返给dir
                oFile.dir += '/'
            }
        } else if (t === 'ENOENT') {
            //!!这里可考虑优化，做兼容网络路径？？
            if (isIAddLastJs) {
                oFile = pathT
                oFile.error = 'ENOENT'
                    //        io.c(oFile)
            } else {
                sFile.match(/(.*\/)(.*)/)
                pathT.dir = RegExp.$1
                pathT.name = RegExp.$2  //!!文件夹要不要最后一层做为name?
                    //        io.c(pathT)
                    //只有这种情况会回调,二参true,限制其不再循环 return使其不再回第一次执行体中(或者oFile=path(sFile+'.js',true),使其回来后仍带值 )
                return path(sFile + '.js', true)
            }
        }
        //t===false 找到,且为文件
        else {
            sFile.match(/(.*\/)(.*)/)
            oFile.dir = RegExp.$1
            oFile.name = RegExp.$2
        }
        oFile.all = oFile.dir + (oFile.name ? oFile.name : '')

        oFile.type = /^\//.test(sFile) || /\:\//.test(sFile) ? 'absolute' : 'relative'

        //  io.c(oFile)
        return oFile
            //返回值如下oFile={"dir":"C:/x/x/","name":"x.js","all":"C:/x/x/x.js","error":"ENOENT"}
    }
    //io.c(path('/x1/x2/x3/../../common/1').all) //触发1.js
    //io.c(path('/x1/x2/x3/../../common/1').all) //触发1.js
    //io.c(path('F:/x1/.////x2/../../../../..//x3/common'))


var cwd = function(){
    return process.cwd().replace(/\\/g, '/') + '/'
}

//简单log
var log = function(logData){
    console.log(logData)
    var logFile = cwd() + 'devlog.log'
    // var fd = fs.openSync(logFile,'a+')
    //未实现倒序写入
    fs.writeFile(logFile,new Date().toLocaleString() + ' | ' + logData+'\r\n',{
        encoding:'utf8',
        flag:'a+'
        },function(){
    })
}
// log('log')
// log('log2')

//!!todo中文路径
//保证有该目录或文件,存在时无操作，不存在时创建 
var create = function(sPath){
    
    if(path(sPath).type == 'relative')
        sPath = io.path(cwd() + sPath).all; //相对目录，相对项目算，而非执行的某js文件
    
    if(io.isExist(sPath)) return;
    //不存在
    var oPath = io.path(sPath);
    if(!io.isExist(oPath.dir)){ //如果走fs.mkdir,需要从root一步步循环判断后添加
        fs.mkdirSync(oPath.dir,{ recursive: true })
        // cp.execSync(`mkdir "${oPath.dir.replace(/\//g,'\\')}"`,{
        //     cwd: null,
		// 	encoding: 'binary'
        // })
    }
    //创建文件，对是否文件的判断，仅根据.xx后缀（如创建一个.txt的文件夹，不能用该create方法）
    if(/\.[^\/]+$/.test(oPath.all)){
        fs.writeFileSync(oPath.all,'','utf8')
    }
}

var API = {
    c: "io.c(str) console.log",
    ce: "io.ce(str) console.error()",
    project: "io.project={} ,io原则上不在其他js文件中做修改,所以暴露一个供修改的,这个对象主要根据不同的站点需要设置不同的全局而留下的(注意隔离这些生效的场景)",
    isDir: "io.isDir(str) 智能判断是路径还是文件; 返回值都有三种,true(文件夹),false(文件),和'ENOENT'(未找到) 由于'ENOENT'的存在,推荐用===比对,避免if(isDir(str))的判断",
    isJs: "io.isJs(str);isJs函数,判断当前目录下有没有x.js文件,包括隐藏.js后缀的写法;结果两种,true,false(找不到也归为false)",
    isExist: "文件(夹)是否存在",
    "cwd": "process.cwd() 反斜杠转正,末尾+斜杠,__dirname是当前运行的js文件(总是本文件)所在目录,而cwd可以定位到正在处理的文件,因此cwd更灵活",
    "dirname": "__dirname + '/'",
    path: "io.path作用,类似于node系统模块path.parse:1.路径的反斜杠改为斜杠(为windows);2.智能判断文件夹或路径,若是文件夹末位保持'/';3.智能判断忽略.js后缀的写法; 返回值有以下属性:dir,name,all,error,",
    log:"简单记录log，写入到项目目录的devlog.log文件下",
    create: "按路径创建文件（夹），无则创建。根据.xx后缀来判断是文件，无后缀当文件夹。注意传参相对路径时，按项目目录算（入口js），而不一定是当前运行的目录算"
}

//io各属性方法,参io.API
io = {
    API: API,
    c: console.log.bind(console),
    ce: console.error.bind(console),
    project: {},
    isDir: isDir,
    isJs: isJs,
    isExist: isExist,
    path: path,
    cwd: cwd, //改为函数了，原为属性
    dirname: __dirname.replace(/\\/g, '/') + '/',
    log: log,
    create: create
};
module.exports = io