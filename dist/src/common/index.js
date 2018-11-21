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
const web3Utils = __importStar(require("web3-utils"));
const utils_1 = require("../../utils");
class Common {
    constructor(nodeAddress) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_accounts');
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_getBalance', [
                address,
                'latest'
            ]).then(balance => Number(web3Utils.fromWei(balance)));
        });
        this.getBalancesWithAccounts = () => __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.getAccounts();
            const accounts = [];
            for (const address of addresses) {
                const etherBalance = yield this.getBalance(address);
                accounts.push({
                    address,
                    etherBalance: Number(etherBalance)
                });
            }
            return accounts;
        });
        this.call = (params) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_call', [params]);
        });
        this.sendTransaction = (params) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_sendTransaction', [params]);
        });
        this.getTxReceipt = (txHash) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_getTransactionReceipt', [txHash]);
        });
        this.getReceiptWhenMined = (txHash) => __awaiter(this, void 0, void 0, function* () {
            const maxTries = 40;
            let tries = 0;
            while (tries < maxTries) {
                tries++;
                try {
                    if (process.env.NODE_ENV !== 'production') {
                        console.log('checking...');
                    }
                    let receipt = yield this.getTxReceipt(txHash);
                    if (receipt) {
                        return receipt;
                    }
                    yield utils_1.sleep(2000);
                }
                catch (e) {
                    throw e;
                }
            }
            throw new Error('Request timed out');
        });
        this.deploy = ({ bytecode, from, gas, gasPrice, parameters, padLength }) => __awaiter(this, void 0, void 0, function* () {
            let args = [];
            if (parameters && padLength) {
                args = this.convertParams(parameters, padLength);
            }
            const data = bytecode.concat(args.join(''));
            const txHash = yield this.sendTransaction({
                from,
                data,
                gas,
                gasPrice
            });
            if (!txHash) {
                throw new Error('Transaction Failed');
            }
            const txReceipt = yield this.getReceiptWhenMined(txHash);
            return { txReceipt, txHash };
        });
        this.estimateGas = ({ bytecode, from, gas, gasPrice, parameters, padLength }) => __awaiter(this, void 0, void 0, function* () {
            let args = [];
            if (parameters && padLength) {
                args = this.convertParams(parameters, padLength);
            }
            const data = bytecode.concat(args.join(''));
            return utils_1.rpcPost(this.nodeAddress, 'eth_estimateGas', [
                {
                    from,
                    data,
                    gas,
                    gasPrice
                }
            ]).then(estimatedGas => Number(web3Utils.hexToNumber(estimatedGas)));
        });
        this.convertParams = (params, length) => {
            let res = params.map((arg) => web3Utils.padLeft(web3Utils.toHex(arg).substring(2), length));
            return res;
        };
        this.nodeAddress = nodeAddress;
    }
}
exports.default = Common;
