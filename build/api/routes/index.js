"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mlb_1 = require("./mlb");
const ping_1 = require("./ping");
const router = express_1.default.Router();
const version = process.env.npm_package_version || process.env.VERSION;
router.get('/', (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const baseURL = `${_req.protocol}://${_req.get('host')}${_req.originalUrl}`;
    const html = `
    <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 4px;">
      <h1>Sports Stats Web Service - v${version}</h1>
      <p>Listed are the base routes for the web service. When clicking the link, you will be redirected to the base of the selected route, where more routes will be listed or data will be returned.</p>
      <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
        <a href="${baseURL}docs">Swagger UI</a>
        <a href="${baseURL}mlb">MLB</a>
        <a href="${baseURL}ping">Ping</a>
      </div>
    </div>
  `;
    return res.send(html);
}));
new mlb_1.MLBRoutes(router);
new ping_1.PingRoutes(router);
exports.default = router;
//# sourceMappingURL=index.js.map