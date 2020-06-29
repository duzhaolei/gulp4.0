var gulp = require('gulp'),
        minifycss = require('gulp-minify-css'),
        concat = require('gulp-concat'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename'),
        $ = require('gulp-load-plugins')(),
        open = require('open'),
        babelenv = require('babel-preset-env'),
        connect = require('gulp-connect'),
        proxy = require('http-proxy-middleware'),
        htmlmin = require('gulp-htmlmin'),
        babel = require('gulp-babel'),
        replace = require('gulp-replace'),
        del = require('del'),
        preprocess = require("gulp-preprocess");

var app = {
    srcPath: 'dist/',
};

console.log(process.env.NODE_ENV);

function html() {
    return gulp.src(app.srcPath + '**/*.html')
        // .pipe(preprocess({ context: { NODE_ENV: process.env.NODE_ENV} }))
        // .pipe(gulp.dest(app.srcPath+'html/'))
        .pipe($.connect.reload());
}

//  function srcCss() {
//     return  gulp.src(app.srcPath + 'src/**/*.less')
//         .pipe(concat('main.less'))
//             .pipe($.less())
//             .pipe($.cssmin())
//             .pipe(gulp.dest(app.srcPath + 'src'))
//             .pipe($.connect.reload());
// }

 function img() {
    return gulp.src(app.srcPath + 'img/**/*')
            .pipe($.connect.reload());
}

function builImg() {
    return gulp.src(app.srcPath + 'img/**/*')
        .pipe(gulp.dest(process.env.NODE_ENV  + '/img'))
            .pipe($.connect.reload());
}

 function less() {
    return gulp.src(app.srcPath + 'src/**/*.less')
            .pipe($.less())
            .pipe($.cssmin())
            .pipe(gulp.dest(app.srcPath + 'src'))
            .pipe($.connect.reload());
}

 function js() {
    return gulp.src(app.srcPath + 'src/**/*.js')
            .pipe($.connect.reload());
}


 function minifyjs() {
    return gulp.src(app.srcPath + 'src/js/*.js')
    // .pipe(babel())
            .pipe(rename({suffix: '.min'}))       //rename压缩后的文件名
            .pipe(uglify())                       //压缩
            .pipe(gulp.dest(process.env.NODE_ENV + '/src/js'));          //输出
}
function minifyCss() {
    return gulp.src(app.srcPath + 'src/css/*.css')
    // .pipe(babel())
            .pipe(rename({suffix: '.min'}))       //rename压缩后的文件名
            .pipe(minifycss())                       //压缩
            .pipe(gulp.dest(process.env.NODE_ENV + '/src/css'));          //输出
}

function miniHtml() {
    var options = {
        removeComments: true,//清除HTML注释
        collapseWhitespace: false,//压缩HTML
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
    };
    return gulp.src(app.srcPath + '*.html')
        // .pipe(gulpRemoveHtml())//清除特定标签
        // .pipe(removeEmptyLines({removeComments: true}))//清除空白行
        .pipe(preprocess({ context: { NODE_ENV: process.env.NODE_ENV} }))
        .pipe(htmlmin(options))
        .pipe(gulp.dest(process.env.NODE_ENV+'/'));
}

async function clean() {
    return del([
            'dist/src/js/*'
    ],{force:true});
}

 async function cleanBuild() {
    return del([process.env.NODE_ENV+'/*'])
}

 function babelJs() {
    return gulp.src(app.srcPath + 'src/js/*.js')
            .pipe(babel())
            .pipe(gulp.dest(app.srcPath + 'src/js'));
}

 function watchfile() {
    gulp.watch(app.srcPath + '**/*.html',gulp.series(html));
    gulp.watch(app.srcPath + 'src/**/*.less',gulp.series(less));
    gulp.watch(app.srcPath + 'src/**/*.js',gulp.series(js));
    // gulp.watch(app.srcPath + 'src/**/*.less',gulp.series(srcCss));
    // gulp.watch(app.srcPath + 'src/**/*.css',['minifycss']);
    // gulp.watch(app.srcPath + 'src/**/*.js',['js']);
    gulp.watch(app.srcPath + 'img/**/*',gulp.series(img));
}

 function serve() {
    connect.server({
        root: app.srcPath,
        livereload: true,
        port: 2222,
        middleware: function(connect, opt) {
            return [
                proxy('/api',{
                    target: 'http://127.0.0.1',
                    ws: false,
                    secure: false,
                    changeOrigin: true,
                    pathRewrite:{//路径重写规则
                        '^/api':'/api'
                    }
                })
                // proxy('/otherServer',{
                //     target: 'http://IP:Port',
                //     changeOrigin: true
                // })
            ]
        }
    })
    open('http://localhost:2222');
    return gulp.watch(app.srcPath + '**/*.html',gulp.series(html)),
     gulp.watch(app.srcPath + 'src/**/*.less',gulp.series(less)),
    gulp.watch(app.srcPath + 'src/**/*.js',gulp.series(js)),
    // gulp.watch(app.srcPath + 'src/**/*.less',gulp.series(srcCss)),
    // gulp.watch(app.srcPath + 'src/**/*.css',['minifycss']);
    // gulp.watch(app.srcPath + 'src/**/*.js',['js']);
    gulp.watch(app.srcPath + 'img/**/*',gulp.series(img));
}

function runServe() {
    // return gulp.series(html,less,srcCss,js,img,watchfile)
    return gulp.series(clean,less,js,img,html)
}

var babelJS = gulp.series(clean, gulp.parallel(babelJs));
var miniJs = gulp.series(minifyjs);
var miniCss = gulp.series(minifyCss);
var miniHtml = gulp.series(miniHtml);
var build = gulp.series(cleanBuild,builImg,minifyjs,miniCss,miniHtml);
var serveDefault = gulp.series(serve,gulp.parallel(runServe));

exports.html = html;
exports.less = less;
exports.runServe = runServe;
// exports.srcCss = srcCss;
exports.builImg = builImg;
exports.img = img;
exports.watchfile = watchfile;
exports.js = js;
exports.babelJS = babelJS;
exports.build = build;
exports.miniJs = miniJs;
exports.miniCss = miniCss;

exports.default = serveDefault;


