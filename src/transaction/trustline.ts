import * as _ from 'lodash'
import BigNumber from 'bignumber.js'
import * as utils from './utils'
const validate = utils.common.validate
const trustlineFlags = utils.common.txFlags.TrustSet
import {Instructions, Prepare} from './types'
import {TrustLineSpecification} from '../ledger/trustlines-types'

function convertQuality(quality) {
  return (new BigNumber(quality)).shift(9).truncated().toNumber()
}

function createTrustlineTransaction(account: string,
  trustline: TrustLineSpecification
): Object {
  const limit = {
    currency: trustline.currency,
    issuer: trustline.counterparty,
    value: trustline.limit
  }

  const txJSON: any = {
    TransactionType: 'TrustSet',
    Account: account,
    LimitAmount: limit,
    Flags: 0
  }
  if (trustline.qualityIn !== undefined) {
    txJSON.QualityIn = convertQuality(trustline.qualityIn)
  }
  if (trustline.qualityOut !== undefined) {
    txJSON.QualityOut = convertQuality(trustline.qualityOut)
  }
  if (trustline.authorized === true) {
    txJSON.Flags |= trustlineFlags.SetAuth
  }
  if (trustline.callingDisabled !== undefined) {
    txJSON.Flags |= trustline.callingDisabled ?
      trustlineFlags.NoCall : trustlineFlags.ClearNoCall
  }
  if (trustline.frozen !== undefined) {
    txJSON.Flags |= trustline.frozen ?
      trustlineFlags.SetFreeze : trustlineFlags.ClearFreeze
  }
  if (trustline.memos !== undefined) {
    txJSON.Memos = _.map(trustline.memos, utils.convertMemo)
  }
  return txJSON
}

function prepareTrustline(address: string,
  trustline: TrustLineSpecification, instructions: Instructions = {}
): Promise<Prepare> {
  validate.prepareTrustline({address, trustline, instructions})
  const txJSON = createTrustlineTransaction(address, trustline)
  return utils.prepareTransaction(txJSON, this, instructions)
}

export default prepareTrustline
