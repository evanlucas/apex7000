'use strict'

const test = require('tap').test
    , billTypes = require('../../lib/billtypes')

test('monies', function(t) {
  t.plan(1)
  t.ok(billTypes.hasOwnProperty('monies'))
})

test('billTypes', function(t) {
  t.plan(1)
  t.ok(billTypes.hasOwnProperty('billTypes'))
})

test('getUSD', function(t) {
  t.equal(billTypes.getUSD(0), 1)
  t.equal(billTypes.getUSD(1), 5)
  t.equal(billTypes.getUSD(2), 10)
  t.equal(billTypes.getUSD(3), 20)
  t.equal(billTypes.getUSD(4), 50)
  t.equal(billTypes.getUSD(5), 100)
  t.throws(function() {
    billTypes.getUSD(7)
  }, /Invalid type 7/)
  t.end()
})

test('getType', function(t) {
  t.equal(billTypes.getType(1), 1)
  t.equal(billTypes.getType(5), 2)
  t.equal(billTypes.getType(10), 3)
  t.equal(billTypes.getType(20), 4)
  t.equal(billTypes.getType(50), 5)
  t.equal(billTypes.getType(100), 6)
  t.throws(function() {
    billTypes.getType(200)
  }, /Invalid amount 200/)
  t.end()
})

test('getBillType', function(t) {
  t.equal(billTypes.getBillType(0x08), 0)
  t.equal(billTypes.getBillType(0x18), 1)
  t.equal(billTypes.getBillType(0x20), 2)
  t.equal(billTypes.getBillType(0x28), 3)
  t.equal(billTypes.getBillType(0x30), 4)
  t.equal(billTypes.getBillType(0x38), 5)
  t.throws(function() {
    billTypes.getBillType(0x40)
  }, /Invalid hex 0x40/)
  t.end()
})
