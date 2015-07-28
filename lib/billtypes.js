'use strict'

const types = exports

const monies = [
  1
, 5
, 10
, 20
, 50
, 100
]
types.monies = monies

const moniesLen = monies.length

const billTypes = [
  0x08
, 0x18
, 0x20
, 0x28
, 0x30
, 0x38
]
types.billTypes = billTypes

types.getUSD = function(type) {
  if (moniesLen < type + 1) {
    throw new Error(`Invalid type ${type}`)
  }

  return monies[type]
}

types.getType = function(amount) {
  var idx = monies.indexOf(amount)
  if (!~idx)
    throw new Error(`Invalid amount ${amount}`)

  return idx + 1
}

types.getBillType = function(hex) {
  var idx = billTypes.indexOf(hex)
  if (!~idx)
    throw new Error(`Invalid hex ${hex}`)

  return idx
}
