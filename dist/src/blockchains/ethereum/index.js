"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = __importDefault(require("../../common"));
const Web3 = require('web3');
class Ethereum extends common_1.default {
    constructor(nodeAddress, isOldWeb3 = false, web3) {
        super(isOldWeb3, isOldWeb3 ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress)));
    }
}
exports.default = Ethereum;
