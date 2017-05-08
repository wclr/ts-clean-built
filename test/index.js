const fs = require('fs-extra')
const execSync = require('child_process').execSync
const { doesNotThrow, throws } = require('assert')

const checkExists = (path) =>
  doesNotThrow(() => fs.accessSync('test/tmp/' + path), path)

const checkNotExists = (path, message) =>
  throws(() => fs.accessSync('test/tmp/' + path), path)

describe('ts built built', () => {

  describe('cleaning only near *.ts', () => {
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

    it('does not touch oprhan files', () => {
      checkExists('orphan.js')
    })
    it('removes all *.js *.d.ts *.js.map files', () => {
      checkNotExists('a.js')
      checkNotExists('a.d.js')
      checkNotExists('a.js.map')
      checkNotExists('nested/a.js')
      checkNotExists('nested/a.d.js')
      checkNotExists('nested/a.js.map')
    })
    it('does not remove *.js in node_modules', () => {
      checkExists('node_modules/package/a.js')
      checkExists('nested/node_modules/package/a.js')
    })
  })

  describe('cleaning all *.js, *.d.ts, *.js.map', () => {
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

    it('removes also oprhan files', () => {
      checkNotExists('orphan.js')
    })

    it('removes all *.js *.d.ts *.js.map files', () => {
      checkNotExists('a.js')
      checkNotExists('a.d.js')
      checkNotExists('a.js.map')
      checkNotExists('nested/a.js')
      checkNotExists('nested/a.d.js')
      checkNotExists('nested/a.js.map')
    })
    it('does not remove *.js in node_modules', () => {
      checkExists('node_modules/package/a.js')
      checkExists('nested/node_modules/package/a.js')
    })
  })
})
