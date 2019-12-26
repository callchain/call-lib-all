var assert = require('assert');
var loadFixture = require('./utils').loadFixture;
var ledgerHashes = require('../src/ledger-hashes');
var transactionTreeHash = ledgerHashes.transactionTreeHash, ledgerHash = ledgerHashes.ledgerHash, accountStateHash = ledgerHashes.accountStateHash;
describe('Ledger Hashes', function () {
    function testFactory(ledgerFixture) {
        describe("can calculate hashes for " + ledgerFixture, function () {
            var ledger = loadFixture(ledgerFixture);
            it('computes correct account state hash', function () {
                assert.equal(accountStateHash(ledger.accountState).toHex(), ledger.account_hash);
            });
            it('computes correct transaction tree hash', function () {
                assert.equal(transactionTreeHash(ledger.transactions).toHex(), ledger.transaction_hash);
            });
            it('computes correct ledger header hash', function () {
                assert.equal(ledgerHash(ledger).toHex(), ledger.hash);
            });
        });
    }
    testFactory('ledger-full-40000.json');
    testFactory('ledger-full-38129.json');
});
//# sourceMappingURL=ledger-test.js.map