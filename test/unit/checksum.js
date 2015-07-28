'use strict'

const test = require('tap').test
    , checksum = require('../../lib/checksum')

test('checksum', function(t) {
  var msg = [
    0x02
  , 0x08
  , 0x10
  , 0x7F
  , 0x10
  , 0x00
  , 0x03
  ]

  var out = checksum(msg)
  t.deepEqual(out, 119)
  t.end()
})
