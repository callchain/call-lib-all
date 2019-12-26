/**
 * Call ledger namespace prefixes.
 *
 * The Call ledger is a key-value store. In order to avoid name collisions,
 * names are partitioned into namespaces.
 *
 * Each namespace is just a single character prefix.
 */
module.exports = {
    account: 'a',
    dirNode: 'd',
    generatorMap: 'g',
    callState: 'r',
    offer: 'o',
    ownerDir: 'O',
    bookDir: 'B',
    contract: 'c',
    skipList: 's',
    amendment: 'f',
    feeSettings: 'e',
    signerList: 'S',
    escrow: 'u',
    paychan: 'x'
};
//# sourceMappingURL=ledgerspaces.js.map