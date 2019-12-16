"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var utils = require("./utils");
// const validate = utils.common.validate
var toCalledAmount = utils.common.toCalledAmount;
var feeclaimFlags = utils.common.txFlags.FeeClaim;
var ValidationError = utils.common.errors.ValidationError;
function isCALLToCALLFeeClaim(feeclaim) {
    var sourceCurrency = _.get(feeclaim, 'source.maxAmount.currency', _.get(feeclaim, 'source.amount.currency'));
    var destinationCurrency = _.get(feeclaim, 'destination.amount.currency', _.get(feeclaim, 'destination.minAmount.currency'));
    return sourceCurrency === 'QYBC' && destinationCurrency === 'QYBC';
}
function isIOUWithoutCounterparty(amount) {
    return amount && amount.currency !== 'QYBC'
        && amount.counterparty === undefined;
}
function applyAnyCounterpartyEncoding(feeclaim) {
    _.forEach([feeclaim.source, feeclaim.destination], function (adjustment) {
        _.forEach(['amount', 'minAmount', 'maxAmount'], function (key) {
            if (isIOUWithoutCounterparty(adjustment[key])) {
                adjustment[key].counterparty = adjustment.issuer;
            }
        });
    });
}
function createMaximalAmount(amount) {
    var maxCALLValue = '100000000000';
    var maxIOUValue = '9999999999999999e80';
    var maxValue = amount.currency === 'QYBC' ? maxCALLValue : maxIOUValue;
    return _.assign({}, amount, { value: maxValue });
}
function createFeeClaimTransaction(address, feeclaimArgument) {
    var feeclaim = _.cloneDeep(feeclaimArgument);
    applyAnyCounterpartyEncoding(feeclaim);
    if (address !== feeclaim.source.address) {
        throw new ValidationError('address must match feeclaim.source.address');
    }
    if ((feeclaim.source.maxAmount && feeclaim.destination.minAmount) ||
        (feeclaim.source.amount && feeclaim.destination.amount)) {
        throw new ValidationError('feeclaim must specify either (source.maxAmount '
            + 'and destination.amount) or (source.amount and destination.minAmount)');
    }
    var amount = feeclaim.destination.minAmount && !isCALLToCALLFeeClaim(feeclaim) ?
        createMaximalAmount(feeclaim.destination.minAmount) :
        (feeclaim.destination.amount || feeclaim.destination.minAmount);
    var txJSON = {
        TransactionType: 'FeeClaim',
        Account: feeclaim.source.address,
        Destination: feeclaim.destination.address,
        Amount: toCalledAmount(amount),
        Flags: 0
    };
    if (feeclaim.invoiceID !== undefined) {
        txJSON.InvoiceID = feeclaim.invoiceID;
    }
    if (feeclaim.invoice !== undefined) {
        txJSON.Invoice = utils.convertStringToHex(feeclaim.invoice);
    }
    if (feeclaim.source.tag !== undefined) {
        txJSON.SourceTag = feeclaim.source.tag;
    }
    if (feeclaim.destination.tag !== undefined) {
        txJSON.DestinationTag = feeclaim.destination.tag;
    }
    if (feeclaim.memos !== undefined) {
        txJSON.Memos = _.map(feeclaim.memos, utils.convertMemo);
    }
    if (feeclaim.noDirectCall === true) {
        txJSON.Flags |= feeclaimFlags.NoCallDirect;
    }
    if (feeclaim.limitQuality === true) {
        txJSON.Flags |= feeclaimFlags.LimitQuality;
    }
    if (!isCALLToCALLFeeClaim(feeclaim)) {
        if (feeclaim.allowPartialFeeClaim === true || feeclaim.destination.minAmount !== undefined) {
            txJSON.Flags |= feeclaimFlags.PartialFeeClaim;
        }
        txJSON.SendMax = toCalledAmount(feeclaim.source.maxAmount || feeclaim.source.amount);
        if (feeclaim.destination.minAmount !== undefined) {
            txJSON.DeliverMin = toCalledAmount(feeclaim.destination.minAmount);
        }
        if (feeclaim.paths !== undefined) {
            txJSON.Paths = JSON.parse(feeclaim.paths);
        }
    }
    else if (feeclaim.allowPartialFeeClaim === true) {
        throw new ValidationError('QYBC to QYBC feeclaims cannot be partial feeclaims');
    }
    return txJSON;
}
function prepareFeeClaim(address, feeclaim, instructions) {
    if (instructions === void 0) { instructions = {}; }
    // validate.prepareFeeClaim({address, feeclaim, instructions})
    var txJSON = createFeeClaimTransaction(address, feeclaim);
    return utils.prepareTransaction(txJSON, this, instructions);
}
exports.default = prepareFeeClaim;
//# sourceMappingURL=fee-claim.js.map