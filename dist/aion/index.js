"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
// import solc from 'solc'
const utils = __importStar(require("web3-utils"));
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
class Aion {
    constructor(nodeAddress) {
        this.compile = async (contract) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_compileSolidity',
                params: [contract],
                id: 1
            });
            return result;
        };
        this.getAccounts = async () => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_accounts',
                params: [],
                id: 1
            });
            return result;
        };
        this.getBalance = async (address) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            });
            return +Aion.fromWei(result);
        };
        this.unlock = async (address, password) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'personal_unlockAccount',
                params: [address, password],
                id: 1
            });
            return result;
        };
        this.deploy = async ({ bytecode, from, gas, gasPrice, contractArguments }) => {
            let args = [];
            if (contractArguments) {
                for (const arg of contractArguments.split(',')) {
                    const hash = await Aion.sha3(arg);
                    const parsedHash = hash.substring(2, 10);
                    args.push(parsedHash);
                }
            }
            const data = bytecode.concat(args.join(''));
            const txHash = await this.sendTransaction({
                from,
                data,
                gas,
                gasPrice
            });
            const txReceipt = await this.getReceiptWhenMined(txHash);
            return { txHash, txReceipt };
        };
        this.sendTransaction = async (params) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_sendTransaction',
                params: [params],
                id: 1
            });
            return result;
        };
        this.getReceiptWhenMined = async (txHash) => {
            while (true) {
                try {
                    console.log('checking...');
                    let receipt = await this.getTxReceipt(txHash);
                    if (receipt && receipt.contractAddress) {
                        return receipt;
                    }
                    await sleep(3000);
                }
                catch (e) {
                    throw e;
                }
            }
        };
        this.getTxReceipt = async (txHash) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_getTransactionReceipt',
                params: [txHash],
                id: 1
            });
            return result;
        };
        this.estimateGas = async ({ bytecode, from, gas, gasPrice }) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_estimateGas',
                params: [
                    {
                        from,
                        data: bytecode,
                        gas,
                        gasPrice
                    }
                ],
                id: 1
            });
            return Aion.hexToNumber(result);
        };
        this.call = async (params) => {
            const { data: { result } } = await axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [params, 'latest'],
                id: 1
            });
            return result;
        };
        this.nodeAddress = nodeAddress;
    }
}
// public static compile = async (input: string): Promise<any> => {
//   // TODO https://github.com/ethereum/solc-js/pull/205
//   // const output = solc.compile(input, 1)
//   // return output
// }
Aion.sha3 = async (input) => {
    return utils.soliditySha3(input);
};
Aion.fromWei = async (input) => {
    return utils.fromWei(input);
};
Aion.toWei = async (input) => {
    return utils.toWei(input);
};
Aion.toHex = async (input) => {
    return utils.toHex(input);
};
Aion.hexToNumber = async (input) => {
    return utils.hexToNumber(input);
};
Aion.padLeft = async (target, characterAmount, sign) => {
    return utils.padLeft(target, characterAmount, sign);
};
exports.default = Aion;
