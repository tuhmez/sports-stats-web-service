import { Router } from 'express';
import { MlbController } from '../controllers/mlb';
import { IGameByTeamNameResponse } from '../interfaces';
import sharp from 'sharp';

export class MLBRoutes {
  constructor(router: Router) {
    const mlbController = new MlbController();

    router.get("/mlb", async (_req, res) => {
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
    });

    // ===== games ===== //
    router.get("/mlb/games", async (_req, res) => {
      const date = _req.query.date as string;
      const response = await mlbController.getGames(date);
      return res.json(response);
    });

    router.get("/mlb/game/feed", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      if (
        (!id || id === '') &&
        ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getFeed(
        id,
        location,
        name,
        abbreviation,
        date,
      );
      return res.send(response);


    });

    router.get("/mlb/game/boxscore", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      if (
        (!id || id === '') &&
        ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getBoxscore(
        id,
        location,
        name,
        abbreviation,
        date,
      );
      return res.send(response);
    });

    router.get("/mlb/game/probables", async (_req, res) => {
      const id = _req.query.gameId as string;
      const location = _req.query.teamLocation as string;
      const name = _req.query.teamName as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      if (
        (!id || id === '') &&
        ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getGameProbables(
        id,
        location,
        name,
        abbreviation,
        date,
      );
      return res.json(response);
    });

    router.get("/mlb/game/score", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      if (
        (!id || id === '') &&
        ((!location || location === '' || !name || name === '') && (!abbreviation || abbreviation === ''))
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getGameScore(
        id,
        location,
        name,
        abbreviation,
        date,
      );
      return res.json(response);
    });

    router.get("/mlb/game", async (_req, res) => {
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      const response = await mlbController.getGameForTeam(
        location,
        name,
        abbreviation,
        date,
      );
      return res.json(response);
    });

    router.get("/mlb/game/matchup/graphic", async (_req, res) => {
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const date = _req.query.date as string;

      const display = _req.query.display as string;

      const graphic = await mlbController.getMatchupGraphic(location, name, abbreviation, date);

      if (display === 'immediate') {
        console.log(`data:image/png;base64,${graphic.toString('base64')}`)
        return res.send(`<img src={data:image/png;base64,${graphic.toString('base64')}}`);
      } else {
        // @ts-ignore
        if (graphic.message) {
          res.send(graphic);
        } else {
          res.setHeader('content-type', 'image/png');
          return res.send(graphic);
        }
      }
    });

    // ===== games ===== //

    // ===== sports ===== //

    router.get("/mlb/sports", async (_req, res) => {
      const id = _req.query.id as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const response = await mlbController.getSport(id, name, abbreviation);
      return res.json(response);
    });

    // ===== sports ===== //

    // ===== leagues ===== //

    router.get("/mlb/leagues", async (_req, res) => {
      const id = _req.query.id as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const response = await mlbController.getLeague(id, name, abbreviation);
      return res.json(response);
    });

    // ===== leagues ===== //

    // ===== teams ===== //

    router.get("/mlb/teams", async (_req, res) => {
      const response = await mlbController.getTeamNoId();
      return res.json(response);
    });

    router.get("/mlb/team", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !location && !name && !abbreviation) {
        return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
      }

      const response = await mlbController.getTeam(
        id,
        location,
        name,
        abbreviation,
      );
      return res.json(response);
    });

    router.get("/mlb/team/logo", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;
      const format = _req.query.format as string;
      
      if (!id && !location && !name && !abbreviation) {
        return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
      }

      const response = await mlbController.getTeamLogo(id, location, name, abbreviation, format);
      return res.send(response);
    });

    router.get("/mlb/team/leaders", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !location && !name && !abbreviation) {
        return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
      }

      const response = await mlbController.getTeamLeaders(id, location, name, abbreviation);
      return res.json(response);
    });

    router.get("/mlb/team/roster", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !location && !name && !abbreviation) {
        return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
      }

      const response = await mlbController.getRoster(id, location, name, abbreviation);
      return res.json(response);
    });

    router.get("/mlb/team/colors", async (_req, res) => {
      const id = _req.query.id as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !location && !name && !abbreviation) {
        return res.send('Inputs invalid, must have a query entry for: id, location, name, or abbreviation');
      }

      const response = await mlbController.getTeamColors(id, location, name, abbreviation);

      if (!Array.isArray(response)) return res.send(response);

      const colorDivs = response.map((r) => `<div style="background-color:${r}; width:20px; height:20px; border:0.5px solid black"></div>`);
      let mainDivString = '<div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">';
      colorDivs.forEach((cd) => {
        mainDivString += cd;
      });
      mainDivString += '</div>';
      return res.send(mainDivString);
    });

    // ===== teams ===== //

    // ===== players ===== //

    router.get("/mlb/player", async (_req, res) => {
      const id = _req.query.id as string;
      const firstName = _req.query.firstName as string;
      const lastName = _req.query.lastName as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
        return res.send('Player ID or player information not invalid!');
      }

      const response = await mlbController.getPlayer(id, firstName, lastName, location, name, abbreviation);
      return res.json(response);
    });

    router.get("/mlb/player/stats", async(_req, res) => {
      const id = _req.query.id as string;
      const firstName = _req.query.firstName as string;
      const lastName = _req.query.lastName as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
        return res.send('Player ID or player information not invalid!');
      }

      const response = await mlbController.getPlayerStats(id, firstName, lastName, location, name, abbreviation);
      return res.json(response);
    });

    router.get("/mlb/player/headshot", async (_req, res) => {
      const id = _req.query.id as string;
      const firstName = _req.query.firstName as string;
      const lastName = _req.query.lastName as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      if (!id && !firstName && !lastName && !location && !name && !abbreviation) {
        return res.send('Player ID or player information not invalid!');
      }
      const magnification = _req.query.magnification as string | null;
      const response = await mlbController.getPlayerHeadshot(
        id,
        magnification,
        firstName,
        lastName,
        location,
        name,
        abbreviation
      );
      return res.send(`<img src="${response}" />`);
    });

    // ===== players ===== //

    // ===== standings ===== //

    router.get("/mlb/standings", async(_req, res) => {
      const date = _req.query.date  as string;
      const type = _req.query.type as string;
      const specificType = _req.query.specificType as string;

      const response = await mlbController.getStandings(date, type, specificType);
      return res.json(response);
    });

    router.get("/mlb/record", async (_req, res) => {
      const year = _req.query.year as string;
      const date = _req.query.date as string;
      const location = _req.query.location as string;
      const name = _req.query.name as string;
      const abbreviation = _req.query.abbreviation as string;

      const response = await mlbController.getRecord(
        year,
        date,
        location,
        name,
        abbreviation,
      );
      return res.json(response);
    });

    // ===== standings ===== //
  }
}
