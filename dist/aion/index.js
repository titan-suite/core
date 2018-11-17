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
const aion_web3_core_1 = __importDefault(require("aion-web3-core"));
class Aion {
    constructor(providerUrl) {
        this.getAccounts = () => __awaiter(this, void 0, void 0, function* () { return this.web3.eth.getAccounts(); });
        this.getBalance = (address) => __awaiter(this, void 0, void 0, function* () { return this.web3.utils.fromNAmp(yield this.web3.eth.getBalance(address), 'nAmp'); });
        this.unlock = (address, password) => this.web3.eth.personal.unlockAccount(address, password);
        this.deploy = ({ deployedAddress, abi, code, mainAccount, gas, gasPrice, contractArguments }) => __awaiter(this, void 0, void 0, function* () {
            let receipt;
            let txHash;
            let confirmation;
            const contract = new this.web3.eth.Contract(abi, deployedAddress, {
                from: mainAccount,
                data: code,
                gas
            });
            const newContractInstance = yield contract
                .deploy({
                data: code,
                arguments: [...contractArguments.split(',')]
            })
                .send({
                from: mainAccount,
                gas,
                gasPrice
            })
                .on('receipt', _receipt => {
                receipt = _receipt;
            })
                .on('error', error => {
                throw error;
            })
                .on('transactionHash', _txHash => {
                txHash = _txHash;
            })
                .on('confirmation', (confNumber, confReceipt) => {
                confirmation = { confNumber, confReceipt };
            });
            return {
                receipt,
                txHash,
                confirmation,
                newContractInstance
            };
        });
        this.estimateGas = ({ deployedAddress, abi, code, mainAccount, gas, contractArguments }) => __awaiter(this, void 0, void 0, function* () {
            const contract = new this.web3.eth.Contract(abi, deployedAddress, {
                from: mainAccount,
                data: code,
                gas
            });
            const estimatedGas = yield contract
                .deploy({
                data: code,
                arguments: [...contractArguments.split(',')]
            })
                .estimateGas();
            return estimatedGas;
        });
        this.web3 = new aion_web3_core_1.default(new aion_web3_core_1.default.providers.HttpProvider(providerUrl));
    }
}
exports.default = Aion;
