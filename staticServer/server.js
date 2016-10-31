//静态资源服务器
var http = require('http');
var url = require('url');
var fs = require('fs');
var mime = require('./mime').types;
var path = require('path');

var rootUrl = "C:/Users/贾宇东/Desktop/server";
http.createServer(function (request, response){
    var pathname = url.parse(request.url).pathname;
    /*如果没请求文件，则默认index.html*/
    if(pathname === '/'){
        pathname += "index.html";
    }
    //格式化路径
    pathname = path.normalize(pathname.replace(/\.\./g, ""));
    var postpath = rootUrl + pathname;
    /*判断文件是否存在*/
    fs.exists(postpath, function (exists){
        /*不存在则输出404*/
        if (!exists) {
            response.writeHead(404, {'Content-Type' : 'text/plain'});
            response.write('404');
            response.end();
        }
        else{
            //根据请求的资源MIME类型返回相应的Content-Type，获取拓展名
            var extension  = path.extname(postpath);
            
            extension = extension ? extension.slice(1) : 'unknown';
            /*根据mime模块的类型返回相应的content-type*/
            var contentType = mime[extension] || 'text/plain';
            response.setHeader('Content-Type', contentType); 
            //fs.stat 获得文件最后修改时间,查看文件状态
            fs.stat(postpath, function (err, stat){
                var lastModified = stat.mtime.toUTCString();
                response.setHeader('Last-Modified', lastModified);//设置最后修改时间
                var ifModifiedSince = "If-Modified-Since".toLowerCase();
                //客户端会通过 If-Modified-Since 头将先前服务器端发过来的最后修改时间戳发送回去
                //判断客户端发来的时间戳是否与最后修改时间一样，如果一样则返回304
                if (request.headers[ifModifiedSince] && request.headers[ifModifiedSince] == lastModified) {
                    response.writeHead(304, 'Not Modified');
                    response.end();
                }
                else{
                    fs.readFile(postpath, 'binary', function (err, file){
                        if (err) {
                            response.writeHead(500, {'Content-Type': 'text/plain'});
                            response.end(err);
                        }
                        else{
                            response.writeHead(200, 'Ok');
                            response.write(file, "binary");
                            response.end();                    
                        }
                    });
                }

            });
        }
    });
}).listen(8800);