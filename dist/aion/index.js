"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccounts = (web3) => {
    return new Promise((resolve, reject) => {
        web3.eth.getAccounts((err, acc) => {
            if (err) {
                reject(err);
            }
            resolve(acc);
        });
    });
};
exports.getBalance = ({ address }, web3) => {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, (err, balance) => {
            if (err) {
                reject(err);
            }
            resolve(web3.fromWei(balance, 'ether'));
        });
    });
};
exports.compile = ({ contract }, web3) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        web3.eth.compile.solidity(contract, (err, res) => {
            if (err) {
                return reject(err);
            }
            if ('compile-error' in res) {
                return reject(res['compile-error'].error);
            }
            if (res) {
                return resolve(res);
            }
        });
    });
});
exports.unlock = ({ mainAccount, mainAccountPass }, web3) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        web3.personal
            ? web3.personal.unlockAccount(mainAccount, mainAccountPass, 999999, (err, isUnlocked) => {
                if (err) {
                    return reject(err);
                }
                else if (isUnlocked && isUnlocked === true) {
                    return resolve(isUnlocked);
                }
                else {
                    return reject('unlock failed');
                }
            })
            : reject('Invalid Web3');
    });
});
const Web3DeployContract = ({ abi, code, mainAccount, gas, contractArguments }, web3) => __awaiter(this, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        if (contractArguments && contractArguments.length > 0) {
            web3.eth.contract(abi).new(...contractArguments.split(','), {
                from: mainAccount,
                data: code,
                gas
            }, (err, contract) => {
                if (err) {
                    reject(err);
                }
                else if (contract && contract.address) {
                    resolve(Object.assign({}, contract, { receipt: web3.eth.getTransactionReceipt(contract.transactionHash) }));
                }
            });
        }
        else {
            web3.eth.contract(abi).new({
                from: mainAccount,
                data: code,
                gas
            }, (err, contract) => {
                if (err) {
                    reject(err);
                }
                else if (contract && contract.address) {
                    resolve(Object.assign({}, contract, { receipt: web3.eth.getTransactionReceipt(contract.transactionHash) }));
                }
            });
        }
    });
});
exports.deploy = ({ abi, code, mainAccount, gas, contractArguments }, web3) => __awaiter(this, void 0, void 0, function* () {
    try {
        const deployedContract = yield Web3DeployContract({
            abi,
            code,
            mainAccount,
            gas,
            contractArguments
        }, web3);
        return deployedContract;
    }
    catch (e) {
        throw e;
    }
});
