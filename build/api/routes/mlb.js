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
            const date = _req.query.date;
            const response = yield mlbController.getGames(date);
            return res.json(response);
        }));
        router.get("/mlb/game/feed", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            if ((!id || id === '') &&
                ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getFeed(id, location, name, abbreviation, date);
            return res.send(response);
        }));
        router.get("/mlb/game/boxscore", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            if ((!id || id === '') &&
                ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getBoxscore(id, location, name, abbreviation, date);
            return res.send(response);
        }));
        router.get("/mlb/game/probables", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.gameId;
            const location = _req.query.teamLocation;
            const name = _req.query.teamName;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            if ((!id || id === '') &&
                ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getGameProbables(id, location, name, abbreviation, date);
            return res.json(response);
        }));
        router.get("/mlb/game/score", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            if ((!id || id === '') &&
                ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))) {
                return res.send('Game ID/Team Location and Team Name invalid!');
            }
            const response = yield mlbController.getGameScore(id, location, name, abbreviation, date);
            return res.json(response);
        }));
        router.get("/mlb/game", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            const response = yield mlbController.getGameForTeam(location, name, abbreviation, date);
            return res.json(response);
        }));
        router.get("/mlb/game/matchup/graphic", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const date = _req.query.date;
            const display = _req.query.display;
            const graphic = yield mlbController.getMatchupGraphic(location, name, abbreviation, date);
            if (display === 'immediate') {
                console.log(`data:image/png;base64,${graphic.toString('base64')}`);
                return res.send(`<img src={data:image/png;base64,${graphic.toString('base64')}}`);
            }
            else {
                // @ts-ignore
                if (graphic.message) {
                    res.send(graphic);
                }
                else {
                    res.setHeader('content-type', 'image/png');
                    return res.send(graphic);
                }
            }
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
            const format = _req.query.format;
            if (!id && !location && !name && !abbreviation) {
                return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
            }
            const response = yield mlbController.getTeamLogo(id, location, name, abbreviation, format);
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
        // ===== teams ===== //
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
        router.get("/mlb/player/stats", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const id = _req.query.id;
            const firstName = _req.query.firstName;
            const lastName = _req.query.lastName;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
                return res.send('Player ID or player information not invalid!');
            }
            const response = yield mlbController.getPlayerStats(id, firstName, lastName, location, name, abbreviation);
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
            const date = _req.query.date;
            const type = _req.query.type;
            const specificType = _req.query.specificType;
            const response = yield mlbController.getStandings(date, type, specificType);
            return res.json(response);
        }));
        router.get("/mlb/record", (_req, res) => __awaiter(this, void 0, void 0, function* () {
            const year = _req.query.year;
            const date = _req.query.date;
            const location = _req.query.location;
            const name = _req.query.name;
            const abbreviation = _req.query.abbreviation;
            const response = yield mlbController.getRecord(year, date, location, name, abbreviation);
            return res.json(response);
        }));
        // ===== standings ===== //
    }
}
exports.MLBRoutes = MLBRoutes;
//# sourceMappingURL=mlb.js.map