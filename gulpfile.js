var autoprefixer = require('gulp-autoprefixer');
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var connect = require('gulp-connect');
var fontmin = require('gulp-fontmin');
var gulp = require('gulp');
var htmlmin = require('gulp-htmlmin');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var util = require('gulp-util');

var paths = {
    src: './src',
    build: './build'
}

var files = {
    scripts: [
        paths.src + '/assets/scripts/**/*.js'
    ],
    html: [
        paths.src + '/html/**/*.html'
    ],
    sass: [
        paths.src + '/assets/styles/**/*.scss'
    ],
    images: [
        paths.src + '/assets/images/**/*.png',
        paths.src + '/assets/images/**/*.jpg',
        paths.src + '/assets/images/**/*.gif'
    ],
    fonts: [
        paths.src + '/assets/fonts/**/*.woff',
        paths.src + '/assets/fonts/**/*.woff2'
    ],
    datafiles: [
        paths.src + '/json/*.json'
    ]
}

gulp.task('html', function() {
    gulp.src(files.html)
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest(paths.build))
});

gulp.task('datafiles', function() {
    gulp.src(files.datafiles)
        .pipe(gulp.dest(paths.build + '/json'))
});

gulp.task('sass', function() {
    gulp.src(files.sass)
        .pipe(autoprefixer())
        .pipe(sass())
        .pipe(concatCss('/css/all.css'))
        .pipe(gulp.dest(paths.build))
        .pipe(connect.reload());
});

gulp.task('fonts', function() {
    gulp.src(files.fonts)
        .pipe(fontmin())
        .pipe(gulp.dest(paths.build + '/fonts'))
        .pipe(connect.reload());
})

gulp.task('connect', function() {
    connect.server({
        root: [paths.build],
        port: 1337,
        livereload: true
    })
});

gulp.task('watch', function () {
    gulp.watch(files.html, ['html']);
    gulp.watch(files.sass, ['sass']);
    gulp.watch(files.fonts, ['fonts']);
    gulp.watch(files.datafiles, ['datafiles']);
});

gulp.task('default', [
    'html',
    'datafiles',
    'sass',
    'fonts',
    'connect',
    'watch'
]);

