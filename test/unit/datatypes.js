'use strict'

const test = require('tap').test
    , dataTypes = require('../../lib/datatypes')

test('should be an object', function(t) {
  t.equal(dataTypes.escrow, 0x10)
  t.equal(dataTypes.stack, 0x20)
  t.equal(dataTypes.reject, 0x40)
  t.end()
})
