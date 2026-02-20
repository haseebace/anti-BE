"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const webtorrent_1 = __importDefault(require("webtorrent"));
console.log('Successfully imported WebTorrent');
const client = new webtorrent_1.default();
console.log('Successfully created client');
client.destroy();
console.log('Successfully destroyed client');
