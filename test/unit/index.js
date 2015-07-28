'use strict'

const test = require('tap').test
    , MDB3 = require('../../')
    , SP = require('../mock')
    , SerialPort = SP.SerialPort

var mdb = MDB3({
  path: '/test'
})

mdb.serial = new SerialPort('/test')

test('should emit open', function(t) {
  mdb.once('open', function() {
    t.ok('open event')
  })

  mdb.open(function() {
    t.equal(mdb.isOpen, true)
    t.end()
  })
})

test('should emit close', function(t) {
  mdb.once('close', function() {
    t.ok('close event')
  })

  mdb.close(function() {
    t.equal(mdb.isOpen, false)
    t.end()
  })
})

test('_process', function(t) {
  mdb.once('status', function(msg) {
    t.equal(msg, 'IDLING')
  })
  mdb._process(new Buffer('020b21011000001212033b', 'hex'))

  mdb.once('status', function(msg) {
    t.equal(msg, 'ACCEPTING')
  })
  mdb._process(new Buffer('020b210210000012120338', 'hex'))

  mdb.once('status', function(msg) {
    t.equal(msg, 'ESCROWED')
  })
  mdb.once('escrow', function(type, bill) {
    t.equal(type, 0)
    t.equal(bill, 1)
  })
  mdb._process(new Buffer('020b210410080012120336', 'hex'))

  mdb.once('status', function(msg) {
    t.equal(msg, 'STACKING')
  })
  mdb._process(new Buffer('020b21081008001212033a', 'hex'))

  mdb.once('error', function(err) {
    t.equal(err.code, 'ECASSETTEMISSING')
  })
  mdb._process(new Buffer('020b21000000001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'ECHEATING')
  })
  mdb._process(new Buffer('020b21000100001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'EBILLREJECTED')
  })
  mdb._process(new Buffer('020b21000200001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'EBILLJAMMED')
  })
  mdb._process(new Buffer('020b21000400001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'ESTACKFULL')
  })
  mdb._process(new Buffer('020b21000800001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'EINVALCMD')
  })
  mdb._process(new Buffer('020b21011002001212033b', 'hex'))

  mdb.status = 'IDLING'

  mdb.once('error', function(err) {
    t.equal(err.code, 'EACCFAIL')
  })
  mdb._process(new Buffer('020b21011004001212033b', 'hex'))

  t.end()
})

test('flipAckBit', function(t) {
  t.equal(mdb.ack, 1, 'starts as 0x1')
  var res = mdb.flipAckBit()
  t.equal(res, 0)
  t.equal(mdb.ack, 0, 'ends as 0x0')
  res = mdb.flipAckBit()
  t.equal(res, 1)
  t.equal(mdb.ack, 1, 'ends as 0x1')
  t.end()
})

test('message - escrow', function(t) {
  var data = 'escrow'
  var msg = mdb.message(data)
  var buf = new Buffer([2, 8, 16, 127, 48, 0, 3, 87])
  t.deepEqual(msg, buf)
  t.end()
})

test('message - reject', function(t) {
  var msg = mdb.message('reject')
  var buf = new Buffer([2, 8, 17, 127, 16, 0, 3, 118])
  t.deepEqual(msg, buf)
  t.end()
})

test('message - stack', function(t) {
  var msg = mdb.message('stack')
  var buf = new Buffer([2, 8, 16, 127, 16, 0, 3, 119])
  t.deepEqual(msg, buf)
  t.end()
})

test('stack', function(t) {
  var buf = new Buffer([2, 8, 17, 127, 16, 0, 3, 118])
  mdb.serial.once('write', function(msg) {
    t.deepEqual(buf, msg)
    t.end()
  })

  mdb.stack()
})

test('reject', function(t) {
  var buf = new Buffer([2, 8, 16, 127, 16, 0, 3, 119])
  mdb.serial.once('write', function(msg) {
    t.deepEqual(buf, msg)
    t.end()
  })

  mdb.reject()
})

test('updateStatus', function(t) {
  var s = 'IDLING'
  mdb.once('status', function(msg) {
    t.equal(msg, s)
    t.end()
  })

  mdb.updateStatus(s)
})

test('error', function(t) {
  mdb.once('error', function(err) {
    t.equal(err.code, 'EBILLREJECTED')
    t.equal(err.message, 'Bill Acceptor Error')
    mdb.once('error', t.fail)
    mdb.error('TEST')
    t.end()
  })

  mdb.error('EBILLREJECTED')
})

test('accept', function(t) {
  mdb.serial.once('write', function(msg) {
    mdb.stop()
    t.end()
  })

  mdb.accept()
})
