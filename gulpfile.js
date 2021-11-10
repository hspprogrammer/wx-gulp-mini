const gulp = require('gulp');
const fs = require('fs');
const path = require('path')
const del = require('del');
const chalk = require('chalk');

let $ = require('gulp-load-plugins')({
    // pattern: ['gulp-*'],
})
//请求地址
const httpBaseUrl = {
    'dev':'http:127.0.0.1:9001'
}
function httpHandler(){

}
let env = 'dev' //开发环境 dev prod release
//环境设置
function setDevEnv(cd){
     env = 'dev'
     cd()
}
function setReleaseEnv(cd){
    env = 'release'
    cd()
}
function setProdEnv(cd){
    env = 'prod'
    cd()
}
//打印函数
function logHandler(type,info){
    switch(type){
        case 'log':
            console.log(chalk.blue(info))
            break;
    }
}
//处理js文件
function jsHandler(cd,path = './src/**/*.js') {
    return gulp.src(path)
        .pipe($.replace('HTTP_BASE_URL', httpBaseUrl[env]))
        .pipe($.mpNpm())
        .pipe($.if(env!='dev',$.stripDebug())) //去除js文件中的console,同时也会将错误信息打印去掉,按需求配置
        .pipe($.if(env!='dev',$.uglify({
            output: {
                annotations: false, //去除注释
            }
        }))) 
        .pipe(gulp.dest('./dist/'));
}

//处理json文件
function jsonHandler(cd,path = './src/**/*.json') {
    return gulp.src(path)
        .pipe($.mpNpm({fullExtract: ['@vant/weapp/wxs']}))
        .pipe(gulp.dest('./dist/'));
}

//处理less文件
function lessHandler(cd,path = './src/**/*.less') {
    return gulp.src(path)
        .pipe($.less()) //转换less到css
        .pipe($.minifyCss()) //压缩
        .pipe($.rename(function(path){
            path.extname = ".wxss";
        }))
        .pipe(gulp.dest('./dist/'));
}

//处理wxml文件
function wxmlHandler(cd,path ='./src/**/*.wxml') {
    return gulp.src(path)
        .pipe(gulp.dest('./dist/'));
}


//删除文件操作
function delFileHandler(cb,filePath){
    return del([filePath],cb);
}

//删除dist
function delDistFile(cb){
    return delFileHandler(cb,'dist')
}

//监控文件变化
function watchFile(cb) {
    const watcher = gulp.watch(['src']);
    watcher.on('change', function (path, stats) {
        logHandler('log',`File ${path} was changed`);
        watchFileHandler('change',path)
    });

    watcher.on('add', function (path, stats) {
        logHandler('log',`File ${path} was added`);
        watchFileHandler('add',path)
    });

    watcher.on('unlink', function (path, stats) {
        logHandler('log',`File ${path} was removed`);
        let _path = path.replace('src/','dist/')
        delFileHandler(_path)
    });
    cb();
}



//文件变化后的处理任务
function watchFileHandler(type,filePath){
    const _extname = path.extname(filePath)
    switch(_extname){
        case '.less':
            lessHandler(filePath)
            break;
        case '.js':
            jsHandler(filePath)
            break;
        case '.json':
            jsonHandler(filePath)
            break;
        case '.wxml':
            wxmlHandler(filePath)
            break;
        default:
            
            break;
    }

}


//默认任务 dev
gulp.task('default', gulp.series(
    setDevEnv,
     delDistFile,
     gulp.parallel(
        jsHandler,
        lessHandler,
        jsonHandler,
        wxmlHandler,
     ),
     watchFile
))

//正式环境 release
gulp.task('release', gulp.series(
    setReleaseEnv,
    delDistFile,
    gulp.parallel(
       jsHandler,
       lessHandler,
       jsonHandler,
       wxmlHandler,
    ),
    watchFile
))

//生产环境 pro
gulp.task('prod', gulp.series(
    setProdEnv,
    delDistFile,
    gulp.parallel(
       jsHandler,
       lessHandler,
       jsonHandler,
       wxmlHandler,
    ),
    watchFile
))

// 文件监控任务
gulp.task('watch', gulp.series(
    watchFile
))

//清除任务
gulp.task('clean',gulp.series(
    delDistFile
))