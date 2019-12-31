// import keypairs = require('keypairs')
import keypairs = require('../keypairs/distrib/npm')
// import binary = require('binary-codec')
import binary = require('../binary-codec/distrib/npm')
import {validate, callToDrops} from '../common'

function verifyPaymentChannelClaim(channel: string, amount: string,
  signature: string, publicKey: string
): string {
  validate.verifyPaymentChannelClaim({channel, amount, signature, publicKey})

  const signingData = binary.encodeForSigningClaim({
    channel: channel,
    amount: callToDrops(amount)
  })
  return keypairs.verify(signingData, signature, publicKey)
}

export default verifyPaymentChannelClaim
