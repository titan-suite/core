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
    sha3: (input: any) => Promise<any>;
    toHex: (input: any) => Promise<string>;
    hexToNumber: (input: any) => Promise<number>;
    padLeft: (target: string, characterAmount: number, sign?: string | undefined) => Promise<string>;
    compile: (input: string) => Promise<any>;
    unlock: (address: string, password: string) => Promise<boolean>;
    deploy: ({ bytecode, from, gas, gasPrice, contractArguments }: Deploy) => Promise<{
        txHash: string;
        txReceipt: TransactionReceipt;
    }>;
    sendTransaction: (params: TxParameters) => Promise<string>;
    getReceiptWhenMined: (txHash: string) => Promise<TransactionReceipt>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    estimateGas: ({ bytecode, from, gas, gasPrice }: Deploy) => Promise<any>;
    call: (params: CallParameters) => Promise<any>;
}
