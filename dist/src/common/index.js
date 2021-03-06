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
    constructor(isOldWeb3, web3) {
        this.getNetworkId = () => __awaiter(this, void 0, void 0, function* () {
            let id;
            if (this.isOldWeb3) {
                this.web3.version.getNetwork((err, netId) => {
                    if (err) {
                        throw err;
                    }
                    id = netId;
                });
            }
            else {
                id = yield this.web3.eth.net.getId();
            }
            return id;
        });
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            if (this.isOldWeb3) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    return resolve(yield this.web3.eth.accounts);
                }));
            }
            return this.web3.eth.getAccounts();
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            if (this.isOldWeb3) {
                return new Promise((resolve, reject) => {
                    this.web3.eth.getBalance(address, (err, bal) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(web3Utils.fromWei(`${bal}`));
                    });
                });
            }
            const balance = yield this.web3.eth.getBalance(address);
            return web3Utils.fromWei(balance, 'ether');
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
                    etherBalance: Number(etherBalance),
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
        this.sendSignedTransaction = (rawTransaction) => {
            return this.getResponseWhenMined(this.web3.eth.sendSignedTransaction(rawTransaction));
        };
        this.getTxReceipt = (txHash) => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.getTransactionReceipt(txHash);
        });
        this.getResponseWhenMined = (functionCall) => __awaiter(this, void 0, void 0, function* () {
            let txReceipt;
            let txHash;
            const response = yield functionCall
                .on('receipt', (Receipt) => {
                txReceipt = Receipt;
            })
                .on('error', (error) => {
                throw error;
            })
                .on('transactionHash', (TxHash) => {
                txHash = TxHash;
                // console.log({ txHash })
            });
            return {
                txReceipt,
                txHash,
                response,
            };
        });
        this.deploy = ({ code, abi, from, gas = 2000000, gasPrice = 10000000000, args, privateKey }) => __awaiter(this, void 0, void 0, function* () {
            if (this.isOldWeb3) {
                return this.oldWeb3Deploy({
                    abi,
                    code,
                    from,
                    gas,
                    args,
                });
            }
            if (privateKey) {
                const { rawTransaction } = yield this.signTransaction({
                    from,
                    data: code + (yield this.encodeArguments(args, 32)),
                    gas,
                    gasPrice: yield this.web3.eth.gasPrice,
                }, privateKey);
                return this.sendSignedTransaction(rawTransaction);
            }
            const contract = new this.web3.eth.Contract(abi);
            return this.getResponseWhenMined(contract
                .deploy({
                data: code,
                arguments: args,
            })
                .send({
                from,
                gas,
                gasPrice,
            }));
        });
        this.getContract = (abi, address) => {
            return new this.web3.eth.Contract(abi, address);
        };
        this.executeContractFunction = ({ func, to, from, gas = 2000000, gasPrice, value, privateKey }) => __awaiter(this, void 0, void 0, function* () {
            if (privateKey) {
                const data = yield func.encodeABI();
                const { rawTransaction } = yield this.signTransaction({
                    to,
                    data,
                    gas,
                }, privateKey);
                return this.sendSignedTransaction(rawTransaction);
            }
            return this.getResponseWhenMined(func.send({
                from,
                gas,
                value,
            }));
        });
        this.estimateGas = (params) => __awaiter(this, void 0, void 0, function* () {
            return this.web3.eth.estimateGas(params);
        });
        this.encodeArguments = (params, length) => {
            let res = params.map(arg => this.web3.utils.padLeft(this.web3.utils.toHex(arg).substring(2), length));
            return res;
        };
        this.signTransaction = (rawTx, privateKey) => {
            return new Promise((resolve, reject) => {
                this.web3.eth.accounts.signTransaction(rawTx, privateKey, (err, signed) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(signed);
                });
            });
        };
        // oldWeb3GetResponseWhenMined = async (txHash: string) => {
        //   const maxTries = 40
        //   let tries = 0
        //   while (tries < maxTries) {
        //     tries++
        //     try {
        //       if (process.env.NODE_ENV !== 'production') {
        //         console.log('checking...')
        //       }
        //       let receipt = await this.getTxReceipt(txHash)
        //       if (receipt) {
        //         return receipt
        //       }
        //       await sleep(5000)
        //     } catch (e) {
        //       throw e
        //     }
        //   }
        //   throw new Error('Request timed out')
        // }
        this.oldWeb3Deploy = ({ abi, code, from, gas, args }) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (args && args.length > 0) {
                    this.web3.eth.contract(abi).new(args, {
                        from,
                        data: code,
                        gas,
                    }, (err, contract) => {
                        if (err) {
                            reject(err);
                        }
                        else if (contract && contract.address) {
                            resolve({
                                txHash: contract.transactionHash,
                                txReceipt: this.web3.eth.getTransactionReceipt(contract.transactionHash),
                            });
                        }
                    });
                }
                else {
                    this.web3.eth.contract(abi).new({
                        from,
                        data: code,
                        gas,
                    }, (err, contract) => {
                        if (err) {
                            reject(err);
                        }
                        else if (contract && contract.address) {
                            resolve({
                                txHash: contract.transactionHash,
                                txReceipt: this.web3.eth.getTransactionReceipt(contract.transactionHash),
                            });
                        }
                    });
                }
            });
        });
        this.newAccount = () => __awaiter(this, void 0, void 0, function* () {
            const { privateKey, address } = yield this.web3.eth.accounts.create();
            return { privateKey, address };
        });
        this.isOldWeb3 = isOldWeb3;
        this.web3 = web3;
    }
}
exports.default = Common;
