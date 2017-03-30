// generated on 2016-08-16 using generator-webapp 2.1.0
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var wiredep = require('wiredep').stream;
var sass = require('gulp-sass');
// var amdOptimize = require("amd-optimize");
// var concat = require('gulp-concat');           //合并

var requirejsOptimize = require('gulp-requirejs-optimize');
var assetRev = require('gulp-asset-rev');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

gulp.task('sass', function(){
  return gulp.src('app/scss/*.scss')
      .pipe(sass({
        outputStyle: 'compact'
      }))
      .pipe(gulp.dest('app/styles'));
});

gulp.task('styles', ['sass'], function(){
  gulp.src(['./libs/**/*.css'])
    // .pipe($.flatten())
    .pipe(gulp.dest('.tmp/libs'))
    .pipe(gulp.dest('dist/libs'));

  return gulp.src('app/styles/*.css')
    // .pipe($.sourcemaps.init())
    // .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    // .pipe($.sourcemaps.write())
    .pipe(assetRev())
    .pipe(gulp.dest('.tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', function(){
  gulp.src('app/scripts/*.js')
    .pipe(assetRev())
    .pipe(gulp.dest(".tmp/scripts"))         //输出保存
    .pipe(reload({stream: true}));

  return gulp.src('app/scripts/utils/**/*.js')
    .pipe(assetRev())
    // .pipe($.plumber())
    // .pipe($.sourcemaps.init())
    // .pipe($.babel())
    // .pipe($.sourcemaps.write('.'))
    .pipe($.concat('app.js'))  
    .pipe(gulp.dest(".tmp/scripts"))         //输出保存
    .pipe(reload({stream: true}));

  // return gulp.src('app/scripts/amd/**/*.js')
  //   .pipe(requirejsOptimize({
  //     mainConfigFile: 'app/scripts/amd/require-config.js',
  //     optimize: 'none',
  //     exclude: [
  //       'jquery','../jquery.slideBox'
  //     ]
  //   }))
  //   .pipe(gulp.dest('.tmp/scripts'))
  //   .pipe(reload({stream:true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', function(){
  return lint('app/scripts/**/*.js', {
    fix: true
  })
    .pipe(gulp.dest('app/scripts'));
});
gulp.task('lint:test', function(){
  return lint('test/spec/**/*.js', {
    fix: true,
    env: {
      mocha: true
    }
  })
    .pipe(gulp.dest('test/spec/**/*.js'));
});

gulp.task('html', ['styles', 'scripts'], function(){
  return gulp.src('app/*.html')
    .pipe($.useref({searchPath: ['.tmp', 'app', '.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});

gulp.task('images', function(){
  return gulp.src('app/images/**/*')
    // .pipe(assetRev())
    .pipe(gulp.dest('dist/images'));
    // .pipe($.cache($.imagemin({
    //   optimizationLevel: 3,  
    //   progressive: true,
    //   interlaced: true
    //   // don't remove IDs from SVGs, they are often used
    //   // as hooks for embedding and styling
    //   // svgoPlugins: [{cleanupIDs: false}]
    // })))
});

gulp.task('mock', function(){
  return gulp.src('app/mock/**/*')
    .pipe(gulp.dest('dist/mock'));
});

gulp.task('fonts', function(){
  gulp.src('./libs/layer/**/*.{css,png,gif}')
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe(gulp.dest('dist/scripts'));

  gulp.src('./libs/plupload/**/*.{swf,xap,css,png,gif}')
      .pipe(gulp.dest('.tmp/scripts'))
      .pipe(gulp.dest('dist/scripts'));

  gulp.src('./libs/kindeditor/**/*.{css,png,gif,html,swf,js}')
      .pipe(gulp.dest('.tmp'))
      .pipe(gulp.dest('dist'));

  return gulp.src('./libs/**/*.{eot,svg,ttf,woff,woff2}')
    .pipe($.flatten())
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('dist/fonts'));
});

gulp.task('extras', function(){
  return gulp.src([
    'app/*.*',
    '!app/*.html'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));

gulp.task('serve', ['styles', 'scripts', 'fonts'], function(){
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['.tmp', 'app'],
      routes: {
        '/libs': 'libs'
      }
    }
  });

  gulp.watch([
    'app/*.html',
    'app/images/**/*',
    '.tmp/fonts/**/*'
  ]).on('change', reload);

  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/styles/**/*.css', ['styles']);
  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('app/fonts/**/*', ['fonts']);
  gulp.watch('bower.json', ['wiredep', 'fonts']);
});

gulp.task('serve:dist', function(){
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

gulp.task('serve:test', ['scripts'], function(){
  browserSync({
    notify: false,
    port: 9000,
    ui: false,
    server: {
      baseDir: 'test',
      routes: {
        '/scripts': '.tmp/scripts',
        '/libs': 'libs'
      }
    }
  });

  gulp.watch('app/scripts/**/*.js', ['scripts']);
  gulp.watch('test/spec/**/*.js').on('change', reload);
  gulp.watch('test/spec/**/*.js', ['lint:test']);
});

// inject bower components
gulp.task('wiredep', function(){
  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['lint', 'html', 'images', 'fonts', 'extras'], function(){
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});

gulp.task('default', ['clean'], function(){
  gulp.start('build');
});
