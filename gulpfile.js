/**
 * Created by lukaijie on 16/4/27.
 */

var gulp = require('gulp');
// 引入组件
var cssmin = require('gulp-clean-css'), //css压缩
    cssver = require('gulp-make-css-url-version'), //css引用路径加版本号
    gulpif = require('gulp-if'),//if判断
    jshint = require('gulp-jshint'),//js检测
    uglify = require('gulp-uglify'),//js压缩
    imagemin = require('gulp-imagemin'),//图片压缩
    pngcrush = require('imagemin-pngcrush'),
    rev = require('gulp-rev'), //对文件名加MD5后缀
    clean = require('gulp-clean'), //删除
    revCollector = require('gulp-rev-collector'), //路径替换
    concat = require('gulp-concat'),//文件合并
    rename = require('gulp-rename'),//文件更名
    minifycss = require('gulp-minify-css'),//css压缩
//htmlmin = require('gulp-htmlmin'), //html压缩
    minifyHtml = require('gulp-minify-html'), //html压缩
    processhtml = require('gulp-processhtml'),//替换文件
    runSequence = require('gulp-run-sequence'),
    gulpCopy = require('gulp-file-copy'),
    notify = require('gulp-notify');//提示信息

//revImg
gulp.task('revImg', function () {
    gulp.src('public/images/*')
        .pipe(rev())
        .pipe(gulp.dest('dist/images/'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/img'))
        .pipe(notify({message: 'revImg task ok'}));
});

//clean
gulp.task('clean', function () {
    return gulp.src(['./dist/*', './rev'], {read: false})
        .pipe(clean())
        .pipe(notify({message: 'clean task ok'}));
});

//压缩html
gulp.task('html', function () {
    gulp.src('public/views/**/*.ejs')
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest('dist/views'))
        .pipe(notify({message: 'html task ok'}));
});

//压缩图片
gulp.task('img', function () {
    gulp.src('public/images/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngcrush()]
        }))
        .pipe(gulp.dest('dist/images/'))
        .pipe(notify({message: 'img task ok'}));
});

//合并 压缩 重命名css
gulp.task('css', function () {
    gulp.src('public/stylesheets/*.css')
        .pipe(concat('wapmain.css'))
        .pipe(gulp.dest('dist/stylesheets'))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(rev())
        .pipe(gulp.dest('dist/stylesheets'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/css'))
        .pipe(notify({message: 'css task ok'}));
});

//检查js
gulp.task('lint', function () {
    gulp.src('public/javascripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'))
        .pipe(notify({message: 'lint task ok'}));
});

//合并 压缩js文件
gulp.task('js', function () {
    gulp.src('public/javascripts/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('dist/javascripts'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(rev())
        .pipe(gulp.dest('dist/javascripts'))
        .pipe(rev.manifest())
        .pipe(gulp.dest('./rev/js'))
        .pipe(notify({message: 'js task ok'}));
})

//更新引入文件版本
gulp.task('version', function () {
    setTimeout(function () {
        gulp.src(['./rev/**/*.json', './public/views/**/*.ejs'])
            .pipe(revCollector())
            .pipe(gulp.dest('dist/views'))
            .pipe(notify({message: 'update version task ok'}));

        gulp.src(['./rev/**/*.json', './dist/stylesheets/**/*.css'])
            .pipe(revCollector())
            .pipe(gulp.dest('dist/stylesheets'))
            .pipe(notify({message: 'update version task ok'}));
    }, 2000);
});

//替换
gulp.task('processhtml', function () {
    setTimeout(function () {
        gulp.src('dist/views/**/*.ejs')
            .pipe(processhtml())
            //.pipe(gulpif(    //压缩
            //    true, minifyHtml({
            //        empty: true,
            //        spare: true,
            //        quotes: true
            //    })
            //))
            .pipe(gulp.dest('dist/views'))
            .pipe(notify({message: 'processhtml task ok'}));
    }, 2000);

});


//copy
gulp.task('copy', function () {
    gulp.src('public/views/**/*.ejs')
        .pipe(gulp.dest('dist/views'));
});

//gulp.task('rev', function () {
//    gulp.src(['./rev/**/*.json', './public'])//读取 rev-manifest.json 文件以及需要进行css名替换的文件
//        .pipe(revCollector()) //执行文件内css名的替换
//        .pipe(gulp.dest('./dist/views')); //替换后的文件输出的目录
//});
gulp.task('default', ['lint', 'revImg', 'copy', 'js', 'css', 'version']);
gulp.task('default2', ['copy', 'js', 'css', 'version', 'processhtml']);


gulp.task('dev', function (cb) {
    runSequence('lint', ['js', 'css', 'copy'], 'version', cb);
});

//gulp打包顺序
//1. default  2. processhtml


// 默认任务
gulp.task('default1', function () {
    //gulp.run('img', 'css', 'lint', 'js', 'html');
    //
    //// 监听html文件变化
    //gulp.watch('src/*.html', function () {
    //    gulp.run('html');
    //});

    // Watch .css files
    //gulp.watch('src/css/*.css', ['css']);

    // Watch .js files
    gulp.watch('public/javascripts/*.js', ['lint']);

    // Watch image files
    //gulp.watch('src/images/*', ['img']);
});