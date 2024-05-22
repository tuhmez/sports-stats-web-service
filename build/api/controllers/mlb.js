"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
exports.MlbController = void 0;
const tsoa_1 = require("tsoa");
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = require("cheerio");
const sharp_1 = __importDefault(require("sharp"));
const color_1 = __importDefault(require("color"));
const utils_1 = require("../../utils");
const urls_1 = require("../urls");
const utils_2 = require("../utils");
const date_1 = require("../../utils/date");
const data_1 = require("../../data");
const invalidDateError = {
    message: 'Input date is invalid. Valid format is MM/DD/YYYY (e.g. 10/01/2018)',
    statusCode: 400,
};
const mlbTransport = axios_1.default.create();
let MlbController = class MlbController {
    /**
     * Gets a list of all the games for a given day. If any inputs are missing, the date will automatically default to the current date of request.
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {IGamesResponse}
     */
    getGames(date) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!date) {
                const today = new Date();
                const month = (today.getMonth() + 1).toString();
                const day = today.getDate().toString();
                const year = today.getFullYear().toString();
                date = `${month}/${day}/${year}`;
            }
            else {
                if (!(0, date_1.validateDate)(date))
                    return invalidDateError;
            }
            try {
                const data = yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date));
                return data.data;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/games`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status
                };
                return error;
            }
        });
    }
    /**
     * Gets the game feed for the given game ID or team location and team name, with optional date.
     * @param {string} id - The game ID
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {(IGameFeedResponse|IGameFeedByTeamNameResponse[]|IError)} Returns the feed(s) for found game(s).
     */
    getFeed(id, location, name, abbreviation, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id) {
                    const data = yield mlbTransport.get((0, urls_1.gameFeedUrl)(id));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!date) {
                        const today = new Date();
                        const month = (today.getMonth() + 1).toString();
                        const day = today.getDate().toString();
                        const year = today.getFullYear().toString();
                        date = `${month}/${day}/${year}`;
                    }
                    else {
                        if (!(0, date_1.validateDate)(date))
                            return invalidDateError;
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date))).data;
                    if (data.totalGames === 0)
                        return [];
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                        else {
                            const error = {
                                message: 'Could not find team!',
                                statusCode: 400,
                            };
                            return error;
                        }
                    });
                    const gameFeedsPromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.gameFeedUrl)(g.gamePk.toString()))));
                    return gameFeedsPromises.map((gfp) => {
                        const { gamePk, metaData, gameData, liveData } = gfp.data;
                        const feedData = {
                            gamePk,
                            metaData,
                            gameData,
                            liveData,
                        };
                        return feedData;
                    });
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/feed`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the boxscore for the given game ID or team location and team name, with optional date.
     * @param {string} id - The game ID
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {(IGameBoxscoreResponse|IGameBoxscoreResponse[]|IError)} - The boxscore(s) for the given game(s).
     */
    getBoxscore(id, location, name, abbreviation, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id) {
                    const data = yield mlbTransport.get((0, urls_1.gameBoxscoreUrl)(id));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!date) {
                        const today = new Date();
                        const month = (today.getMonth() + 1).toString();
                        const day = today.getDate().toString();
                        const year = today.getFullYear().toString();
                        date = `${month}/${day}/${year}`;
                    }
                    else {
                        if (!(0, date_1.validateDate)(date))
                            return invalidDateError;
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date))).data;
                    if (data.totalGames === 0)
                        return [];
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                        else {
                            const error = {
                                message: 'Could not find team!',
                                statusCode: 400,
                            };
                            return error;
                        }
                    });
                    const gameBoxscorePromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.gameBoxscoreUrl)(g.gamePk.toString()))));
                    return gameBoxscorePromises.map((gsp) => gsp.data);
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/boxscore`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the game probables for the given game ID or team location and team name, with optional date
     * @param {string} id - The game ID
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {(IProbablesResponse|IProbablesResponse[]|IError)} - The probables(s) for the given game(s).
     */
    getGameProbables(id, location, name, abbreviation, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id) {
                    const data = yield mlbTransport.get((0, urls_1.matchupUrl)(id));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!date) {
                        const today = new Date();
                        const month = (today.getMonth() + 1).toString();
                        const day = today.getDate().toString();
                        const year = today.getFullYear().toString();
                        date = `${month}/${day}/${year}`;
                    }
                    else {
                        if (!(0, date_1.validateDate)(date))
                            return invalidDateError;
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date))).data;
                    if (data.totalGames === 0)
                        return [];
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                        else {
                            const error = {
                                message: 'Could not find team!',
                                statusCode: 400,
                            };
                            return error;
                        }
                    });
                    const gameBoxscorePromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.matchupUrl)(g.gamePk.toString()))));
                    return gameBoxscorePromises.map((gsp) => gsp.data);
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/${id}/probables`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the score for a game, without much of the extra stuff as the feed request
     * @param {string} id - The game ID
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {(IProbablesResponse[]|IError)} - The score(s) for the given game(s).
     */
    getGameScore(id, location, name, abbreviation, date) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (id) {
                    const data = yield mlbTransport.get((0, urls_1.gameFeedUrl)(id));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!date) {
                        const today = new Date();
                        const month = (today.getMonth() + 1).toString();
                        const day = today.getDate().toString();
                        const year = today.getFullYear().toString();
                        date = `${month}/${day}/${year}`;
                    }
                    else {
                        if (!(0, date_1.validateDate)(date))
                            return invalidDateError;
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date))).data;
                    if (data.totalGames === 0)
                        return [];
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                        else {
                            const error = {
                                message: 'Could not find team!',
                                statusCode: 400,
                            };
                            return error;
                        }
                    });
                    const gameFeedsPromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.gameFeedUrl)(g.gamePk.toString()))));
                    return gameFeedsPromises.map((gfp) => {
                        const { gameData, liveData } = gfp.data;
                        const { linescore } = liveData;
                        const { datetime, game, status } = gameData;
                        const { away, home } = gameData.teams;
                        const scoreData = {
                            linescore,
                            away,
                            home,
                            game,
                            datetime,
                            status,
                        };
                        return scoreData;
                    });
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/score`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the game for a given team. Will use current day, unless day, month, and year are passed into function
     * @param {string} location - The team's location (lower case), e.g. milwaukee
     * @param {string} name - The team's name (lower case), e.g. brewers
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} date - The date in MM/DD/YYYY format
     * @returns {IGameByTeamNameResponse}
     */
    getGameForTeam(location, name, abbreviation, date) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!date) {
                const today = new Date();
                const month = (today.getMonth() + 1).toString();
                const day = today.getDate().toString();
                const year = today.getFullYear().toString();
                date = `${month}/${day}/${year}`;
            }
            else {
                if (!(0, date_1.validateDate)(date))
                    return invalidDateError;
            }
            try {
                const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(date))).data;
                if (data.totalGames === 0) {
                    const response = {
                        totalGames: 0,
                        totalGamesInProgress: 0,
                        games: []
                    };
                    return response;
                }
                const games = data.dates[0].games.filter((g) => {
                    const { away, home } = g.teams;
                    const { team: awayTeam } = away;
                    const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
                    const { team: homeTeam } = home;
                    const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
                    if (location && name) {
                        const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                        return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                    }
                    else if (abbreviation) {
                        return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
                    }
                    else {
                        const error = {
                            message: 'Could not find team!',
                            statusCode: 400,
                        };
                        return error;
                    }
                });
                const response = {
                    totalGames: games.length,
                    totalGamesInProgress: games.filter((g) => g.status.statusCode === "I").length,
                    games
                };
                return response;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status
                };
                return error;
            }
        });
    }
    /**
     * Gets all teams associated with the MLB (may include Spring Leagues, Minor Leagues, etc.)
     * @returns {(ITeamResponse|IError)}
     */
    getTeamNoId() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield mlbTransport.get((0, urls_1.teamUrl)(''));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/teams`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets a team by its team id or team name and team location.
     * @param {string} id - The MLB team id
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @returns {(ITeamResponse | ITeamByTeamNameResponse | IError)}
     */
    getTeam(id, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = '/mlb/game/team';
            try {
                if (!id) {
                    let asyncFunctionCall;
                    let input;
                    let inputType;
                    if (location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByFullTeamName;
                        input = `${location} ${name}`;
                        inputType = 'full team name';
                    }
                    else if (location && !name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamLocation;
                        input = location;
                        inputType = 'team location';
                    }
                    else if (!location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamName;
                        input = name;
                        inputType = 'team name';
                    }
                    else if (abbreviation) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamAbbreviation;
                        input = abbreviation;
                        inputType = 'team abbreviation';
                    }
                    else {
                        const message = 'Inputs not valid for request';
                        (0, utils_1.LogError)(400, route, message);
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    const teamIdResponse = yield asyncFunctionCall(input, route);
                    if (!teamIdResponse) {
                        const message = `Could not find ${input} via ${inputType} method`;
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    id = teamIdResponse;
                }
                const data = yield mlbTransport.get((0, urls_1.teamUrl)(id));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, '/mlb/game/team/', data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets an SVG of the team logo by team id or team location and team name.
     * @param {string} id - The MLB team id
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @param {string} format - Optional format input, accepts SVG and PNG; if not provided, SVG will be provided
     * @returns {(HTMLOrSVGElement | Buffer | IError)}
     */
    getTeamLogo(id, location, name, abbreviation, format, output, url, urlHasId) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = '/mlb/game/team/logo';
            try {
                if (!id) {
                    let asyncFunctionCall;
                    let input;
                    let inputType;
                    if (location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByFullTeamName;
                        input = `${location} ${name}`;
                        inputType = 'full team name';
                    }
                    else if (location && !name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamLocation;
                        input = location;
                        inputType = 'team location';
                    }
                    else if (!location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamName;
                        input = name;
                        inputType = 'team name';
                    }
                    else if (abbreviation) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamAbbreviation;
                        input = abbreviation;
                        inputType = 'team abbreviation';
                    }
                    else {
                        const message = 'Inputs not valid for request';
                        (0, utils_1.LogError)(400, route, message);
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    const teamIdResponse = yield asyncFunctionCall(input, route);
                    if (!teamIdResponse) {
                        const message = `Could not find ${input} via ${inputType} method`;
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    id = teamIdResponse;
                }
                let urlToUse = (0, urls_1.teamLogosUrl)(id);
                if (url) {
                    if (urlHasId) {
                        urlToUse = url;
                    }
                    else {
                        urlToUse = `${url}/${id}.svg`;
                    }
                }
                const response = yield mlbTransport.get(urlToUse);
                let image = response.data;
                if (format) {
                    if (format.toLowerCase() === "png") {
                        try {
                            image = yield (0, sharp_1.default)(Buffer.from(image)).png().toBuffer();
                        }
                        catch (ex) {
                            const message = "Image conversion from SVG to PNG failed";
                            const error = {
                                message,
                                statusCode: 500
                            };
                            return error;
                        }
                    }
                    else {
                        if (output) {
                            if (output === 'Buffer') {
                                return Buffer.from(image);
                            }
                            else {
                                return image;
                            }
                        }
                    }
                }
                return image;
            }
            catch (exception) {
                const message = 'Failed to retrieve logo';
                (0, utils_1.LogError)(400, `/mlb/team/logo`, message);
                const error = {
                    message,
                    statusCode: 400,
                };
                return error;
            }
        });
    }
    /**
     * Gets the team leaders in various offensive and defensive stats via team id or team location and team name
     * @param {string} id - The MLB team id
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @returns {(ITeamLeadersResponse | IError)}
     */
    getTeamLeaders(id, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = "/mlb/team/leaders";
            try {
                if (!id) {
                    let asyncFunctionCall;
                    let input;
                    let inputType;
                    if (location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByFullTeamName;
                        input = `${location} ${name}`;
                        inputType = 'full team name';
                    }
                    else if (location && !name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamLocation;
                        input = location;
                        inputType = 'team location';
                    }
                    else if (!location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamName;
                        input = name;
                        inputType = 'team name';
                    }
                    else if (abbreviation) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamAbbreviation;
                        input = abbreviation;
                        inputType = 'team abbreviation';
                    }
                    else {
                        const message = 'Inputs not valid for request';
                        (0, utils_1.LogError)(400, route, message);
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    const teamIdResponse = yield asyncFunctionCall(input, route);
                    if (!teamIdResponse) {
                        const message = `Could not find ${input} via ${inputType} method`;
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    id = teamIdResponse;
                }
                const data = yield mlbTransport.get((0, urls_1.teamLeadersUrl)(id));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/team/leaders`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the team's roster via team id or team location and team name
     * @param {string} id - The MLB team id
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @returns {(IRosterResponse | IError)}
     */
    getRoster(id, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = '/mlb/team/roster';
            try {
                if (!id) {
                    let asyncFunctionCall;
                    let input;
                    let inputType;
                    if (location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByFullTeamName;
                        input = `${location} ${name}`;
                        inputType = 'full team name';
                    }
                    else if (location && !name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamLocation;
                        input = location;
                        inputType = 'team location';
                    }
                    else if (!location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamName;
                        input = name;
                        inputType = 'team name';
                    }
                    else if (abbreviation) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamAbbreviation;
                        input = abbreviation;
                        inputType = 'team abbreviation';
                    }
                    else {
                        const message = 'Inputs not valid for request';
                        (0, utils_1.LogError)(400, route, message);
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    const teamIdResponse = yield asyncFunctionCall(input, route);
                    if (!teamIdResponse) {
                        const message = `Could not find ${input} via ${inputType} method`;
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    id = teamIdResponse;
                }
                const data = yield mlbTransport.get((0, urls_1.rosterUrl)(id));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/team/${id}/roster`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the team's color palette via team id or team location and team name
     * @param {string} id - The MLB team id
     * @param {string} location - The team's location
     * @param {string} name - The team's name
     * @param {string} abbreviation - The team's abbreviation
     * @returns {(string[] | IError)}
     */
    getTeamColors(id, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            const route = '/mlb/team/colors';
            if (!location && !name) {
                if (!id) {
                    let asyncFunctionCall;
                    let input;
                    let inputType;
                    if (location && !name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamLocation;
                        input = location;
                        inputType = 'team location';
                    }
                    else if (!location && name) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamName;
                        input = name;
                        inputType = 'team name';
                    }
                    else if (abbreviation) {
                        asyncFunctionCall = utils_2.getTeamIdByTeamAbbreviation;
                        input = abbreviation;
                        inputType = 'team abbreviation';
                    }
                    else {
                        const message = 'Inputs not valid for request';
                        (0, utils_1.LogError)(400, route, message);
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    const teamIdResponse = yield asyncFunctionCall(input, route);
                    if (!teamIdResponse) {
                        const message = `Could not find ${input} via ${inputType} method`;
                        const error = {
                            message,
                            statusCode: 400
                        };
                        return error;
                    }
                    id = teamIdResponse;
                }
                const data = yield (yield mlbTransport.get((0, urls_1.teamUrl)(id))).data;
                const team = data.teams[0];
                location = team.franchiseName;
                name = team.clubName;
            }
            const data = yield mlbTransport.get((0, urls_1.teamColorCodesPageUrl)());
            const teamToLookFor = `${location.toLowerCase().trim()} ${name.toLowerCase().trim()}`;
            // cheerio loading the html string
            const $ = (0, cheerio_1.load)(data.data);
            // cheerio searching for all table tags
            const tables = $('table');
            // loop until we find the hex table
            let hexTableIndex = 0;
            tables.each((i, e) => {
                const captionText = $(e).find('caption').text();
                if (captionText.includes('HEX')) {
                    hexTableIndex = i;
                    return false;
                }
            });
            // loop until we find the team we want
            let teamColorRow = undefined;
            $(tables[hexTableIndex]).find('tr').each((i, e) => {
                const teamRow = $(e).find('th').text().toLowerCase().trim();
                if (teamRow === teamToLookFor) {
                    teamColorRow = e;
                    return false;
                }
            });
            if (teamColorRow === undefined) {
                const error = {
                    message: `Could not find team: ${teamToLookFor}`,
                    statusCode: 400,
                };
                return error;
            }
            ;
            // extract the table data with the hex codes and split the common names
            // add the hex code to our array
            const teamColors = [];
            $(teamColorRow).find('td').each((i, e) => {
                const tdStrings = $(e).text().split('#');
                teamColors.push(`#${tdStrings[tdStrings.length - 1]}`.trim());
            });
            return teamColors.filter((tc) => tc !== '#');
        });
    }
    /**
     * Gets the player's basic information
     * @param {string} id - The MLB player id
     * @param {string} firstName - The player's first name
     * @param {string} lastName - The player's last name
     * @param {string} location - The location of the team
     * @param {string} name - The name of the team
     * @param {string} abbreviation - The abbreviation for the team
     * @returns {(IPlayerResponse | IError)}
     */
    getPlayer(id, firstName, lastName, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
                    const teams = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
                    const foundTeam = teams.teams.find((t) => {
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return t.name.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return t.abbreviation.toLowerCase() === abbreviation;
                        }
                        else {
                            return false;
                        }
                    });
                    if (!foundTeam) {
                        return {
                            message: `Could not find team`,
                            statusCode: 400,
                        };
                    }
                    const rosterData = yield (yield mlbTransport.get((0, urls_1.rosterUrl)(foundTeam.id.toString()))).data;
                    const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);
                    if (!foundPlayer) {
                        return {
                            message: `Could not find player: ${inputPlayer}`,
                            statusCode: 400,
                        };
                    }
                    else {
                        id = foundPlayer.person.id.toString();
                    }
                }
                const data = yield mlbTransport.get((0, urls_1.playerUrl)(id));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/player/${id}`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
   * Gets the player stats
   * @param {string} id - The MLB player id
   * @param {string} firstName - The player's first name
   * @param {string} lastName - The player's last name
   * @param {string} location - The location of the team
   * @param {string} name - The name of the team
   * @param {string} abbreviation - The abbreviation for the team
   * @returns {(IPlayerResponse | IError)}
   */
    getPlayerStats(id, firstName, lastName, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
                    const teams = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
                    const foundTeam = teams.teams.find((t) => {
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return t.name.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return t.abbreviation.toLowerCase() === abbreviation;
                        }
                        else {
                            return false;
                        }
                    });
                    if (!foundTeam) {
                        return {
                            message: `Could not find team`,
                            statusCode: 400,
                        };
                    }
                    const rosterData = yield (yield mlbTransport.get((0, urls_1.rosterUrl)(foundTeam.id.toString()))).data;
                    const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);
                    if (!foundPlayer) {
                        return {
                            message: `Could not find player: ${inputPlayer}`,
                            statusCode: 400,
                        };
                    }
                    else {
                        id = foundPlayer.person.id.toString();
                    }
                }
                const data = yield mlbTransport.get((0, urls_1.playerStatsUrl)(id));
                const extractedData = data.data;
                return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/player/${id}`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the player's current headshot via player id
     * @param {string} id - The MLB player id
     * @param {string} magnification - The specified magnification for the headshot
     * @param {string} firstName - The player's first name
     * @param {string} lastName - The player's last name
     * @param {string} location - The location of the team
     * @param {string} name - The name of the team
     * @param {string} abbreviation - The abbreviation for the team
     * @returns {(string | IError)}
     */
    getPlayerHeadshot(id, magnification, firstName, lastName, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!id) {
                    const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
                    const teams = yield (yield mlbTransport.get((0, urls_1.teamUrl)(''))).data;
                    const foundTeam = teams.teams.find((t) => {
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return t.name.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return t.abbreviation.toLowerCase() === abbreviation;
                        }
                        else {
                            return false;
                        }
                    });
                    if (!foundTeam) {
                        return {
                            message: `Could not find team`,
                            statusCode: 400,
                        };
                    }
                    const rosterData = yield (yield mlbTransport.get((0, urls_1.rosterUrl)(foundTeam.id.toString()))).data;
                    const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);
                    if (!foundPlayer) {
                        return {
                            message: `Could not find player: ${inputPlayer}`,
                            statusCode: 400,
                        };
                    }
                    else {
                        id = foundPlayer.person.id.toString();
                    }
                }
                return (0, urls_1.playerCurrentHeadshotUrl)(id, magnification);
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `mlb/player/${id}/headshot`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status,
                };
                return error;
            }
        });
    }
    /**
     * Gets the current record for an MLB team
     * @param {string} year - The year requested for record
     * @param {string} date - The date in MM/DD/YYYY format
     * @param {string} location - The MLB team location
     * @param {string} name - The MLB team name
     * @param {string} abbreviation - The MLB team's abbreviation
     * @returns {(IRecordsResponse | IError)}
     */
    getRecord(year, date, location, name, abbreviation) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!year && !date) {
                    const today = new Date();
                    const month = (today.getMonth() + 1).toString();
                    const day = today.getDate().toString();
                    year = today.getFullYear().toString();
                    date = `${month}/${day}/${year}`;
                }
                else if (!year && date) {
                    if (!(0, date_1.validateDate)(date))
                        return invalidDateError;
                    year = date.split('/')[2];
                }
                else if (year && date) {
                    if (!(0, date_1.validateDate)(date))
                        return invalidDateError;
                    if (year !== date.split('/')[2]) {
                        return {
                            message: 'The input year and input date\'s year must match',
                            statusCode: 400,
                        };
                    }
                }
                const record = yield (yield mlbTransport.get((0, urls_1.recordUrl)(year, date))).data;
                if (!location && !name && !abbreviation)
                    return record;
                const teamRecords = record.records.find((r) => {
                    return r.teamRecords.find((tr) => {
                        const { team } = tr;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return team.name.toLowerCase() === inputTeam;
                        }
                        else if (abbreviation) {
                            return team.abbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                        else {
                            return false;
                        }
                    });
                });
                if (teamRecords) {
                    const actualTeamRecord = teamRecords.teamRecords.find((tr) => {
                        const { team } = tr;
                        if (location && name) {
                            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
                            return team.name.toLowerCase() === inputTeam;
                        }
                        else {
                            return team.abbreviation.toLowerCase() === abbreviation.toLowerCase();
                        }
                    });
                    return actualTeamRecord;
                }
                else {
                    const inputTeam = location && name ? `${location.toLowerCase()} ${name.toLowerCase()}` : abbreviation.toLowerCase();
                    const error = {
                        message: `Could not find team: ${inputTeam}`,
                        statusCode: 400
                    };
                    return error;
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/record`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status
                };
                return error;
            }
        });
    }
    getMatchupGraphic(location, name, abbreviation, date, display) {
        return __awaiter(this, void 0, void 0, function* () {
            const gameResponse = yield this.getGameForTeam(location, name, abbreviation, date);
            // @ts-ignore
            if (gameResponse.message) {
                return gameResponse;
            }
            if (gameResponse.games.length === 0) {
                return {
                    message: `No games found`,
                    statusCode: 200
                };
            }
            const { teams } = gameResponse.games[0];
            let homeTeam = '';
            let homeTeamProperty = '';
            if (location) {
                homeTeam = teams.home.team.locationName.toLowerCase();
                homeTeamProperty = 'location';
            }
            else if (name) {
                homeTeam = teams.home.team.name.toLowerCase();
                homeTeamProperty = 'name';
            }
            else {
                homeTeam = teams.home.team.abbreviation.toLowerCase();
                homeTeamProperty = 'abbreviation';
            }
            const isHomeTeamDesiredTeam = homeTeamProperty === 'location' ? homeTeam === location.toLowerCase() :
                homeTeamProperty === 'name' ? homeTeam === name.toLowerCase() :
                    homeTeam === abbreviation.toLowerCase();
            const desiredTeam = isHomeTeamDesiredTeam ? teams.home : teams.away;
            const againstTeam = isHomeTeamDesiredTeam ? teams.away : teams.home;
            const desiredTeamId = desiredTeam.team.id.toString();
            const againstTeamId = againstTeam.team.id.toString();
            const desiredTeamAbbreviation = desiredTeam.team.abbreviation.toLowerCase();
            const againstTeamAbbreviation = againstTeam.team.abbreviation.toLowerCase();
            let desiredTeamColorResponse = yield this.getTeamColors(desiredTeamId);
            let againstTeamColorResponse = yield this.getTeamColors(againstTeamId);
            if (!Array.isArray(desiredTeamColorResponse)) {
                desiredTeamColorResponse = ['#FFFFFF'];
            }
            if (!Array.isArray(againstTeamColorResponse)) {
                againstTeamColorResponse = ['#FFFFFF'];
            }
            let desiredColor = (0, color_1.default)(desiredTeamColorResponse[0]);
            let againstColor = (0, color_1.default)(againstTeamColorResponse[0]);
            const useSecondaryColorDesired = data_1.logos.useSecondaryColor.includes(desiredTeamAbbreviation);
            const useSecondaryColorAgainst = data_1.logos.useSecondaryColor.includes(againstTeamAbbreviation);
            const useTeamCapOnDarkDesired = data_1.logos.useTeamCapOnDark.includes(desiredTeamAbbreviation);
            const useTeamCapOnDarkAgainst = data_1.logos.useTeamCapOnDark.includes(againstTeamAbbreviation);
            const useOtherUrlDesired = data_1.logos.useOtherUrl.includes(desiredTeamAbbreviation);
            const useOtherUrlAgainst = data_1.logos.useOtherUrl.includes(againstTeamAbbreviation);
            let desiredTeamLogo;
            let againstTeamLogo;
            if (useTeamCapOnDarkDesired) {
                desiredTeamLogo = (yield this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer', data_1.logos.urlTeamCapOnDark, false));
            }
            else if (useOtherUrlDesired) {
                desiredTeamLogo = (yield this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer', data_1.logos.otherUrls[desiredTeamAbbreviation], true));
            }
            else {
                desiredTeamLogo = (yield this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer'));
            }
            if (useTeamCapOnDarkAgainst) {
                againstTeamLogo = (yield this.getTeamLogo(againstTeamId, null, null, null, null, 'Buffer', data_1.logos.urlTeamCapOnDark, false));
            }
            else if (useOtherUrlAgainst) {
                againstTeamLogo = (yield this.getTeamLogo(againstTeamId, null, null, null, null, 'Buffer', data_1.logos.otherUrls[againstTeamAbbreviation], true));
            }
            else {
                againstTeamLogo = (yield this.getTeamLogo(againstTeam.team.id.toString(), null, null, null, null, 'Buffer'));
            }
            if (useSecondaryColorDesired) {
                desiredColor = (0, color_1.default)(desiredTeamColorResponse[1]);
            }
            if (useSecondaryColorAgainst) {
                againstColor = (0, color_1.default)(againstTeamColorResponse[1]);
            }
            const svgHeightAndWidth = 400;
            const translateFactor = (Math.SQRT2 / 2) * -1;
            const background = `
        <svg width="${svgHeightAndWidth}" height="${svgHeightAndWidth}" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="home-away-gradient" gradientTransform="translate(1, ${translateFactor}) rotate(45)">
              <stop stop-color='${(isHomeTeamDesiredTeam ? againstColor.hex() : desiredColor.hex())}' offset="0%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? againstColor.hex() : desiredColor.hex())}' offset="50%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? desiredColor.hex() : againstColor.hex())}' offset="50%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? desiredColor.hex() : againstColor.hex())}' offset="100%" />
            </linearGradient>
          </defs>
          <style>
            #matchup-background {
              fill: url(#home-away-gradient)
            }
          </style>
          <rect id="matchup-background" width="400" height="400" />
        </svg>
    `;
            // console.log(desiredTeamLogo.viewportElement);
            const desiredGraphic = (0, sharp_1.default)(Buffer.from(desiredTeamLogo)).resize(150, 150, { fit: 'inside' });
            const againstGraphic = (0, sharp_1.default)(Buffer.from(againstTeamLogo)).resize(150, 150, { fit: 'inside' });
            const centerOfTriangle = Math.floor((svgHeightAndWidth / 2) / 3);
            const graphic = (0, sharp_1.default)(Buffer.from(background))
                .composite([
                {
                    input: yield desiredGraphic.toBuffer(),
                    top: isHomeTeamDesiredTeam ? centerOfTriangle + 150 : centerOfTriangle - 25,
                    left: isHomeTeamDesiredTeam ? centerOfTriangle + 150 : centerOfTriangle - 25
                },
                {
                    input: yield againstGraphic.toBuffer(),
                    top: isHomeTeamDesiredTeam ? centerOfTriangle - 25 : centerOfTriangle + 150,
                    left: isHomeTeamDesiredTeam ? centerOfTriangle - 25 : centerOfTriangle + 150
                }
            ]);
            return yield graphic.png().toBuffer();
        });
    }
    /**
       * Gets the current standings for an MLB division, league, sport. can also include playoffs
       * @param {string} year - The year requested for record
       * @param {string} date - The date in MM/DD/YYYY format
       * @param {string} location - The MLB team location
       * @param {string} name - The MLB team name
       * @param {string} abbreviation - The MLB team's abbreviation
       * @returns {(IRecordsResponse | IError)}
       */
    getStandings(date, type, specificType) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let year = null;
                if (!date) {
                    const today = new Date();
                    const month = (today.getMonth() + 1).toString();
                    const day = today.getDate().toString();
                    year = today.getFullYear().toString();
                    date = `${month}/${day}/${year}`;
                }
                else {
                    year = new Date(date).getFullYear().toString();
                }
                let standings = yield (yield mlbTransport.get((0, urls_1.standingsUrl)(year, date, type))).data;
                if (specificType) {
                    let idToFind = -1;
                    let leagueIndex = -1;
                    let propertyToUse = 'division';
                    switch (specificType) {
                        case 'al':
                            propertyToUse = 'league';
                            idToFind = standings.structure.sports[0].leagues.find(l => l.abbreviation.toLowerCase() === 'al').id;
                            break;
                        case 'nl':
                            propertyToUse = 'league';
                            idToFind = standings.structure.sports[0].leagues.find(l => l.abbreviation.toLowerCase() === 'nl').id;
                            break;
                        case 'alc':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'alc').id;
                            break;
                        case 'ale':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'ale').id;
                            break;
                        case 'alw':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'alw').id;
                            break;
                        case 'nlc':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nlc').id;
                            break;
                        case 'nle':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nle').id;
                            break;
                        case 'nlw':
                            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
                            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nlw').id;
                            break;
                        default:
                            break;
                    }
                    //@ts-ignore
                    const actualRecords = standings.records.filter(r => r[propertyToUse] === idToFind);
                    // console.log(idToFind);
                    standings.records = actualRecords;
                }
                return standings;
            }
            catch (exception) {
                console.log(exception);
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/standings`, data.message);
                const error = {
                    message: data.message,
                    statusCode: response.status
                };
                return error;
            }
        });
    }
};
__decorate([
    (0, tsoa_1.Get)('/games'),
    __param(0, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGames", null);
__decorate([
    (0, tsoa_1.Get)('/game/feed'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getFeed", null);
__decorate([
    (0, tsoa_1.Get)('/game/boxscore'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getBoxscore", null);
__decorate([
    (0, tsoa_1.Get)('/game/probables'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGameProbables", null);
__decorate([
    (0, tsoa_1.Get)('/game/score'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGameScore", null);
__decorate([
    (0, tsoa_1.Get)('/game'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGameForTeam", null);
__decorate([
    (0, tsoa_1.Get)('/teams'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getTeamNoId", null);
__decorate([
    (0, tsoa_1.Get)('/team'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getTeam", null);
__decorate([
    (0, tsoa_1.Get)('/team/logo'),
    (0, tsoa_1.Produces)('image/*'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __param(6, (0, tsoa_1.Query)()),
    __param(7, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, Boolean]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getTeamLogo", null);
__decorate([
    (0, tsoa_1.Get)('/team/leaders'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getTeamLeaders", null);
__decorate([
    (0, tsoa_1.Get)('/team/roster'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getRoster", null);
__decorate([
    (0, tsoa_1.Get)('/team/colors'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getTeamColors", null);
__decorate([
    (0, tsoa_1.Get)('/player'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getPlayer", null);
__decorate([
    (0, tsoa_1.Get)('/player/stats'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getPlayerStats", null);
__decorate([
    (0, tsoa_1.Get)('/player/headshot'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __param(6, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getPlayerHeadshot", null);
__decorate([
    (0, tsoa_1.Get)('/record'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getRecord", null);
__decorate([
    (0, tsoa_1.Get)('/game/matchup/graphic'),
    (0, tsoa_1.Produces)('image/png'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getMatchupGraphic", null);
__decorate([
    (0, tsoa_1.Get)('/standings'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getStandings", null);
MlbController = __decorate([
    (0, tsoa_1.Route)('mlb'),
    (0, tsoa_1.Tags)('MLB')
], MlbController);
exports.MlbController = MlbController;
//# sourceMappingURL=mlb.js.map