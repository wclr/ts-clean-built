# ts-clean-built

> Safely removes old/built `*.js *.d.ts *.js.map` files from working directory.

## Install

![npm (scoped)](https://img.shields.io/npm/v/ts-clean-built.svg?maxAge=86400) [![Build Status](https://travis-ci.com/whitecolor/ts-clean-built.svg?branch=master)](https://travis-ci.org/whitecolor/ts-clean-built)

```
npm install ts-clean-built -D
```

```
yarn add ts-clean-built --dev
```

## Usage

```
ts-clean-built [--old|--all] [--exclude folder1 folder2] [dir]
```

- By default running without flags shows warning.

- `--built` `.ts` files and removes corresponding `.js, .d.ts, .js.map`.

- `--old` - will search `.d.ts` files and remove corresponding `.js, .js.map` if no `.ts/tsx` version exists.

- `--allow-dts` - used with `--old`, will not remove `.d.ts` if no corresponding `.ts` or `.js` exists, allowing to have leave `.d.ts` files.

- `--all` - will remove all found `.js, .d.ts, .js.map` files, **potentially dangerous** option.

- `--dot` - dot-folders excluded, to include use flag.

- `--exclude` - list of patterns to exclude from search, i.e. `--exclude **/my-folder/**` will exclude all files in all directories named `my-folder` in the tree.

  `node_modules`, `bower_components`, `jspm_packages` are excluded by default.

- `--dry` - will not remove files, just show the list to going to delete.

- `--files` - outputs list of files removed.

- `--quite` - will not output log messages.

- `--out` - root, where to search output files, equals to `dir` by default.

- `--dir` - root, where to search source (\*.ts) files, is `.` (cwd) by default.

- `[dir]` - last argument, the same as `--dir`.

- `--help` - shows help info.

## Recipe

Add script `clean: ts-clean-built --old --out out --dir src` to your `package.json` and run it when ever needed.

## Licence

MIT.
