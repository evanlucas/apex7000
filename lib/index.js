'use strict'

const debug = require('debug')('mdb3')
    , SP = require('serialport')
    , EE = require('events').EventEmitter
    , inherits = require('util').inherits
    , assert = require('assert')
    , dataTypes = require('./datatypes')
    , checksum = require('./checksum')
    , billTypes = require('./billtypes')

module.exports = MDB3

function MDB3(opts) {
  if (!(this instanceof MDB3))
    return new MDB3(opts)

  assert(opts, 'opts is required')
  assert(opts.path, 'opts.path is required')

  EE.call(this)

  this.serial = null
  this.ack = 0x1
  this.opts = opts
  this.opts.interval = opts.interval || 100
  this.loop = null
  this.status = ''
  /* istanbul ignore if */
  if (process.env.NODE_ENV !== 'test')
    this._setup()

  var self = this

  Object.defineProperty(this, 'isOpen', {
    get: function() {
      return self.serial.isOpen()
    }
  })
}
inherits(MDB3, EE)

/* istanbul ignore next */
MDB3.prototype._setup = function _setup() {
  var self = this

  this.serial = new SP.SerialPort(this.opts.path, {
    baudrate: 9600
  , databits: 7
  , stopbits: 1
  , parity: 'even'
  , bufferSize: 256
  , parser: SP.parsers.byteLength(11)
  , openImmediately: false
  })

  this.serial.on('open', function() {
    debug('open')
    self.emit('open')
  })

  this.serial.on('close', function() {
    debug('close')
    self.emit('close')
  })

  this.serial.on('data', function(buf) {
    debug('data: %j', buf.toString('hex'))
    self._process(buf)
  })

  this.serial.on('error', function(err) {
    process.nextTick(function() {
      self.emit('error', err)
    })
  })
}

MDB3.prototype.open = function open(cb) {
  this.serial.open(cb)
}

MDB3.prototype.close = function close(cb) {
  this.serial.close(cb)
}

MDB3.prototype._process = function _process(buf) {
  debug('_process: %s', buf.toString('hex'))
  var self = this
  var three = buf[3]
  var four = buf[4]
  var five = buf[5]

  if (three & 1)
    this.updateStatus('IDLING')

  if (three & 2) {
    this.updateStatus('ACCEPTING')
    this.emit('accepting')
  }

  if (three & 4) {
    if (this.status !== 'ESCROWED') {
      var billType = billTypes.getBillType(five)

      this.emit('escrow', billType, billTypes.getUSD(billType))
    }

    this.updateStatus('ESCROWED')
  }

  if (three & 8)
    this.updateStatus('STACKING')

  if (four << 4 === 0)
    this.error('ECASSETTEMISSING')

  if (four & 1)
    this.error('ECHEATING')

  if (four & 2)
    this.error('EBILLREJECTED')

  if (four & 4)
    this.error('EBILLJAMMED')

  if (four & 8)
    this.error('ESTACKFULL')

  if (five & 2)
    this.error('EINVALCMD')

  if (five & 4)
    this.error('EACCFAIL')
}

MDB3.prototype.flipAckBit = function flipAckBit() {
  this.ack = this.ack === 0
    ? 0x1
    : 0x0

  return this.ack
}

MDB3.prototype.message = function message(data) {
  var msgType = dataTypes[data]
  var four = data === 'escrow'
    ? 0x10 | 0x20
    : 0x10
  var msg = [
    0x02                          // start
  , 0x08                          // len
  , 0x10 | this.flipAckBit()      // ack
  , 0x7F                          // bills
  , four                          // escrow
  , 0x00                          // resv'd
  , 0x03                          // end
  , 0x00
  ]

  msg[7] = checksum(msg)
  return new Buffer(msg)
}

MDB3.prototype.stack = function stack() {
  this.write(this.message('stack'))
}

MDB3.prototype.reject = function reject() {
  this.write(this.message('reject'))
}

MDB3.prototype.error = function error(type) {
  debug('error: %s', type)
  if (this.status === 'ERROR')
    return

  this.stop()
  this.status = 'ERROR'
  var err = new Error('Bill Acceptor Error')
  err.code = type
  this.emit('error', err)
}

MDB3.prototype.updateStatus = function updateStatus(status) {
  debug('status %s', status)
  this.status = status
  this.emit('status', status)
}

MDB3.prototype.accept = function accept() {
  var self = this

  this.loop = setInterval(function() {
    self.write(self.message('escrow'))
  }, this.opts.interval)
}

MDB3.prototype.stop = function stop() {
  clearTimeout(this.loop)
}

MDB3.prototype.write = function write(msg) {
  debug('write: %s', msg.toString('hex'))
  this.serial.write(msg)
}
