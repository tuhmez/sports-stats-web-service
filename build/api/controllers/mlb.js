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
const utils_1 = require("../../utils");
const urls_1 = require("../urls");
const utils_2 = require("../utils");
const mlbTransport = axios_1.default.create();
let MlbController = class MlbController {
    /**
     * Gets a list of all the games for a given day. If any inputs are missing, the date will automatically default to the current date of request.
     * @param {string} month - The numerical month
     * @param {string} day - The numerical day
     * @param {string} year - The year
     * @returns {IGamesResponse}
     */
    getGames(month, day, year) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!month || !day || !year) {
                const today = new Date();
                month = (today.getMonth() + 1).toString();
                day = today.getDate().toString();
                year = today.getFullYear().toString();
            }
            try {
                const data = yield mlbTransport.get((0, urls_1.dailyGamesUrl)(month, day, year));
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
     * @param {string} gameId - The game ID
     * @param {string} teamLocation - The team's location
     * @param {string} teamName - The team's name
     * @param {string} month - The numerical month
     * @param {string} day - The numerical day
     * @param {string} year - The year
     * @returns {(IGameFeedResponse|IGameFeedByTeamNameResponse[]|IError)} Returns the feed(s) for found game(s).
     */
    getFeed(gameId, teamLocation, teamName, month, day, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (gameId) {
                    const data = yield mlbTransport.get((0, urls_1.gameFeedUrl)(gameId));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!month || !day || !year) {
                        const today = new Date();
                        month = (today.getMonth() + 1).toString();
                        day = today.getDate().toString();
                        year = today.getFullYear().toString();
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(month, day, year))).data;
                    if (data.totalGames === 0)
                        return [];
                    const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName } = homeTeam;
                        return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
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
                (0, utils_1.LogError)(response.status, `/mlb/game/${gameId}/feed`, data.message);
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
     * @param {string} gameId - The game ID
     * @param {string} teamLocation - The team's location
     * @param {string} teamName - The team's name
     * @param {string} month - The numerical month
     * @param {string} day - The numerical day
     * @param {string} year - The year
     * @returns {(IGameBoxscoreResponse|IGameBoxscoreResponse[]|IError)} - The boxscore(s) for the given game(s).
     */
    getBoxscore(gameId, teamLocation, teamName, month, day, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (gameId) {
                    const data = yield mlbTransport.get((0, urls_1.gameBoxscoreUrl)(gameId));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!month || !day || !year) {
                        const today = new Date();
                        month = (today.getMonth() + 1).toString();
                        day = today.getDate().toString();
                        year = today.getFullYear().toString();
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(month, day, year))).data;
                    if (data.totalGames === 0)
                        return [];
                    const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName } = homeTeam;
                        return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                    });
                    const gameBoxscorePromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.gameBoxscoreUrl)(g.gamePk.toString()))));
                    return gameBoxscorePromises.map((gsp) => gsp.data);
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/${gameId}/boxscore`, data.message);
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
     * @param {string} gameId - The game ID
     * @param {string} teamLocation - The team's location
     * @param {string} teamName - The team's name
     * @param {string} month - The numerical month
     * @param {string} day - The numerical day
     * @param {string} year - The year
     * @returns {(IProbablesResponse|IProbablesResponse[]|IError)} - The probables(s) for the given game(s).
     */
    getGameProbables(gameId, teamLocation, teamName, month, day, year) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (gameId) {
                    const data = yield mlbTransport.get((0, urls_1.matchupUrl)(gameId));
                    const extractedData = data.data;
                    return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
                }
                else {
                    if (!month || !day || !year) {
                        const today = new Date();
                        month = (today.getMonth() + 1).toString();
                        day = today.getDate().toString();
                        year = today.getFullYear().toString();
                    }
                    const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(month, day, year))).data;
                    if (data.totalGames === 0)
                        return [];
                    const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;
                    const games = data.dates[0].games.filter((g) => {
                        const { away, home } = g.teams;
                        const { team: awayTeam } = away;
                        const { name: awayName } = awayTeam;
                        const { team: homeTeam } = home;
                        const { name: homeName } = homeTeam;
                        return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
                    });
                    const gameBoxscorePromises = yield Promise.all(games.map((g) => mlbTransport.get((0, urls_1.matchupUrl)(g.gamePk.toString()))));
                    return gameBoxscorePromises.map((gsp) => gsp.data);
                }
            }
            catch (exception) {
                const { data, response } = exception;
                (0, utils_1.LogError)(response.status, `/mlb/game/${gameId}/probables`, data.message);
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
     * @param teamLocation The team's location (lower case), e.g. milwaukee
     * @param teamName The team's name (lower case), e.g. brewers
     * @param month The numerical month, e.g. 8
     * @param day The numerical day, e.g. 12
     * @param year The year, e.g. 2022
     * @returns {IGameByTeamNameResponse}
     */
    getGameForTeam(teamLocation, teamName, month, day, year) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!month || !day || !year) {
                const today = new Date();
                month = (today.getMonth() + 1).toString();
                day = today.getDate().toString();
                year = today.getFullYear().toString();
            }
            try {
                const data = yield (yield mlbTransport.get((0, urls_1.dailyGamesUrl)(month, day, year))).data;
                if (data.totalGames === 0) {
                    const response = {
                        totalGames: 0,
                        totalGamesInProgress: 0,
                        games: []
                    };
                    return response;
                }
                const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;
                const games = data.dates[0].games.filter((g) => {
                    const { away, home } = g.teams;
                    const { team: awayTeam } = away;
                    const { name: awayName } = awayTeam;
                    const { team: homeTeam } = home;
                    const { name: homeName } = homeTeam;
                    return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
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
                (0, utils_1.LogError)(response.status, `/mlb/game/${teamLocation.trim().toLowerCase()}-${teamName.trim().toLowerCase()}`, data.message);
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
     * @returns {(HTMLOrSVGElement | IError)}
     */
    getTeamLogo(id, location, name, abbreviation) {
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
                const data = yield mlbTransport.get((0, urls_1.teamLogosUrl)(id));
                return data.data;
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
                location = team.locationName;
                name = team.teamName;
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
                const teamRow = $(e).find('th').text().toLowerCase();
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
                teamColors.push(`#${tdStrings[tdStrings.length - 1]}`);
            });
            return teamColors.filter((tc) => tc !== '#');
        });
    }
    /**
     * Gets the player via player id
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
     * Gets the current standings for the MLB
     * @returns {(IStandingsResponse | IError)}
     */
    getStandings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield (yield mlbTransport.get((0, urls_1.standingsUrl)())).data;
            }
            catch (exception) {
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
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGames", null);
__decorate([
    (0, tsoa_1.Get)('/game/feed'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getFeed", null);
__decorate([
    (0, tsoa_1.Get)('/game/boxscore'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getBoxscore", null);
__decorate([
    (0, tsoa_1.Get)('/game/probables'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __param(5, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getGameProbables", null);
__decorate([
    (0, tsoa_1.Get)('/game/{teamLocation}-{teamName}'),
    __param(0, (0, tsoa_1.Path)()),
    __param(1, (0, tsoa_1.Path)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __param(4, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
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
    (0, tsoa_1.Produces)('image/svg'),
    __param(0, (0, tsoa_1.Query)()),
    __param(1, (0, tsoa_1.Query)()),
    __param(2, (0, tsoa_1.Query)()),
    __param(3, (0, tsoa_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
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
    (0, tsoa_1.Get)('/standings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MlbController.prototype, "getStandings", null);
MlbController = __decorate([
    (0, tsoa_1.Route)('mlb'),
    (0, tsoa_1.Tags)('MLB')
], MlbController);
exports.MlbController = MlbController;
//# sourceMappingURL=mlb.js.map