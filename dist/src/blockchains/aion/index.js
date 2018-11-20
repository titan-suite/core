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
const utils_1 = require("../../../utils");
const common_1 = __importDefault(require("../../common"));
class Aion extends common_1.default {
    constructor(nodeAddress) {
        super(nodeAddress);
        this.compile = (contract) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'eth_compileSolidity', [contract]);
        });
        this.unlock = (address, password) => __awaiter(this, void 0, void 0, function* () {
            return utils_1.rpcPost(this.nodeAddress, 'personal_unlockAccount', [
                address,
                password
            ]);
        });
    }
}
exports.default = Aion;
