const MDB3 = require('../../')

const runner = new MDB3({
  path: '/dev/tty.usbserial-14a74'
})

console.log('open:', runner.isOpen)

runner.open(function(err) {
  if (err) throw err
  console.log('open:', runner.isOpen)
  runner.accept()
})

runner.on('error', function(type) {
  runner.reject()
  console.log('error', type)
  runner.accept()
})

runner.on('escrow', function(billType, usd) {
  console.log('escrow', billType, usd)
  runner.stack()
})
