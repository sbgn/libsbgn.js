var gulpDocumentation = require('gulp-documentation');
var gulp = require('gulp');
var markdown = require('gulp-markdown');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var del = require('del');

gulp.task('doc-API', function () {
  return gulp.src('./src/libsbgn.js')
    .pipe(gulpDocumentation('html', { config: "./docs/doc_conf.yml" }, {name: 'libsbgn.js'}))
    .pipe(gulp.dest('docs/API'));
});

gulp.task('readmeToHtml', function() {
	return gulp.src('README.md')
        .pipe(markdown({
			highlight: function (code, lang, callback) {
				require('pygmentize-bundled')({
						lang: lang,
						format: 'html'
					},
					code,
					function (err, result) {
						callback(err, result.toString());
					}
				)}
			}))
        .pipe(gulp.dest('docs/'));
});

gulp.task('concatHtmlIndex', function() {
	return gulp.src(['docs/start.html', 'docs/README.html', 'docs/end.html'])
        .pipe(concat('index.html'))
        .pipe(gulp.dest('docs/'));
});

gulp.task('clean', function() {
	return del(['docs/README.html']);
});

/*
	doc is built by:
	- generating auto doc for API (doc-API)
	- converting README.md to html format (readmeToHtml)
	- putting html readme together in the sandwich of start.html and end.html (concatHtmlIndex)
	clean at the end
*/
gulp.task('doc', function() {
	runSequence('doc-API', 'readmeToHtml', 'concatHtmlIndex', 'clean');
});