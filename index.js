#!/usr/bin/env node
const del = require('del')
const globby = require('globby')
const minimist = require('minimist')
const path = require('path')
const args = minimist(process.argv.slice(2), {
  boolean: true,
  string: ['exclude'],
})

const dir = path.resolve(args._[0] || '.')

const dot = args.dot
const quite = args.quite
const dry = args.dry
const allowDtd = args['allow-dts']
const filesList = args['files']
const prefix = args['prefix']

if (dir) {
  process.chdir(dir)
}

const excludeFolders = ['node_modules', 'bower_components', 'jspm_packages']
const excludePatterns = excludeFolders
  .map((folder) => '!**/' + folder + '/**')
  .concat(args.exclude || [])

const log = (...args) =>
  !quite && console.log(...(prefix ? ['[ts-clean-built] '] : []), ...args)

const remove = async (patterns, opts) => {
  return await del(patterns, { ...opts, dryRun: dry })
}

const tsPattern = ['**/*.ts', '**/*.tsx', '!**/*.d.ts'].concat(excludePatterns)
const dtsPattern = ['**/*.d.ts'].concat(excludePatterns)
const jsPattern = ['**/*.js'].concat(excludePatterns)

const run = async () => {
  if (args.all) {
    const patterns = ['**/*.js', '**/*.js.map', '**/*.d.ts'].concat(
      excludePatterns
    )
    log('Removing ALL', '.js, .d.ts, .js.map')
    return remove(patterns, { dot })
  } else if (args.old) {
    const makeDtsMap = (files, extRegEx) => {
      return files.reduce(
        (map, tsFile) => ({
          ...map,
          [tsFile.replace(extRegEx, '.d.ts')]: true,
        }),
        {}
      )
    }

    const tsFiles = await globby(tsPattern, { dot })
    const actualDtsFilesMap = makeDtsMap(tsFiles, /\.tsx?$/)

    const jsFiles = allowDtd ? await globby(jsPattern, { dot }) : []
    const notOrphanDtsFilesMap = makeDtsMap(jsFiles, /\.js?$/)

    const dTsFiles = await globby(dtsPattern, { dot })

    const notActualDts = dTsFiles.filter(
      (dtsFile) => !actualDtsFilesMap[dtsFile]
    )

    const toRemove = notActualDts
      .map((tsFile) => tsFile.replace(/\.d\.ts$/, '{.js,.js.map}'))
      .concat(
        notActualDts.filter((file) =>
          allowDtd ? notOrphanDtsFilesMap[file] : true
        )
      )
    log('Removing old', '.js, .d.ts, .js.map')
    return remove(toRemove)
  } else {
    const tsFiles = await globby(tsPattern)

    const toRemove = tsFiles
      .map((tsFile) => tsFile.replace(/\.tsx?$/, '{.js,.d.ts,.js.map}'))
      .concat(excludePatterns)
    log('Removing built versions .js, .d.ts, .js.map')
    return remove(toRemove)
  }
}

run()
  .then((removed) => {
    if (dry || filesList) {
      const list = removed.map((file) =>
        path.relative(dir || '.', file).replace(/\\/g, '/')
      )
      if (dry) {
        log('Dry mode, files to remove:')
        log(list)
      } else if (list.length) {
        log('List of files removed:')
        log(list)
      }
    } else {
      log('Removed', removed.length, 'files')
    }
  })
  .catch((e) => {
    console.error(e.message)
  })
