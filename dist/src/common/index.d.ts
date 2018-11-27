import { TransactionReceipt } from 'ethereum-types';
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
    isInjected: boolean;
    web3: any;
    constructor(isInjected: boolean, web3: any);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    getBalancesWithAccounts: () => Promise<{
        address: string;
        etherBalance: number;
    }[]>;
    call: (params: CallParameters) => Promise<any>;
    sendTransaction: (params: TxParameters) => Promise<any>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    getResponseWhenMined: (functionCall: any) => Promise<{
        txReceipt: TransactionReceipt | undefined;
        txHash: string | undefined;
        response: any;
    }>;
    deploy: ({ code, abi, from, gas, gasPrice, args }: Execute) => Promise<{
        txHash: any;
        txReceipt: any;
    }>;
    getContract: (abi: any[], address: string) => any;
    estimateGas: (params: TxParameters) => Promise<number>;
    InjectedWeb3DeployContract: ({ abi, code, from, gas, args }: Execute) => Promise<{}>;
    InjectedDeploy: ({ abi, code, from, gas, args }: Execute) => Promise<{}>;
}
