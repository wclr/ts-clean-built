#!/usr/bin/env node
const del = require('del')
const dir = process.argv[2]
if (dir) {
  process.chdir(dir)
}
const excludeFilders = [
  'node_modules',
  'bower_components',
  'jspm_packges'
]

const patterns = ['**/*.js',  '**/*.js.map',  '**/*.d.ts']
.concat(excludeFilders.map(folder => '!**/' + folder + '/**'))
console.log('Removing ' + patterns.join(' '))
del.sync(patterns)
console.log('Done!')