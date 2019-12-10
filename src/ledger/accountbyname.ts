type AccountInfoOptions = {
  ledgerVersion?: number
}

function getAccountByName(name: string, options: AccountInfoOptions = {}) {
    function stringToHexWide(s) {//中英文转16进制
        var result = '';
        for (var i=0; i<s.length; i++) {
            var b = s.charCodeAt(i);
            if(0<=b && b<16){
                result += '000'+b.toString(16)
            }
            if(16<=b && b<255){
                result += '00'+b.toString(16)
            }
            if(255<=b && b<4095){
                result += '0'+b.toString(16)
            }
            if(4095<=b && b<65535){
                result += b.toString(16)
            }
        }
        return result;
    }
    const request = {
        command: 'nick_search',
        NickName: stringToHexWide(stringToHexWide(name)).toUpperCase(),
        ledger_index: options.ledgerVersion || 'validated'
    };
    return this.connection.request(request);
}
export default getAccountByName
