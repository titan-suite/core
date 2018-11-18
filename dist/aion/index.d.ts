import { TransactionReceipt } from 'ethereum-types';
export interface Deploy {
    code: string;
    mainAccount: string;
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
export default class Aion {
    nodeAddress: string;
    constructor(nodeAddress: string);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    unlock: (address: string, password: string) => Promise<boolean>;
    deploy: ({ code, mainAccount, gas, gasPrice, contractArguments }: Deploy) => Promise<{
        txHash: string;
        txReceipt: TransactionReceipt;
    }>;
    sendTransaction: (params: TxParameters) => Promise<string>;
    getReceiptWhenMined: (txHash: string) => Promise<TransactionReceipt>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    estimateGas: ({ code, mainAccount, gas, gasPrice }: Deploy) => Promise<any>;
}
