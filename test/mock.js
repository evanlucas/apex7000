'use strict'

const EE = require('events')
    , inherits = require('util').inherits

exports.SerialPort = Mock
exports.parsers = {
  byteLength: function() {}
}

function Mock(path, opts) {
  if (!(this instanceof Mock))
    return new Mock(path, opts)

  EE.call(this)
  this.path = path
  this.opts = opts
  this._open = false
}
inherits(Mock, EE)

Mock.prototype.open = function(cb) {
  var self = this
  this._open = true
  process.nextTick(function() {
    self.emit('open')
    cb && cb()
  })
}

Mock.prototype.close = function(cb) {
  var self = this
  this._open = false
  process.nextTick(function() {
    self.emit('close')
    cb && cb()
  })
}

Mock.prototype.stop = function() {
  clearTimeout(this.loop)
}

Mock.prototype.accept = function() {
  var self = this

  this.loop = setInterval(function() {
    self.write(self.message('escrow'))
  }, this.opts.interval)
}

Mock.prototype.isOpen = function isOpen() {
  return this._open
}

Mock.prototype.write = function write(msg) {
  var self = this
  process.nextTick(function() {
    self.emit('write', msg)
  })
}
