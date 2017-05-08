# ts-clean-built

> Safely removes *.js *.d.ts *.js.map files from directory excluding node_modules

## Install 

```
yarn add clean-ts-built --dev
```

## Usage

```
ts-clean-built [dir] [--dot] [--all]
```

By default searches `*.ts` files and removes corresponding `*.js *.d.ts *.js.map`, 
with `--all` flag will remove all found `*.js *.d.ts *.js.map` files.

Dot-folders excluded, use `--dot` flag or `ts-built .my-dot-folder`

## Licence
WTF.
