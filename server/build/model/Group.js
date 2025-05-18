"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const GroupSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true }
});
exports.Group = mongoose_1.default.model('Group', GroupSchema);
