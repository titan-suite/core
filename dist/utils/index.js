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
const axios_1 = __importDefault(require("axios"));
exports.sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.rpcPost = (nodeAddress, method, params = [], id = 1) => __awaiter(this, void 0, void 0, function* () {
    return axios_1.default
        .post(nodeAddress, {
        jsonrpc: '2.0',
        method,
        params,
        id
    })
        .then(({ data: { result, error } }) => {
        if (error) {
            throw error;
        }
        return result;
    })
        .catch(error => {
        throw error;
    });
});
