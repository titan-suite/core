import { AbiDefinition, TransactionReceipt } from 'ethereum-types';
export declare const getAccounts: (web3: any) => Promise<{}>;
export declare const getBalance: ({ address }: {
    address: string;
}, web3: any) => Promise<{}>;
export declare const compile: ({ contract }: {
    contract: string;
}, web3: any) => Promise<{
    [key: string]: any;
}>;
export declare const unlock: ({ mainAccount, mainAccountPass }: {
    mainAccount: string;
    mainAccountPass: string;
}, web3: any) => Promise<{}>;
export declare const deploy: ({ abi, code, mainAccount, gas, contractArguments }: {
    abi: AbiDefinition[];
    code: string;
    mainAccount: string;
    gas: number;
    contractArguments: string | null | undefined;
}, web3: any) => Promise<{
    abi?: AbiDefinition[] | undefined;
    address?: string | undefined;
    receipt?: TransactionReceipt | undefined;
}>;
