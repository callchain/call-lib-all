"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var assert = require("assert");
var Validator = require('jsonschema').Validator;
var errors_1 = require("./errors");
// import {isValidAddress} from 'address-codec'
var address_codec_1 = require("../address-codec");
var utils_1 = require("./utils");
exports.isValidSecret = utils_1.isValidSecret;
function loadSchemas() {
    // listed explicitly for webpack (instead of scanning schemas directory)
    var schemas = [
        require('./schemas/objects/tx-json.json'),
        require('./schemas/objects/tx-type.json'),
        require('./schemas/objects/hash128.json'),
        require('./schemas/objects/hash256.json'),
        require('./schemas/objects/sequence.json'),
        require('./schemas/objects/signature.json'),
        require('./schemas/objects/issue.json'),
        require('./schemas/objects/issueSet.json'),
        require('./schemas/objects/ledgerversion.json'),
        require('./schemas/objects/max-adjustment.json'),
        require('./schemas/objects/memo.json'),
        require('./schemas/objects/memos.json'),
        require('./schemas/objects/public-key.json'),
        require('./schemas/objects/uint32.json'),
        require('./schemas/objects/value.json'),
        require('./schemas/objects/source-adjustment.json'),
        require('./schemas/objects/destination-adjustment.json'),
        require('./schemas/objects/tag.json'),
        require('./schemas/objects/lax-amount.json'),
        require('./schemas/objects/lax-lax-amount.json'),
        require('./schemas/objects/min-adjustment.json'),
        require('./schemas/objects/source-exact-adjustment.json'),
        require('./schemas/objects/destination-exact-adjustment.json'),
        require('./schemas/objects/tx-hash.json'),
        require('./schemas/objects/address.json'),
        require('./schemas/objects/adjustment.json'),
        require('./schemas/objects/quality.json'),
        require('./schemas/objects/amount.json'),
        require('./schemas/objects/amount-base.json'),
        require('./schemas/objects/balance.json'),
        require('./schemas/objects/blob.json'),
        require('./schemas/objects/currency.json'),
        require('./schemas/objects/signed-value.json'),
        require('./schemas/objects/orderbook.json'),
        require('./schemas/objects/instructions.json'),
        require('./schemas/objects/settings.json'),
        require('./schemas/specifications/settings.json'),
        require('./schemas/specifications/payment.json'),
        require('./schemas/specifications/escrow-cancellation.json'),
        require('./schemas/specifications/order-cancellation.json'),
        require('./schemas/specifications/order.json'),
        require('./schemas/specifications/escrow-execution.json'),
        require('./schemas/specifications/escrow-creation.json'),
        require('./schemas/specifications/payment-channel-create.json'),
        require('./schemas/specifications/payment-channel-fund.json'),
        require('./schemas/specifications/payment-channel-claim.json'),
        require('./schemas/specifications/trustline.json'),
        require('./schemas/output/sign.json'),
        require('./schemas/output/submit.json'),
        require('./schemas/output/get-account-info.json'),
        require('./schemas/output/get-balances.json'),
        require('./schemas/output/get-balance-sheet.json'),
        require('./schemas/output/get-ledger.json'),
        require('./schemas/output/get-orderbook.json'),
        require('./schemas/output/get-orders.json'),
        require('./schemas/output/order-change.json'),
        require('./schemas/output/get-payment-channel.json'),
        require('./schemas/output/prepare.json'),
        require('./schemas/output/ledger-event.json'),
        require('./schemas/output/get-paths.json'),
        require('./schemas/output/get-server-info.json'),
        require('./schemas/output/get-settings.json'),
        require('./schemas/output/orderbook-orders.json'),
        require('./schemas/output/outcome.json'),
        require('./schemas/output/get-transaction.json'),
        require('./schemas/output/get-transactions.json'),
        require('./schemas/output/get-trustlines.json'),
        require('./schemas/output/sign-payment-channel-claim.json'),
        require('./schemas/output/verify-payment-channel-claim.json'),
        require('./schemas/input/get-balances.json'),
        require('./schemas/input/get-balance-sheet.json'),
        require('./schemas/input/get-ledger.json'),
        require('./schemas/input/get-orders.json'),
        require('./schemas/input/get-orderbook.json'),
        require('./schemas/input/get-paths.json'),
        require('./schemas/input/get-payment-channel.json'),
        require('./schemas/input/api-options.json'),
        require('./schemas/input/get-settings.json'),
        require('./schemas/input/get-account-info.json'),
        require('./schemas/input/get-transaction.json'),
        require('./schemas/input/get-transactions.json'),
        require('./schemas/input/get-trustlines.json'),
        require('./schemas/input/prepare-payment.json'),
        require('./schemas/input/prepare-order.json'),
        require('./schemas/input/prepare-trustline.json'),
        require('./schemas/input/prepare-order-cancellation.json'),
        require('./schemas/input/prepare-settings.json'),
        require('./schemas/input/prepare-issue-set.json'),
        require('./schemas/input/prepare-escrow-creation.json'),
        require('./schemas/input/prepare-escrow-cancellation.json'),
        require('./schemas/input/prepare-escrow-execution.json'),
        require('./schemas/input/prepare-payment-channel-create.json'),
        require('./schemas/input/prepare-payment-channel-fund.json'),
        require('./schemas/input/prepare-payment-channel-claim.json'),
        require('./schemas/input/compute-ledger-hash.json'),
        require('./schemas/input/sign.json'),
        require('./schemas/input/submit.json'),
        require('./schemas/input/generate-address.json'),
        require('./schemas/input/sign-payment-channel-claim.json'),
        require('./schemas/input/verify-payment-channel-claim.json'),
        require('./schemas/input/combine.json')
    ];
    var titles = schemas.map(function (schema) { return schema.title; });
    var duplicates = _.keys(_.pickBy(_.countBy(titles), function (count) { return count > 1; }));
    assert(duplicates.length === 0, 'Duplicate schemas for: ' + duplicates);
    var validator = new Validator();
    // Register custom format validators that ignore undefined instances
    // since jsonschema will still call the format validator on a missing
    // (optional)  property
    validator.customFormats.address = function (instance) {
        if (instance === undefined) {
            return true;
        }
        return address_codec_1.isValidAddress(instance);
    };
    validator.customFormats.secret = function (instance) {
        if (instance === undefined) {
            return true;
        }
        return utils_1.isValidSecret(instance);
    };
    // Register under the root URI '/'
    _.forEach(schemas, function (schema) { return validator.addSchema(schema, '/' + schema.title); });
    return validator;
}
var schemaValidator = loadSchemas();
function schemaValidate(schemaName, object) {
    // Lookup under the root URI '/'
    var schema = schemaValidator.getSchema('/' + schemaName);
    if (schema === undefined) {
        throw new errors_1.ValidationError('no schema for ' + schemaName);
    }
    var result = schemaValidator.validate(object, schema);
    if (!result.valid) {
        throw new errors_1.ValidationError(result.errors.join());
    }
}
exports.schemaValidate = schemaValidate;
//# sourceMappingURL=schema-validator.js.map