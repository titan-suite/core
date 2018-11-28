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
const common_1 = __importDefault(require("../../common"));
const Web3 = require('web3');
class Ethereum extends common_1.default {
    constructor(nodeAddress, isOldWeb3 = false, web3) {
        super(isOldWeb3, isOldWeb3 ? web3 : new Web3(new Web3.providers.HttpProvider(nodeAddress)));
        this.isMainnet = () => __awaiter(this, void 0, void 0, function* () {
            return (yield this.getNetworkId()) === 1;
        });
    }
}
exports.default = Ethereum;
