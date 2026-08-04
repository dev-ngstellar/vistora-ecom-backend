"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const SALT_ROUNDS = 12;
class PasswordUtil {
    static async hash(password) {
        return bcrypt_1.default.hash(password, SALT_ROUNDS);
    }
    static async compare(password, hashed) {
        return bcrypt_1.default.compare(password, hashed);
    }
}
exports.PasswordUtil = PasswordUtil;
