"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// import solc from 'solc'
const utils = __importStar(require("web3-utils"));
const utils_1 = require("../utils");
class Aion {
    constructor(nodeAddress) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_accounts');
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_getBalance', [
                address,
                'latest'
            ]).then(balance => Aion.fromWei(balance));
        });
        this.compile = (contract) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_compileSolidity', [contract]);
        });
        this.unlock = (address, password) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'personal_unlockAccount', [
                address,
                password
            ]);
        });
        this.call = (params) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_call', [params, 'latest']);
        });
        this.sendTransaction = (params) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_sendTransaction', [params]);
        });
        this.getTxReceipt = (txHash) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_getTransactionReceipt', [txHash]);
        });
        this.getReceiptWhenMined = (txHash) => __awaiter(this, void 0, void 0, function* () {
            const maxTries = 20;
            let tries = 0;
            while (tries < maxTries) {
                try {
                    console.log('checking...');
                    let receipt = yield this.getTxReceipt(txHash);
                    if (receipt && receipt.contractAddress) {
                        return receipt;
                    }
                    yield utils_1.sleep(3000);
                    tries++;
                }
                catch (e) {
                    throw e;
                }
            }
            throw new Error('Request timed out');
        });
        this.deploy = ({ bytecode, from, gas, gasPrice, contractArguments }) => __awaiter(this, void 0, void 0, function* () {
            if (!from || from.length !== 66) {
                throw new Error('Invalid Account');
            }
            let args = [];
            if (contractArguments) {
                for (const arg of contractArguments.split(',')) {
                    const hash = Aion.sha3(arg);
                    const parsedHash = hash.substring(2, 10);
                    args.push(parsedHash);
                }
            }
            const data = bytecode.concat(args.join(''));
            let txHash;
            return this.sendTransaction({
                from,
                data,
                gas,
                gasPrice
            })
                .then(TxHash => {
                console.log({ TxHash });
                txHash = TxHash;
                if (!txHash) {
                    throw new Error('Transaction Failed');
                }
                return this.getReceiptWhenMined(txHash);
            })
                .then(txReceipt => {
                return { txReceipt, txHash };
            });
        });
        this.estimateGas = ({ bytecode, from, gas, gasPrice }) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_estimateGas', [
                {
                    from,
                    data: bytecode,
                    gas,
                    gasPrice
                }
            ]).then(estimatedGas => Aion.hexToNumber(estimatedGas));
        });
        this.nodeAddress = nodeAddress;
    }
}
// public static compile = async (input: string): Promise<any> => {
//   // TODO https://github.com/ethereum/solc-js/pull/205
//   // const output = solc.compile(input, 1)
//   // return output
// }
Aion.sha3 = (input) => {
    return utils.soliditySha3(input);
};
Aion.fromWei = (input) => {
    return Number(utils.fromWei(input));
};
Aion.toWei = (input) => {
    return utils.toWei(input);
};
Aion.toHex = (input) => {
    return utils.toHex(input);
};
Aion.hexToNumber = (input) => {
    return Number(utils.hexToNumber(input));
};
Aion.padLeft = (target, characterAmount, sign) => {
    return utils.padLeft(target, characterAmount, sign);
};
exports.default = Aion;
