'use strict'

const gulp = require('gulp-help')(require('gulp'))
const util = require('gulp-util')
const eslint = require('gulp-eslint')
const which = require('which')
const spawn = require('child_process').spawn

// Files to watch for changes
const jsFiles = ['./backend/**/**/*.js', './config.json']

var spawnedNode = null
var nodeEnv = process.env.NODE_ENV || 'development'
var motd = [
  '',
  '######################################',
  '#                                    #',
  '#         OTC Parity Backend         #',
  '#                                    #',
  '######################################',
  '',
  `NODE_ENV: ${nodeEnv}`,
  ''
]

motd.forEach((line) => { util.log(util.colors.green(line)) })

// Server
gulp.task('server', 'Start node server', () => {
  if (spawnedNode) {
    spawnedNode.kill()
    util.log(util.colors.yellow('Respawning node server'))
  } else {
    util.log(util.colors.green('Starting node server'))
  }

  spawnedNode = spawn(which.sync('node'), ['backend/index.js'], { stdio: 'inherit' })
  spawnedNode.on('close', (code) => {
    if (code === 8) util.log(util.colors.red('Error detected, waiting for changes...'))
  })
  spawnedNode.on('error', (error) => {
    util.log(util.colors.red(error))
  })
})

// Linter
gulp.task('lint', 'Process linter', () => {
  util.log(util.colors.green('Processing linter'))
  gulp.src(jsFiles).pipe(eslint()).pipe(eslint.format())
})

// Tasks
gulp.task('default', ['server'])
gulp.task('dev', ['lint', 'server'], () => {
  gulp.watch(jsFiles, ['lint', 'server'])
})

process.on('exit', () => {
  if (spawnedNode) spawnedNode.kill()
})
