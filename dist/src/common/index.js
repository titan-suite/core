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
class Common {
    constructor(nodeAddress, web3) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.getAccounts();
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            const balance = yield this.web3.eth.getBalance(address);
            return web3Utils.fromWei(balance);
        });
        this.getBalancesWithAccounts = () => __awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.getAccounts();
            if (!addresses) {
                return [];
            }
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
            return this.web3.eth.call(params);
        });
        this.sendTransaction = (params) => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.sendTransaction(params);
        });
        this.getTxReceipt = (txHash) => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.getTransactionReceipt(txHash);
        });
        this.getResponseWhenMined = (functionCall) => __awaiter(this, void 0, void 0, function* () {
            // const maxTries = 40
            // let tries = 0
            // while (tries < maxTries) {
            //   tries++
            //   try {
            //     if (process.env.NODE_ENV !== 'production') {
            //       console.log('checking...')
            //     }
            //     let receipt = await this.getTxReceipt(txHash)
            //     if (receipt) {
            //       return receipt
            //     }
            //     await sleep(2000)
            //   } catch (e) {
            //     throw e
            //   }
            // }
            // throw new Error('Request timed out')
            let txReceipt;
            let txHash;
            let confirmation;
            const response = yield functionCall
                .on('receipt', (Receipt) => {
                txReceipt = Receipt;
            })
                .on('error', (error) => {
                throw error;
            })
                .on('transactionHash', (TxHash) => {
                txHash = TxHash;
                console.log({ txHash });
            })
                .on('confirmation', (confNumber, confReceipt) => {
                confirmation = { confNumber, confReceipt };
            });
            return {
                txReceipt,
                txHash,
                confirmation,
                response
            };
        });
        this.deploy = ({ code, abi, from, gas = 5000000, gasPrice = 10000000000, args }) => __awaiter(this, void 0, void 0, function* () {
            const contract = new this.web3.eth.Contract(abi);
            return this.getResponseWhenMined(contract
                .deploy({
                data: code,
                arguments: args
            })
                .send({
                from,
                gas,
                gasPrice
            }));
        });
        this.getContract = (abi, address) => {
            return new this.web3.eth.Contract(abi, address);
        };
        this.estimateGas = (params) => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.estimateGas(params);
        });
        this.nodeAddress = nodeAddress;
        this.web3 = web3;
    }
}
exports.default = Common;
