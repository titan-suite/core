import Common from '../../common';
export default class Ethereum extends Common {
    constructor(nodeAddress: string, isInjected?: boolean, web3?: any);
    compile: (contract: string) => Promise<{
        [key: string]: any;
    }>;
}
