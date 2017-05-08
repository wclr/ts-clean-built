#!/usr/bin/env node
const del = require('del')
const globby = require('globby')
const minimist = require('minimist')
const args = minimist(process.argv.slice(2), { boolean: true })

const dir = args._[0]
const dot = args.dot

if (dir) {
  process.chdir(dir)
}

const excludeFilders = [
  'node_modules',
  'bower_components',
  'jspm_packges'
]
const excludePatterns = excludeFilders.map(folder => '!**/' + folder + '/**')

if (args.all) {
  const patterns = ['**/*.js', '**/*.js.map', '**/*.d.ts']
    .concat(excludePatterns)
  console.log('Removing ALL' + patterns.join(' '))
  del.sync(patterns, { dot })
} else {
  console.log('Removing .js, .d.ts, .js.map' , 'nearby with corresponding *.ts')
  const patterns = ['**/*.ts', '!**/*.d.ts'].concat(excludePatterns)
  const tsFiles = globby.sync(patterns)  
  const builtPatterns = tsFiles.map(tsFile => tsFile.replace(/\.ts$/, '{.js,.d.ts,.js.map}'))
    .concat(excludePatterns)  
  del.sync(builtPatterns)
}

console.log('Done!')