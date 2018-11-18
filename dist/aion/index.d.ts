export interface Deploy {
    code: string;
    mainAccount: string;
    gas: number;
    gasPrice: number;
    contractArguments?: string;
}
export default class Aion {
    nodeAddress: string;
    constructor(nodeAddress: string);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    sha3: (input: string) => Promise<number>;
    compile: (input: string) => Promise<any>;
    unlock: (address: string, password: string) => Promise<boolean>;
    deploy: ({ code, mainAccount, gas, gasPrice, contractArguments }: Deploy) => Promise<void>;
    estimateGas: ({ code, mainAccount, gas, gasPrice }: Deploy) => Promise<any>;
}
