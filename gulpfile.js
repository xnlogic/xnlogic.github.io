var gulp        = require('gulp'),
    browserSync = require('browser-sync'),
    sass        = require('gulp-sass'),
    prefix      = require('gulp-autoprefixer'),
    minifycss   = require('gulp-minify-css'),
    //jshint      = require('gulp-jshint'),
    concat      = require('gulp-concat'),
    uglify      = require('gulp-uglify'),
    rename      = require('gulp-rename'),
    cp          = require('child_process'),
    hash         = require("gulp-hash"),
    del          = require("del");


var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

//Delete our old css files
    del(["static/css/**/*"])

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', ['sass', 'js'], function (done) {
    browserSync.notify(messages.jekyllBuild);
    var pl = process.platform === "win32" ? "jekyll.bat" : "jekyll";
    //return cp.spawn('bundle', ['exec', pl, 'build'], {stdio: 'inherit'})
    return cp.spawn(pl, ['build'], {stdio: 'inherit'})
        .on('close', done);
});


/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});


/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'js', 'foundation-js', 'jquery-js', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        },
        notify: false
    });
});


/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    //Delete our old css files
    del(["assets/css/**/*"])
    return gulp.src('_sass/main.scss')
        .pipe(sass({
            onError: browserSync.notify
        }).on('error', sass.logError))
        .pipe(prefix(['last 2 versions'], { cascade: false }))
        .pipe(rename({suffix: '.min', prefix : ''}))
		.pipe(minifycss())
        .pipe(hash())
        .pipe(gulp.dest('assets/css'))
        //Create a hash map
        .pipe(hash.manifest('hash.json', {
          append: false,
        }))
        //Put the map in the data directory
        .pipe(gulp.dest("_data/css"))
        .pipe(browserSync.reload({stream:true}));
});


/*
** JS Task
*/
gulp.task('js', ['sass'], function() {
  del(["assets/js/scripts.min-*"])
  return gulp.src('_assets/js/scripts/*.js')
    //.pipe(jshint())
    //.pipe(jshint.reporter('default'))
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(hash())
    .pipe(gulp.dest('assets/js'))
    //Create a hash map
    .pipe(hash.manifest('hash.json', {
      append: false,
    }))
    //Put the map in the data directory
    .pipe(gulp.dest("_data/js"));
});

// JSHint, concat, and minify Foundation JavaScript
gulp.task('foundation-js', function() {
  return gulp.src([

  		  // Foundation core - needed if you want to use any of the components below
          '_assets/js/foundation-sites/foundation.core.js',
          '_assets/js/foundation-sites/foundation.util.*.js',

          // Pick the components you need in your project
          '_assets/js/foundation-sites/foundation.abide.js',
          '_assets/js/foundation-sites/foundation.accordion.js',
          '_assets/js/foundation-sites/foundation.accordionMenu.js',
          '_assets/js/foundation-sites/foundation.drilldown.js',
          '_assets/js/foundation-sites/foundation.dropdown.js',
          '_assets/js/foundation-sites/foundation.dropdownMenu.js',
          '_assets/js/foundation-sites/foundation.equalizer.js',
          '_assets/js/foundation-sites/foundation.interchange.js',
          //'_assets/js/foundation-sites/foundation.magellan.js',
          '_assets/js/foundation-sites/foundation.offcanvas.js',
          '_assets/js/foundation-sites/foundation.orbit.js',
          '_assets/js/foundation-sites/foundation.responsiveMenu.js',
          '_assets/js/foundation-sites/foundation.responsiveToggle.js',
          '_assets/js/foundation-sites/foundation.reveal.js',
          '_assets/js/foundation-sites/foundation.slider.js',
          '_assets/js/foundation-sites/foundation.sticky.js',
          //'_assets/js/foundation-sites/foundation.tabs.js',
          '_assets/js/foundation-sites/foundation.toggler.js',
          '_assets/js/foundation-sites/foundation.tooltip.js',
  ])
    //.pipe(jshint())
    //.pipe(.reporter('default'))
    .pipe(concat('foundation.js'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
});


// JSHint, concat, and minify Jquery JavaScript
gulp.task('jquery-js', function() {
  return gulp.src('_assets/js/jquery/jquery.js')
    //.pipe(jshint())
    //.pipe(.reporter('default'))
    .pipe(gulp.dest('assets/js'))
    .pipe(rename({suffix: '.min'}))
    .pipe(uglify())
    .pipe(gulp.dest('assets/js'))
});


/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_data/*.yml', ['js']).on("change", browserSync.reload);
    gulp.watch('_data/**/*.yml', ['js']).on("change", browserSync.reload);
    gulp.watch('_assets/js/**/*.js', ['js']).on("change", browserSync.reload);
    gulp.watch('_assets/js/**/*.js', ['foundation-js']).on("change", browserSync.reload);
    gulp.watch('_assets/js/**/*.js', ['jquery-js']).on("change", browserSync.reload);
    gulp.watch('_sass/**', ['sass']);
    gulp.watch(['*.md','_data/**/*.yml','_data/*.yml','_assets/js/**/*.js','_sass/**','*.html', '_layouts/*.html', '_posts/*', '_includes/*'], ['jekyll-rebuild']);
});


/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);


/*Gulp Task for production*/

gulp.task('production', ['sass', 'js', 'foundation-js', 'jquery-js', 'jekyll-build']);
