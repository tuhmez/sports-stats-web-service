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
exports.getTeamIdByTeamAbbreviation = exports.getTeamIdByFullTeamName = exports.getTeamIdByTeamName = exports.getTeamIdByTeamLocation = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../../utils");
const urls_1 = require("../urls");
const mlbTransport = axios_1.default.create();
function getTeamIdByTeamLocation(location, route) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
            const foundTeam = data.teams.find((t) => t.locationName.toLowerCase() === location.toLowerCase());
            if (foundTeam) {
                return foundTeam.id.toString();
            }
            else {
                const message = `Could not find team with location: ${location}`;
                (0, utils_1.LogError)(400, route, message);
                return null;
            }
        }
        catch (exception) {
            const { data, response } = exception;
            (0, utils_1.LogError)(response.status, route, data.message);
            return null;
        }
    });
}
exports.getTeamIdByTeamLocation = getTeamIdByTeamLocation;
function getTeamIdByTeamName(name, route) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
            const foundTeam = data.teams.find((t) => t.teamName.toLowerCase() === name.toLowerCase());
            if (foundTeam) {
                return foundTeam.id.toString();
            }
            else {
                const message = `Could not find team with name: ${name}`;
                (0, utils_1.LogError)(400, route, message);
                return null;
            }
        }
        catch (exception) {
            const { data, response } = exception;
            (0, utils_1.LogError)(response.status, route, data.message);
            return null;
        }
    });
}
exports.getTeamIdByTeamName = getTeamIdByTeamName;
function getTeamIdByFullTeamName(fullName, route) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
            const foundTeam = data.teams.find((t) => t.name.toLowerCase() === fullName.toLowerCase());
            if (foundTeam) {
                return foundTeam.id.toString();
            }
            else {
                const message = `Could not find team with name: ${fullName}`;
                (0, utils_1.LogError)(400, route, message);
                return null;
            }
        }
        catch (exception) {
            const { data, response } = exception;
            (0, utils_1.LogError)(response.status, route, data.message);
            return null;
        }
    });
}
exports.getTeamIdByFullTeamName = getTeamIdByFullTeamName;
function getTeamIdByTeamAbbreviation(abbreviation, route) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
            const foundTeam = data.teams.filter((t) => t.abbreviation).find((t) => t.abbreviation.toLowerCase() === abbreviation.toLowerCase());
            if (foundTeam) {
                return foundTeam.id.toString();
            }
            else {
                const message = `Could not find team with abbreviation: ${abbreviation}`;
                (0, utils_1.LogError)(400, route, message);
                return null;
            }
        }
        catch (exception) {
            const { data, response } = exception;
            (0, utils_1.LogError)(response.status, route, data.message);
            return null;
        }
    });
}
exports.getTeamIdByTeamAbbreviation = getTeamIdByTeamAbbreviation;
//# sourceMappingURL=mlb.js.map