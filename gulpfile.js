const { series, parallel, src, dest } = require('gulp')
const log = require('fancy-log')
const plumber = require('gulp-plumber')
const rm = require('del')
const minifyJS = require('gulp-terser')
const minifyCSS = require('gulp-clean-css')
const minifyHTML = require('gulp-htmlmin')

const SOURCE_FOLDER = 'src/'
const BUILD_FOLDER = 'dist/'
const DEPLOY_BUILD_FOLDER = BUILD_FOLDER + 'deploy/'
const OMNISD_BUILD_FOLDER = BUILD_FOLDER + 'omnisd/'

const FPATHS = {
  js: {
    src: SOURCE_FOLDER + 'js/**/*.js',
    src_min: SOURCE_FOLDER + 'js/**/*.min.js',
    dest: DEPLOY_BUILD_FOLDER + 'js/'
  },
  css: {
    src: SOURCE_FOLDER + 'css/**/*.css',
    dest: DEPLOY_BUILD_FOLDER + 'css/'
  },
  html: {
    src: SOURCE_FOLDER + '*.html',
    dest: DEPLOY_BUILD_FOLDER
  },
  icons: {
    src: SOURCE_FOLDER + 'icons/**/*.png',
    dest: DEPLOY_BUILD_FOLDER + 'icons/'
  },
  locales: {
    src: SOURCE_FOLDER + 'locales/**/*.properties',
    dest: 'dist/deploy/locales/'
  },
  manifest: {
    src: SOURCE_FOLDER + 'manifest.webapp',
    dest: DEPLOY_BUILD_FOLDER
  },
  omnisd_manifests: {
    src: ['src/metadata.json', 'src/update.webapp'],
    dest: OMNISD_BUILD_FOLDER + 'tmp/'
  }
}

function onErr (err) {
  const constructMessage = 'An error occured in gulp:\n\n' + err.toString()
  log.error(constructMessage)
  process.exit(-1)
}

function jsTask() {
  return src(FPATHS.js.src).pipe(plumber({errorHandler: onErr})).pipe(minifyJS()).pipe(plumber.stop()).pipe(dest(FPATHS.js.dest))
}

function jsMinTask () {
  return src(FPATHS.js.src_min).pipe(plumber({errorHandler: onErr})).pipe(plumber.stop()).pipe(dest(FPATHS.js.dest))
}

function cssTask () {
  return src(FPATHS.css.src).pipe(plumber({ errorHandler: onErr })).pipe(minifyCSS()).pipe(plumber.stop()).pipe(dest(FPATHS.css.dest))
}

function htmlTask () {
  return src(FPATHS.html.src).pipe(plumber({ errorHandler: onErr })).pipe(minifyHTML()).pipe(plumber.stop()).pipe(dest(FPATHS.html.dest))
}

function localeTask () {
  return src(FPATHS.locales.src).pipe(plumber({errorHandler: onErr})).pipe(plumber.stop()).pipe(dest(FPATHS.locales.dest))
}

function iconsTask () {
  return src(FPATHS.icons.src).pipe(plumber({ errorHandler: onErr })).pipe(plumber.stop()).pipe(dest(FPATHS.icons.dest))
}

function manifestTask () {
  return src(FPATHS.manifest.src).pipe(plumber({ errorHandler: onErr })).pipe(plumber.stop()).pipe(dest(FPATHS.manifest.dest))
}

function cleanBuildAll () {
  return rm([BUILD_FOLDER + '*'])
}

function cleanBuildDeploy () {
  return rm([DEPLOY_BUILD_FOLDER])
}

function cleanBuildOmniSD () {
  return rm([OMNISD_BUILD_FOLDER])
}

const DEFAULT_BUILD_TASKS = parallel(jsTask, jsMinTask, cssTask, htmlTask, localeTask, iconsTask, manifestTask)

exports.clean = cleanBuildAll
exports.clean_deploy = cleanBuildDeploy
exports.clean_omnisd = cleanBuildOmniSD

exports.default = series(cleanBuildAll, DEFAULT_BUILD_TASKS)
