"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Friend = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const FriendSchema = new mongoose_1.default.Schema({
    user1: { type: String, required: true },
    user2: { type: String, required: true },
    accepted: { type: Boolean, required: true }
});
exports.Friend = mongoose_1.default.model('Friend', FriendSchema);
