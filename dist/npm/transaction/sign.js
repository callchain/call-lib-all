"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("./utils");
// import keypairs = require('call-keypairs')
var keypairs = require("../call-keypairs");
// import binary = require('call-binary-codec')
var binary = require("../call-binary-codec");
// import {computeBinaryTransactionHash} from 'call-hashes'
var src_1 = require("../call-hashes/src");
var validate = utils.common.validate;
function computeSignature(tx, privateKey, signAs) {
    var signingData = signAs ?
        binary.encodeForMultisigning(tx, signAs) : binary.encodeForSigning(tx);
    return keypairs.sign(signingData, privateKey);
}
function sign(txJSON, secret, options) {
    // validate.sign({txJSON, secret})
    // we can't validate that the secret matches the account because
    // the secret could correspond to the regular key
    if (options === void 0) { options = {}; }
    var tx = JSON.parse(txJSON);
    if (tx.TxnSignature || tx.Signers) {
        throw new utils.common.errors.ValidationError('txJSON must not contain "TxnSignature" or "Signers" properties');
    }
    var keypair = keypairs.deriveKeypair(secret);
    tx.SigningPubKey = options.signAs ? '' : keypair.publicKey;
    if (options.signAs) {
        var signer = {
            Account: options.signAs,
            SigningPubKey: keypair.publicKey,
            TxnSignature: computeSignature(tx, keypair.privateKey, options.signAs)
        };
        tx.Signers = [{ Signer: signer }];
    }
    else {
        tx.TxnSignature = computeSignature(tx, keypair.privateKey);
    }
    var serialized = binary.encode(tx);
    return {
        signedTransaction: serialized,
        id: src_1.computeBinaryTransactionHash(serialized)
    };
}
exports.default = sign;
//# sourceMappingURL=sign.js.map