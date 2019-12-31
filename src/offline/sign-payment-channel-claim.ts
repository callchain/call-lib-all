import * as common from '../common'
// import keypairs = require('keypairs')
import keypairs = require('../keypairs/distrib/npm')
// import binary = require('binary-codec')
import binary = require('../binary-codec/distrib/npm')

const {validate, callToDrops} = common

function signPaymentChannelClaim(channel: string, amount: string,
  privateKey: string
): string {
  validate.signPaymentChannelClaim({channel, amount, privateKey})

  const signingData = binary.encodeForSigningClaim({
    channel: channel,
    amount: callToDrops(amount)
  })
  return keypairs.sign(signingData, privateKey)
}

export default signPaymentChannelClaim
