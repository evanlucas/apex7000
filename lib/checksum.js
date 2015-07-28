'use strict'

const debug = require('debug')('mdb3:checksum')

module.exports = function checksum(msg) {
  var chk = 0x00

  var len = msg.length - 2
  for (var i = 1; i < len; i++) {
    chk ^= msg[i]
  }

  debug('checksum: %s', chk)
  return chk
}
