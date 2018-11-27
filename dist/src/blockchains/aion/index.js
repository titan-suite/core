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
Object.defineProperty(exports, "__esModule", { value: true });
// import solc from 'solc'
const Web3 = require('aion-web3');
const common_1 = __importDefault(require("../../common"));
class Aion extends common_1.default {
    constructor(nodeAddress, isOldWeb3 = false, web3) {
        super(isOldWeb3, isOldWeb3 ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress)));
        this.compile = (contract) => __awaiter(this, void 0, void 0, function* () {
            if (this.isOldWeb3) {
                return new Promise((resolve, reject) => {
                    this.web3.eth.compile.solidity(contract, (err, res) => {
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
            }
            return this.web3.eth.compileSolidity(contract);
        });
        this.unlock = (address, password, duration = 100000) => __awaiter(this, void 0, void 0, function* () {
            if (this.isOldWeb3) {
                return new Promise((resolve, reject) => {
                    this.web3.personal
                        ? this.web3.personal.unlockAccount(address, password, duration, (err, isUnlocked) => {
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
            }
            return this.web3.eth.personal.unlockAccount(address, password, duration);
        });
    }
}
exports.default = Aion;
