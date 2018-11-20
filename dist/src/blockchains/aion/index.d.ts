import Common from '../../common';
export interface Deploy {
    bytecode: string;
    from: string;
    gas?: number;
    gasPrice?: number;
    contractArguments?: string;
}
export default class Aion extends Common {
    constructor(nodeAddress: string);
    compile: (contract: string) => Promise<{
        [key: string]: any;
    }>;
    unlock: (address: string, password: string) => Promise<boolean>;
}
