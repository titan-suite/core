"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var aion_1 = require("./src/blockchains/aion");
exports.Aion = aion_1.default;
var ethereum_1 = require("./src/blockchains/ethereum");
exports.Ethereum = ethereum_1.default;
__export(require("./utils"));
