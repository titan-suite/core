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
const common_1 = __importDefault(require("../../common"));
const Web3 = require('web3');
class Ethereum extends common_1.default {
    constructor(nodeAddress, isInjected = false, web3) {
        super(isInjected, isInjected ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress)));
        // public static compile = async (input: string): Promise<any> => {
        //   // TODO https://github.com/ethereum/solc-js/pull/205
        //   // const output = solc.compile(input, 1)
        //   // return output
        // }
        this.compile = (contract) => __awaiter(this, void 0, void 0, function* () {
            if (this.isInjected) {
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
    }
}
exports.default = Ethereum;
