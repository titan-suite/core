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
export interface SignedMessage {
    messageHash: string;
    signature: string;
    rawTransaction: string;
}
export default class Common {
    isOldWeb3: boolean;
    web3: any;
    constructor(isOldWeb3: boolean, web3: any);
    isMainnet: () => Promise<boolean>;
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<number>;
    getBalancesWithAccounts: () => Promise<{
        address: string;
        etherBalance: number;
    }[]>;
    call: (params: CallParameters) => Promise<any>;
    sendTransaction: (params: TxParameters) => Promise<any>;
    sendSignedTransaction: (rawTransaction: string) => Promise<{
        confirmation: number | undefined;
        txReceipt: TransactionReceipt | undefined;
        txHash: string | undefined;
        response: any;
    }>;
    getTxReceipt: (txHash: string) => Promise<TransactionReceipt>;
    getResponseWhenMined: (functionCall: any) => Promise<{
        confirmation: number | undefined;
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
    encodeArguments: (params: any[], length: number) => any[];
    signTransaction: (rawTx: Params, privateKey: string) => Promise<SignedMessage>;
    InjectedWeb3DeployContract: ({ abi, code, from, gas, args }: Execute) => Promise<{}>;
    InjectedDeploy: ({ abi, code, from, gas, args }: Execute) => Promise<{}>;
}
