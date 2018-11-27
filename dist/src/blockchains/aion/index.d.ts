import Common from '../../common';
export default class Aion extends Common {
    constructor(nodeAddress: string, isOldWeb3?: boolean, web3?: any);
    compile: (contract: string) => Promise<{
        [key: string]: any;
    }>;
    unlock: (address: string, password: string, duration?: number) => Promise<boolean>;
}
