var gulpDocumentation = require('gulp-documentation');
var gulp = require('gulp');

gulp.task('doc-md', function () {
  return gulp.src('./libsbgn.js')
    .pipe(gulpDocumentation('md'))
    .pipe(gulp.dest('docs'));
});

gulp.task('doc-html', function () {
  return gulp.src('./libsbgn.js')
    .pipe(gulpDocumentation('html'))
    .pipe(gulp.dest('docs'));
});
