import Common from '../../common';
export default class Ethereum extends Common {
    constructor(nodeAddress: string, isOldWeb3?: boolean, web3?: any);
    isMainnet: () => Promise<boolean>;
}
