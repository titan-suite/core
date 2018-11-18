"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const solc_1 = __importDefault(require("solc"));
const utils = __importStar(require("web3-utils"));
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
class Aion {
    constructor(nodeAddress) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_accounts',
                params: [],
                id: 1
            });
            return result;
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_getBalance',
                params: [address, 'latest'],
                id: 1
            });
            return +result;
        });
        this.unlock = (address, password) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'personal_unlockAccount',
                params: [address, password],
                id: 1
            });
            return result;
        });
        this.deploy = ({ bytecode, from, gas, gasPrice, contractArguments }) => __awaiter(this, void 0, void 0, function* () {
            let args = [];
            if (contractArguments) {
                for (const arg of contractArguments.split(',')) {
                    const hash = yield Aion.sha3(arg);
                    const parsedHash = hash.substring(2, 10);
                    args.push(parsedHash);
                }
            }
            const data = bytecode.concat(args.join(''));
            const txHash = yield this.sendTransaction({
                from,
                data,
                gas,
                gasPrice
            });
            const txReceipt = yield this.getReceiptWhenMined(txHash);
            return { txHash, txReceipt };
        });
        this.sendTransaction = (params) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_sendTransaction',
                params: [params],
                id: 1
            });
            return result;
        });
        this.getReceiptWhenMined = (txHash) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                while (true) {
                    try {
                        console.log('checking...');
                        let receipt = yield this.getTxReceipt(txHash);
                        if (receipt && receipt.contractAddress) {
                            resolve(receipt);
                            break;
                        }
                        yield sleep(3000);
                    }
                    catch (e) {
                        reject(e);
                        break;
                    }
                }
            }));
        });
        this.getTxReceipt = (txHash) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_getTransactionReceipt',
                params: [txHash],
                id: 1
            });
            return result;
        });
        this.estimateGas = ({ bytecode, from, gas, gasPrice }) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
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
        });
        this.call = (params) => __awaiter(this, void 0, void 0, function* () {
            const { data: { result } } = yield axios_1.default.post(this.nodeAddress, {
                jsonrpc: '2.0',
                method: 'eth_call',
                params: [params, 'latest'],
                id: 1
            });
            return result;
        });
        this.nodeAddress = nodeAddress;
    }
}
Aion.compile = (input) => __awaiter(this, void 0, void 0, function* () {
    // TODO https://github.com/ethereum/solc-js/pull/205
    const output = solc_1.default.compile(input, 1);
    return output;
});
Aion.sha3 = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.soliditySha3(input);
});
Aion.toHex = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.toHex(input);
});
Aion.hexToNumber = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.hexToNumber(input);
});
Aion.padLeft = (target, characterAmount, sign) => __awaiter(this, void 0, void 0, function* () {
    return utils.padLeft(target, characterAmount, sign);
});
exports.default = Aion;
