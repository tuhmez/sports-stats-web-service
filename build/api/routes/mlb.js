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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MLBRoutes = void 0;
const mlb_1 = require("../controllers/mlb");
class MLBRoutes {
    constructor(router) {
        const mlbController = new mlb_1.MlbController();
        router.get("/mlb", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const filteredStack = router.stack.filter((s) => s.route.path.includes('mlb/'));
            const html = `
      <div style="display: flex; flex-direction: column; align-items: flex-start;">
        <h1>MLB Routes</h1>
        <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px;">
          ${filteredStack.map((s) => `<body1>[${s.route.stack[0].method.toUpperCase()}] ${s.route.path}</body1>`).join('\n')}
        </div>
      </div>
    `;
            return res.send(html);
        }));
        // ===== games ===== //
        router.get("/mlb/games", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const month = _req.query.month;
            const day = _req.query.day;
            const year = _req.query.year;
            const response = yield mlbController.getGames(month, day, year);
            return res.json(response);
        }));
        router.get("/mlb/game/feed", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const gameId = _req.query.gameId;
            const teamLocation = _req.query.teamLocation;
            const teamName = _req.query.teamName;
            const month = _req.query.month;
            const day = _req.query.day;
            const year = _req.query.year;
            if ((!gameId || gameId === '') &&
                (!teamLocation || teamLocation === '' || !teamName || teamName === '')) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getFeed(gameId, teamLocation, teamName, month, day, year);
            return res.send(response);
        }));
        router.get("/mlb/game/boxscore", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const gameId = _req.query.gameId;
            const teamLocation = _req.query.teamLocation;
            const teamName = _req.query.teamName;
            const month = _req.query.month;
            const day = _req.query.day;
            const year = _req.query.year;
            if ((!gameId || gameId === '') &&
                (!teamLocation || teamLocation === '' || !teamName || teamName === '')) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getBoxscore(gameId, teamLocation, teamName, month, day, year);
            return res.send(response);
        }));
        router.get("/mlb/game/probables", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const gameId = _req.query.gameId;
            const teamLocation = _req.query.teamLocation;
            const teamName = _req.query.teamName;
            const month = _req.query.month;
            const day = _req.query.day;
            const year = _req.query.year;
            if ((!gameId || gameId === '') &&
                (!teamLocation || teamLocation === '' || !teamName || teamName === '')) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getGameProbables(gameId, teamLocation, teamName, month, day, year);
            return res.json(response);
        }));
        router.get("/mlb/game/:teamLocation-:teamName", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const teamLocation = _req.params.teamLocation;
            const teamName = _req.params.teamName;
            const month = _req.query.month;
            const day = _req.query.day;
            const year = _req.query.year;
            const response = yield mlbController.getGameForTeam(teamLocation, teamName, month, day, year);
            return res.json(response);
        }));
        // ===== games ===== //
        // ===== teams ===== //
        router.get("/mlb/teams", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const response = yield mlbController.getTeamNoId();
            return res.json(response);
        }));
        router.get("/mlb/team", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getTeam(id, location, name, abbreviation);
            return res.json(response);
        }));
        router.get("/mlb/team/logo", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getTeamLogo(id, location, name, abbreviation);
            return res.send(response);
        }));
        router.get("/mlb/team/leaders", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getTeamLeaders(id, location, name, abbreviation);
            return res.json(response);
        }));
        router.get("/mlb/team/roster", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getRoster(id, location, name, abbreviation);
            return res.json(response);
        }));
        router.get("/mlb/team/colors", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getTeamColors(id, location, name, abbreviation);
            if (!Array.isArray(response))
                return res.send(response);
            const colorDivs = response.map((r) => `<div style="background-color:${r}; width:20px; height:20px; border:0.5px solid black"></div>`);
            let mainDivString = '<div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">';
            colorDivs.forEach((cd) => {
                mainDivString += cd;
            });
            mainDivString += '</div>';
            return res.send(mainDivString);
        }));
        // ===== players ===== //
        router.get("/mlb/player", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const firstName = _req.query.firstName;
            const lastName = _req.query.lastName;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
                return res.send('Player ID or player information not invalid!');
            }
            const response = yield mlbController.getPlayer(id, firstName, lastName, location, name, abbreviation);
            return res.json(response);
        }));
        router.get("/mlb/player/headshot", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const firstName = _req.query.firstName;
            const lastName = _req.query.lastName;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
                return res.send('Player ID or player information not invalid!');
            }
            const magnification = _req.query.magnification;
            const response = yield mlbController.getPlayerHeadshot(id, magnification, firstName, lastName, location, name, abbreviation);
            return res.send(`<img src="${response}" />`);
        }));
        // ===== players ===== //
        // ===== standings ===== //
        router.get("/mlb/standings", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const response = yield mlbController.getStandings();
            return res.json(response);
        }));
        // ===== standings ===== //
    }
}
exports.MLBRoutes = MLBRoutes;
//# sourceMappingURL=mlb.js.map