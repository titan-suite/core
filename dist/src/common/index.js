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
const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
class Common {
    constructor(isInjected, web3) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () {
            if (this.isInjected) {
                return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                    return resolve(yield this.web3.eth.accounts);
                }));
            }
            return this.web3.eth.getAccounts();
        });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () {
            if (this.isInjected) {
                return new Promise((resolve, reject) => {
                    this.web3.eth.getBalance(address, (err, bal) => {
                        if (err) {
                            return reject(err);
                        }
                        return resolve(web3Utils.fromWei(`${bal}`, 'ether'));
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
                console.log({ txHash });
            });
            return {
                txReceipt,
                txHash,
                response
            };
        });
        this.deploy = ({ code, abi, from, gas = 5000000, gasPrice = 10000000000, args }) => __awaiter(this, void 0, void 0, function* () {
            if (this.isInjected) {
                return this.InjectedDeploy({
                    abi,
                    code,
                    from,
                    gas,
                    args
                });
            }
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
        // InjectedGetResponseWhenMined = async (txHash: string) => {
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
        this.InjectedWeb3DeployContract = ({ abi, code, from, gas, args }) => __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                if (args && args.length > 0) {
                    this.web3.eth.contract(abi).new(args, {
                        from,
                        data: code,
                        gas
                    }, (err, contract) => {
                        if (err) {
                            reject(err);
                        }
                        else if (contract && contract.address) {
                            resolve({
                                txHash: contract.transactionHash,
                                txReceipt: this.web3.eth.getTransactionReceipt(contract.transactionHash)
                            });
                        }
                    });
                }
                else {
                    this.web3.eth.contract(abi).new({
                        from,
                        data: code,
                        gas
                    }, (err, contract) => {
                        if (err) {
                            reject(err);
                        }
                        else if (contract && contract.address) {
                            resolve({
                                txHash: contract.transactionHash,
                                txReceipt: this.web3.eth.getTransactionReceipt(contract.transactionHash)
                            });
                        }
                    });
                }
            });
        });
        this.InjectedDeploy = ({ abi, code, from, gas, args }) => __awaiter(this, void 0, void 0, function* () {
            try {
                const deployedContract = yield this.InjectedWeb3DeployContract({
                    abi,
                    code,
                    from,
                    gas,
                    args
                });
                return deployedContract;
            }
            catch (e) {
                throw e;
            }
        });
        this.isInjected = isInjected;
        this.web3 = web3;
    }
}
exports.default = Common;
