import { TransactionReceipt } from 'ethereum-types';
export interface Deploy {
    bytecode: string;
    from: string;
    gas?: number;
    gasPrice?: number;
    contractArguments?: string;
}
export interface TxParameters {
    from: string;
    to?: string;
    gas?: number;
    gasPrice?: number;
    value?: number;
    data: string;
    nonce?: number;
}
export interface CallParameters {
    from: string;
    to: string;
    gas?: number;
    gasPrice?: number;
    value?: number;
    data?: string;
}
export default class Aion {
    nodeAddress: string;
    constructor(nodeAddress: string);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    compile: (contract: string) => Promise<{
        [key: string]: any;
    }>;
    unlock: (address: string, password: string) => Promise<boolean>;
    call: (params: CallParameters) => Promise<any>;
    sendTransaction: (params: TxParameters) => Promise<string>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    getReceiptWhenMined: (txHash: string) => Promise<TransactionReceipt>;
    deploy: ({ bytecode, from, gas, gasPrice, contractArguments }: Deploy) => Promise<{
        txReceipt: TransactionReceipt;
        txHash: string;
    }>;
    estimateGas: ({ bytecode, from, gas, gasPrice }: Deploy) => Promise<number>;
}
