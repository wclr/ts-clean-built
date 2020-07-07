const fs = require('fs-extra')
const execSync = require('child_process').execSync
const { doesNotThrow, throws } = require('assert')

const checkExists = (paths, message) => {
  paths = Array.isArray(paths) ? paths : [paths]
  paths.forEach((path) => {
    doesNotThrow(() => fs.accessSync('test/tmp/' + path), path + ' should exist')
  })
}

const checkNotExists = (paths, message) => {
  paths = Array.isArray(paths) ? paths : [paths]
  paths.forEach((path) => {
    throws(() => fs.accessSync('test/tmp/' + path), path + ' should not exist')
  })
}
//
describe('ts-clean-built', () => {
  beforeEach(() => {
    // console.log = () => {}
  })
  describe('default - cleaning only near *.ts', () => {
    before(() => {
      fs.removeSync('test/tmp')
      fs.copySync('test/fixture', 'test/tmp')
      execSync('node index.js test/tmp', { stdio: 'inherit' })
    })

    it('does not remove *.ts files', () => {
      checkExists('a.ts')
      checkExists('nested/a.ts')
    })

    it('does not touch .dot folder', () => {
      checkExists('.dot/a.js')
    })

    it('does not touch orphan files', () => {
      checkExists('orphan.js')
    })
    it('removes all *.js *.d.ts *.js.map files', () => {
      checkNotExists('a.js')
      checkNotExists('a.d.ts')
      checkNotExists('a.js.map')
      checkNotExists('nested/a.js')
      checkNotExists('nested/a.d.ts')
      checkNotExists('nested/a.js.map')
    })
    it('does not remove *.js in node_modules', () => {
      checkExists('node_modules/package/a.js')
      checkExists('nested/node_modules/package/a.js')
    })
  })

  describe('--dry - not touching *.js, *.d.ts, *.js.map', () => {
    before(() => {
      fs.removeSync('test/tmp')
      fs.copySync('test/fixture', 'test/tmp')
      execSync('node index.js --dry test/tmp', { stdio: 'inherit' })
    })

    it('removes all *.js *.d.ts *.js.map files', () => {
      checkExists('a.js')
      checkExists('a.d.ts')
      checkExists('a.js.map')
    })
  })

  describe('--old - cleaning old *.js, *.d.ts, *.js.map', () => {
    before(() => {
      fs.removeSync('test/tmp')
      fs.copySync('test/fixture', 'test/tmp')
      execSync('node index.js test/tmp --dot --old', { stdio: 'inherit' })
    })

    it('remove old .d.ts and .js files', () => {
      checkNotExists([
        //'a.d.ts',
        //'nested/a.d.ts',
        'old/a.d.ts',
        'old/a.js',
        'old/orphan.d.ts',
      ])
    })
//
    it('does touch file without .d.ts in .dot folder', () => {
      checkExists('.dot/a.js')
    })

    it('does not touch orphan files', () => {
      checkExists('orphan.js')
    })

    it('does not remove *.js in node_modules', () => {
      checkExists('node_modules/package/a.js')
      checkExists('nested/node_modules/package/a.js')
    })
  })

  describe('--old -allow-dts - cleaning old, allow orphan *.d.ts, ', () => {
    before(() => {
      fs.removeSync('test/tmp')
      fs.copySync('test/fixture', 'test/tmp')
      execSync('node index.js test/tmp --dot --old --allow-dts', { stdio: 'inherit' })
    })

    it('remove old .d.ts and .js files', () => {
      checkNotExists([
        // 'a.d.ts',
        // 'nested/a.d.ts',
        'old/a.d.ts',
        'old/a.js',        
      ])
      checkExists('a.d.ts')
      checkExists('old/orphan.d.ts')
    })

  })

  describe('--all - cleaning all *.js, *.d.ts, *.js.map', () => {
    before(() => {
      fs.removeSync('test/tmp')
      fs.copySync('test/fixture', 'test/tmp')
      execSync('node index.js test/tmp --dot --all', { stdio: 'inherit' })
    })

    it('does not remove *.ts files', () => {
      checkExists('a.ts')
      checkExists('nested/a.ts')
    })

    it('removes in .dot folder', () => {
      checkNotExists('.dot/a.js')
    })

    it('removes also orphan files', () => {
      checkNotExists('orphan.js')
    })

    it('removes all *.js *.d.ts *.js.map files', () => {
      checkNotExists('a.js')
      checkNotExists('a.d.ts')
      checkNotExists('a.js.map')
      checkNotExists('nested/a.js')
      checkNotExists('nested/a.d.ts')
      checkNotExists('nested/a.js.map')
    })
    it('does not remove *.js in node_modules', () => {
      checkExists('node_modules/package/a.js')
      checkExists('nested/node_modules/package/a.js')
    })
  })
})
