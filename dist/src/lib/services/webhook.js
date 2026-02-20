"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookService = void 0;
const axios_1 = __importDefault(require("axios"));
exports.webhookService = {
    async sendStatusUpdate(url, payload) {
        try {
            await axios_1.default.post(url, payload);
        }
        catch (error) {
            console.error('Failed to send webhook:', error);
            // We don't throw here to avoid failing the job just because the webhook failed
        }
    }
};
