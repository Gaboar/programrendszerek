"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupMember = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GroupMemberSchema = new mongoose_1.default.Schema({
    user: { type: String, required: true },
    group: { type: String, required: true }
});
exports.GroupMember = mongoose_1.default.model('GroupMember', GroupMemberSchema);
