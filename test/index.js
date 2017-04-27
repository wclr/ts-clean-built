const fs = require('fs-extra')
const execSync = require('child_process').execSync
const { doesNotThrow, throws } = require('assert')

const checkExists = (path, message) =>
  doesNotThrow(() => fs.accessSync('test/tmp/' + path), message)

const checkNotExists = (path, message) =>
  throws(() => fs.accessSync('test/tmp/' + path), message)

describe('clean ts built', () => {

  before(() => {
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
