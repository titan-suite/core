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
            const balance = yield utils_1.rpcPost(this.nodeAddress, 'eth_getBalance', [
                address,
                'latest'
            ]);
            return +Aion.fromWei(balance);
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
            while (true) {
                try {
                    console.log('checking...');
                    let receipt = yield this.getTxReceipt(txHash);
                    if (receipt && receipt.contractAddress) {
                        return receipt;
                    }
                    yield utils_1.sleep(3000);
                }
                catch (e) {
                    throw e;
                }
            }
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
        this.estimateGas = ({ bytecode, from, gas, gasPrice }) => __awaiter(this, void 0, void 0, function* () {
            const estimatedGas = yield utils_1.rpcPost(this.nodeAddress, 'eth_estimateGas', [
                {
                    from,
                    data: bytecode,
                    gas,
                    gasPrice
                }
            ]);
            return +Aion.hexToNumber(estimatedGas);
        });
        this.nodeAddress = nodeAddress;
    }
}
// public static compile = async (input: string): Promise<any> => {
//   // TODO https://github.com/ethereum/solc-js/pull/205
//   // const output = solc.compile(input, 1)
//   // return output
// }
Aion.sha3 = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.soliditySha3(input);
});
Aion.fromWei = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.fromWei(input);
});
Aion.toWei = (input) => __awaiter(this, void 0, void 0, function* () {
    return utils.toWei(input);
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
