import { TransactionReceipt } from 'ethereum-types';
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
export interface Execute {
    bytecode: string;
    from: string;
    gas?: number;
    gasPrice?: number;
    parameters?: any[];
    padLength?: number;
}
export default class Common {
    nodeAddress: string;
    constructor(nodeAddress: string);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    getBalancesWithAccounts: () => Promise<{
        address: string;
        etherBalance: number;
    }[]>;
    call: (params: CallParameters) => Promise<any>;
    sendTransaction: (params: TxParameters) => Promise<string>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    getReceiptWhenMined: (txHash: string) => Promise<TransactionReceipt>;
    deploy: ({ bytecode, from, gas, gasPrice, parameters, padLength }: Execute) => Promise<{
        txReceipt: TransactionReceipt;
        txHash: string;
    }>;
    estimateGas: ({ bytecode, from, gas, gasPrice, parameters, padLength }: Execute) => Promise<number>;
    convertParams: (params: any[], length: number) => any[];
}
