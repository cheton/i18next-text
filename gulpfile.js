var fs = require('fs');
var gulp = require('gulp');
var del = require('del');
var browserify = require('browserify');
var runSequence = require('run-sequence');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var source = require('vinyl-source-stream');
var errorHandler = require('./gulp/error-handler');
var pkg = require('./package.json');
var bower = require('./bower.json');
var config = require('./gulp/config');

// Sync the following properties from `package.json` to `bower.json`:
// * name
// * description
// * version
// * license
bower.name = pkg.name;
bower.description = pkg.description;
bower.version = pkg.version;
bower.license = pkg.license;
fs.writeFileSync('bower.json', JSON.stringify(bower, null, 4));

gulp.task('clean', function(callback) {
    del(config.clean.files, callback);
});

gulp.task('jshint', function() {
    return gulp.src(config.jshint.src)
        .pipe(jshint(config.jshint.options))
        .pipe(jshint.reporter('default', {verbose: true}))
        .pipe(jshint.reporter('fail'))
            .on('error', errorHandler.error);
});

gulp.task('build-hash', ['build-hash:debug', 'build-hash:uglify']);
gulp.task('build-hash:debug', function() {
    return browserify()
        .add('./lib/hash/index.js')
        .bundle()
        .pipe(source('i18next-text.hash.js'))
        .pipe(gulp.dest('dist'));
});
gulp.task('build-hash:uglify', ['build-hash:debug'], function() {
    return gulp.src('dist/i18next-text.hash.js')
        .pipe(uglify(config.uglify.dist))
        .pipe(rename('i18next-text.hash.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-all', ['build-all:debug', 'build-all:uglify']);
gulp.task('build-all:debug', ['build-hash'], function() {
    return gulp.src(['dist/i18next-text.hash.js', 'src/i18next-text.js'])
        .pipe(uglify(config.uglify.debug))
        .pipe(concat('i18next-text.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-all:uglify', ['build-hash'], function() {
    return gulp.src(['dist/i18next-text.hash.js', 'src/i18next-text.js'])
        .pipe(uglify(config.uglify.dist))
        .pipe(concat('i18next-text.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-custom', ['build-custom:debug', 'build-custom:uglify']);
gulp.task('build-custom:debug', function() {
    return gulp.src(['src/i18next-text.js'])
        .pipe(uglify(config.uglify.debug))
        .pipe(concat('i18next-text.custom.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build-custom:uglify', function() {
    return gulp.src(['src/i18next-text.js'])
        .pipe(uglify(config.uglify.dist))
        .pipe(concat('i18next-text.custom.min.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build:post', function() {
    return gulp.src(['dist/*.js'])
        .pipe(header(config.banner, {pkg: pkg}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', ['jshint'], function(callback) {
    runSequence('clean',
        ['build-hash', 'build-all', 'build-custom'],
        'build:post',
        callback
    );
});
gulp.task('default', ['build']);
