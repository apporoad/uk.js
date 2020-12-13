#!/usr/bin/env node

const aesjs = require('./aes')
var program = require('commander');
var path = require('path')
var fs = require('fs')

var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ];

var getKeyByStr = function(strPwd){
    // '中国'.charCodeAt(0) %16
    var newKey = key.concat([])
    for(var i =0;i< 16 ;i++){
        var value = 0
        if(i < strPwd.length){
            value = strPwd.charCodeAt(i)
        }
        else{
            value = strPwd.charCodeAt( i% strPwd.length)
        }
        newKey[i] = ((newKey[i] + value) % 16)  + 1
    }
    return newKey
}


var de = function(key2, content){
    var key = getKeyByStr(key2)
    var encryptedBytes = aesjs.utils.hex.toBytes(content);

    // The counter mode of operation maintains internal state, so to
    // decrypt a new instance must be instantiated.
    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(5));
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);

    // Convert our bytes back into text
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    return decryptedText
}


program.version(require('./package.json').version)
    .usage('[yourFileDir] [tgtFileDir]')
    // .option('-e --encoding <encoding>', '编码', 'gb2312')
    // .option('-t --targetEncoding <encoding>', '目标文件编码', 'utf8')
    .option('-p --pwd <pwd>', '密码')
    .parse(process.argv);
if (program.args.length > 1) {
    var srcPath = path.resolve(process.cwd(), program.args[0])
    var tgtPath = path.resolve(process.cwd(), program.args[1])
    var pwd = program.pwd || 'save11'
    //根据文件路径读取文件，返回文件列表
    fs.readdir(srcPath,function(err,files){
        if(err){
            console.warn(err)
        }else{
            //遍历读取到的文件列表
            files.forEach(function(filename){
                //获取当前文件的绝对路径
                var filedir = path.join(srcPath, filename);
                var tPath = path.join(tgtPath , filename)
                //根据文件路径获取文件信息，返回一个fs.Stats对象
                fs.stat(filedir,function(eror, stats){
                    if(eror){
                        console.warn('获取文件stats失败');
                    }else{
                        var isFile = stats.isFile();//是文件
                        var isDir = stats.isDirectory();//是文件夹
                        if(isFile){
                            console.log(filedir+  ' to ' + tPath);
　　　　　　　　　　　　　　　　　// 读取文件内容
                            var content = fs.readFileSync(filedir, 'utf-8');
                            // console.log(content);

                            //加密
                            var eContent = de(pwd, content)
                            if(fs.existsSync(tPath)){
                                fs.unlinkSync(tPath)
                            }
                            fs.writeFileSync(tPath, eContent,'utf8')

                        }
                        if(isDir){
                            //文件夹不管
                            //fileDisplay(filedir);//递归，如果是文件夹，就继续遍历该文件夹下面的文件
                        }
                    }
                })
            });
        }
    });

}