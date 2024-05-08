"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDate = void 0;
const moment_1 = __importDefault(require("moment"));
const validateDate = (date) => !date.includes('-') && (0, moment_1.default)(date, 'MM/DD/YYYY').isValid();
exports.validateDate = validateDate;
//# sourceMappingURL=date.js.map