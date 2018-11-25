import * as Web3 from 'aion-web3';
export interface Params {
    to?: string;
    value?: number | string;
    gas?: number | string;
    gasPrice?: number | string;
    data?: string;
    nonce?: number;
}
export interface TxParameters extends Params {
    from: string;
}
export interface CallParameters extends Params {
    from?: string;
}
export interface Execute {
    code: string;
    abi: any[];
    from: string;
    gas?: number;
    gasPrice?: number;
    args?: any[];
}
export default class Common {
    nodeAddress: string;
    web3: Web3;
    constructor(nodeAddress: string, web3: Web3);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    getBalancesWithAccounts: () => Promise<{
        address: string;
        etherBalance: number;
    }[]>;
    call: (params: CallParameters) => Promise<string>;
    sendTransaction: (params: TxParameters) => Promise<string>;
    getTxReceipt: (txHash: string) => Promise<import("ethereum-types").TransactionReceipt | null>;
    getResponseWhenMined: (functionCall: any) => Promise<{
        txReceipt: undefined;
        txHash: undefined;
        confirmation: undefined;
        response: any;
    }>;
    deploy: ({ code, abi, from, gas, gasPrice, args }: Execute) => Promise<{
        txReceipt: undefined;
        txHash: undefined;
        confirmation: undefined;
        response: any;
    }>;
    getContract: (abi: any[], address: string) => any;
    estimateGas: (params: TxParameters) => Promise<number>;
}
