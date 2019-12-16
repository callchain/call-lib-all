import * as _ from 'lodash'
import * as utils from './utils'
// const validate = utils.common.validate
const toCalledAmount = utils.common.toCalledAmount
const feeclaimFlags = utils.common.txFlags.FeeClaim
const ValidationError = utils.common.errors.ValidationError
import {Instructions, Prepare} from './types'
import {Amount, Adjustment, MaxAdjustment,
  MinAdjustment} from '../common/types'


type FeeClaim = {
  source: Adjustment & MaxAdjustment,
  destination: Adjustment & MinAdjustment
}

function isCALLToCALLFeeClaim(feeclaim: FeeClaim): boolean {
  const sourceCurrency = _.get(feeclaim, 'source.maxAmount.currency',
    _.get(feeclaim, 'source.amount.currency'))
  const destinationCurrency = _.get(feeclaim, 'destination.amount.currency',
    _.get(feeclaim, 'destination.minAmount.currency'))
  return sourceCurrency === 'QYBC' && destinationCurrency === 'QYBC'
}

function isIOUWithoutCounterparty(amount: Amount): boolean {
  return amount && amount.currency !== 'QYBC'
    && amount.counterparty === undefined
}

function applyAnyCounterpartyEncoding(feeclaim: FeeClaim): void {
  _.forEach([feeclaim.source, feeclaim.destination], adjustment => {
    _.forEach(['amount', 'minAmount', 'maxAmount'], key => {
      if (isIOUWithoutCounterparty(adjustment[key])) {
        adjustment[key].counterparty = adjustment.issuer
      }
    })
  })
}

function createMaximalAmount(amount: Amount): Amount {
  const maxCALLValue = '100000000000'
  const maxIOUValue = '9999999999999999e80'
  const maxValue = amount.currency === 'QYBC' ? maxCALLValue : maxIOUValue
  return _.assign({}, amount, {value: maxValue})
}

function createFeeClaimTransaction(address: string, feeclaimArgument: FeeClaim
): Object {
  const feeclaim = _.cloneDeep(feeclaimArgument)
  applyAnyCounterpartyEncoding(feeclaim)

  if (address !== feeclaim.source.address) {
    throw new ValidationError('address must match feeclaim.source.address')
  }

  if ((feeclaim.source.maxAmount && feeclaim.destination.minAmount) ||
      (feeclaim.source.amount && feeclaim.destination.amount)) {
    throw new ValidationError('feeclaim must specify either (source.maxAmount '
      + 'and destination.amount) or (source.amount and destination.minAmount)')
  }
  const amount = feeclaim.destination.minAmount && !isCALLToCALLFeeClaim(feeclaim) ?
    createMaximalAmount(feeclaim.destination.minAmount) :
    (feeclaim.destination.amount || feeclaim.destination.minAmount)

  const txJSON: any = {
    TransactionType: 'FeeClaim',
    Account: feeclaim.source.address,
    Destination: feeclaim.destination.address,
    Amount: toCalledAmount(amount),
    Flags: 0
  }

  if (feeclaim.invoiceID !== undefined) {
    txJSON.InvoiceID = feeclaim.invoiceID
  }
  if (feeclaim.invoice !== undefined) {
    txJSON.Invoice = utils.convertStringToHex(feeclaim.invoice)
  }
  if (feeclaim.source.tag !== undefined) {
    txJSON.SourceTag = feeclaim.source.tag
  }
  if (feeclaim.destination.tag !== undefined) {
    txJSON.DestinationTag = feeclaim.destination.tag
  }
  if (feeclaim.memos !== undefined) {
    txJSON.Memos = _.map(feeclaim.memos, utils.convertMemo)
  }
  if (feeclaim.noDirectCall === true) {
    txJSON.Flags |= feeclaimFlags.NoCallDirect
  }
  if (feeclaim.limitQuality === true) {
    txJSON.Flags |= feeclaimFlags.LimitQuality
  }
  if (!isCALLToCALLFeeClaim(feeclaim)) {
    if (feeclaim.allowPartialFeeClaim === true || feeclaim.destination.minAmount !== undefined) {
      txJSON.Flags |= feeclaimFlags.PartialFeeClaim
    }

    txJSON.SendMax = toCalledAmount(feeclaim.source.maxAmount || feeclaim.source.amount)

    if (feeclaim.destination.minAmount !== undefined) {
      txJSON.DeliverMin = toCalledAmount(feeclaim.destination.minAmount)
    }

    if (feeclaim.paths !== undefined) {
      txJSON.Paths = JSON.parse(feeclaim.paths)
    }
  } else if (feeclaim.allowPartialFeeClaim === true) {
    throw new ValidationError('QYBC to QYBC feeclaims cannot be partial feeclaims')
  }

  return txJSON
}

function prepareFeeClaim(address: string, feeclaim: FeeClaim,
  instructions: Instructions = {}
): Promise<Prepare> {
  // validate.prepareFeeClaim({address, feeclaim, instructions})
  const txJSON = createFeeClaimTransaction(address, feeclaim)
  return utils.prepareTransaction(txJSON, this, instructions)
}

export default prepareFeeClaim
