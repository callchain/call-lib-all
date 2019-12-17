import * as assert from 'assert'
import {parseQuality} from './utils'
import {txFlags, removeUndefined} from '../../common'
const flags = txFlags.TrustSet

function parseFlag(flagsValue, trueValue, falseValue) {
  if (flagsValue & trueValue) {
    return true
  }
  if (flagsValue & falseValue) {
    return false
  }
  return undefined
}

function parseFeeClaim(tx: any): Object {
  assert(tx.TransactionType === 'FeeClaim')

    return tx
}

export default parseFeeClaim
