# gulp-file-copy

## Install

    npm install gulp-file-copy

## Configure

      var gulp = require('gulp'),
          gulpCopy = require('gulp-file-copy');

      gulp.task('copy', function() {
		var start = './src'
        gulp.src(start)
          .pipe(gulpCopy('./build', {
            start: start
          }))

      });


## Run

    gulp copy

[gulp]: http://gulpjs.com/
