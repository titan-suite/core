import Common from '../../common';
export default class Ethereum extends Common {
    constructor(nodeAddress: string);
    compile: (contract: string) => Promise<{
        [key: string]: any;
    }>;
}
