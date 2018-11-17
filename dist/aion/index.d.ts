import { AbiDefinition } from 'ethereum-types';
import Web3 from 'aion-web3-core';
interface Deploy {
    deployedAddress: string;
    abi: AbiDefinition[];
    code: string;
    mainAccount: string;
    gas: number;
    gasPrice: number;
    contractArguments: string;
}
export default class Aion {
    web3: Web3;
    constructor(providerUrl: string);
    getAccounts: () => Promise<string[]>;
    getBalance: (address: string) => Promise<string | import("bignumber.js").BigNumber>;
    unlock: (address: string, password: string) => boolean;
    deploy: ({ deployedAddress, abi, code, mainAccount, gas, gasPrice, contractArguments }: Deploy) => Promise<{
        receipt: undefined;
        txHash: undefined;
        confirmation: undefined;
        newContractInstance: import("../typings/aion-web3-core/types").Contract;
    }>;
    estimateGas: ({ deployedAddress, abi, code, mainAccount, gas, contractArguments }: Deploy) => Promise<number>;
}
export {};
