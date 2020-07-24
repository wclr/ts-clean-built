#!/usr/bin/env node
const del = require('del')
const globby = require('globby')
const minimist = require('minimist')
const path = require('path')
const args = minimist(process.argv.slice(2), {
  string: ['exclude', 'out', 'dir'],
  boolean: [
    'help',
    'built',
    'old',
    'dry',
    'all',
    'allow-dts',
    'files',
    'quite',
    'dot',
  ],
})

const dir = path.resolve(args.dir || args._[0] || '.')
const out = args.out ? path.resolve(args.out) : dir

const help = args.help
const dot = args.dot
const quite = args.quite
const dry = args.dry
const allowDtd = args['allow-dts']
const filesList = args['files']
const prefix = args['prefix']

if (help) {
  const helpMsg = [
    'Usage example:',
    'ts-clean-built --old --dry --out out',
    'Flags:',
    '--built - `.ts` files and removes corresponding `.js, .d.ts, .js.map',
    '--old - will search `.d.ts` files and remove corresponding `.js, .js.map` if no `.ts/tsx` version exists',
    '--allow-dts - used with `--old`, will not remove `.d.ts` if no corresponding `.ts` or `.js` exists, allowing to have leave `.d.ts` files',
    '--all - will remove all found `.js, .d.ts, .js.map` files, **potentially dangerous** option',
    '--dot - dot-folders excluded, to include use  flag',
    '--exclude - list of patterns to exclude from search, i.e. `--exclude **/my-folder/**` will exclude all files in all directories named `my-folder` in the tree',
    '--dry - will not remove files, just show the list to going to delete',
    '--files - outputs list of files removed',
    '--quite - will not output log messages.',
    '--out - root, where to search output files, equals to `dir` by default',
    '--dir - root, where to search source (*.ts) files, is `.` (cwd) by default',
    '[dir] - last argument, the same as `--dir`',
  ].join('\n')
  console.log(helpMsg)

  process.exit()
}

const excludeFolders = ['node_modules', 'bower_components', 'jspm_packages']
const excludePatterns = excludeFolders
  .map((folder) => '!**/' + folder + '/**')
  .concat(args.exclude || [])

const log = (...args) =>
  !quite && console.log(...(prefix ? ['[ts-clean-built] '] : []), ...args)

const remove = async (patterns, opts) => {
  return await del(patterns, { ...opts, dryRun: dry, cwd: out })
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

    const tsFiles = await globby(tsPattern, { dot, cwd: dir })
    const actualDtsFilesMap = makeDtsMap(tsFiles, /\.tsx?$/)

    const jsFiles = allowDtd ? await globby(jsPattern, { dot, cwd: out }) : []
    const notOrphanDtsFilesMap = makeDtsMap(jsFiles, /\.js?$/)

    const dTsFiles = await globby(dtsPattern, { dot, cwd: out })

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
  } else if (args.built) {
    const tsFiles = await globby(tsPattern, { cwd: dir })

    const toRemove = tsFiles
      .map((tsFile) => tsFile.replace(/\.tsx?$/, '{.js,.d.ts,.js.map}'))
      .concat(excludePatterns)
    log('Removing built versions .js, .d.ts, .js.map')
    return remove(toRemove)
  } else {
    console.log(
      [
        'Warning: you should provide flag which files to clean.',
        'This is to prevent unintentional deletion of files.',
        'Use --help flag to read docs about options.',
        'Use --dry flag to check desired behaviour.',
      ].join('\n')
    )
  }
}

run()
  .then((removed) => {
    if (!removed) return
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
