import { Router } from 'express';
import { MlbController } from '../controllers/mlb';

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
      const month = _req.query.month as string;
      const day = _req.query.day as string;
      const year = _req.query.year as string;
      const response = await mlbController.getGames(month, day, year);
      return res.send(response);
    });

    router.get("/mlb/game/feed", async (_req, res) => {
      const gameId = _req.query.gameId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      const month = _req.query.month as string;
      const day = _req.query.day as string;
      const year = _req.query.year as string;

      if (
        (!gameId || gameId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getFeed(
        gameId,
        teamLocation,
        teamName,
        month,
        day,
        year
      );
      return res.send(response);


    });

    router.get("/mlb/game/boxscore", async (_req, res) => {
      const gameId = _req.query.gameId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      const month = _req.query.month as string;
      const day = _req.query.day as string;
      const year = _req.query.year as string;

      if (
        (!gameId || gameId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getBoxscore(
        gameId,
        teamLocation,
        teamName,
        month,
        day,
        year
      );
      return res.send(response);
    });

    router.get("/mlb/game/probables", async (_req, res) => {
      const gameId = _req.query.gameId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      const month = _req.query.month as string;
      const day = _req.query.day as string;
      const year = _req.query.year as string;

      if (
        (!gameId || gameId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Game ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getGameProbables(
        gameId,
        teamLocation,
        teamName,
        month,
        day,
        year
      );
      return res.send(response);
    });

    router.get("/mlb/game/:teamLocation-:teamName", async (_req, res) => {
      const teamLocation = _req.params.teamLocation as string;
      const teamName = _req.params.teamName as string;

      const month = _req.query.month as string;
      const day = _req.query.day as string;
      const year = _req.query.year as string;

      const response = await mlbController.getGameForTeam(
        teamLocation,
        teamName,
        month,
        day,
        year
      );
      return res.send(response);
    });

    // ===== games ===== //

    // ===== teams ===== //

    router.get("/mlb/teams", async (_req, res) => {
      const response = await mlbController.getTeamNoId();
      return res.send(response);
    });

    router.get("/mlb/team", async (_req, res) => {
      const teamId = _req.query.teamId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      if (
        (!teamId || teamId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Team ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getTeam(
        teamId,
        teamLocation,
        teamName
      );
      return res.send(response);
    });

    router.get("/mlb/team/logo", async (_req, res) => {
      const teamId = _req.query.teamId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      if (
        (!teamId || teamId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Team ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getTeamLogo(teamId, teamLocation, teamName);
      return res.send(response);
    });

    router.get("/mlb/team/leaders", async (_req, res) => {
      const teamId = _req.query.teamId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      if (
        (!teamId || teamId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Team ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getTeamLeaders(
        teamId,
        teamLocation,
        teamName
      );
      return res.send(response);
    });

    router.get("/mlb/team/roster", async (_req, res) => {
      const teamId = _req.query.teamId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      if (
        (!teamId || teamId === '') &&
        (!teamLocation || teamLocation === '' || !teamName || teamName === '')
      ) {
        return res.send('Team ID/Team Location and Team Name invalid!');
      }

      const response = await mlbController.getRoster(
        teamId,
        teamLocation,
        teamName,
      );
      return res.send(response);
    });

    router.get("/mlb/team/colors", async (_req, res) => {
      const teamId = _req.query.teamId as string;
      const teamLocation = _req.query.teamLocation as string;
      const teamName = _req.query.teamName as string;

      if ((!teamId || teamId === '') && (!teamLocation || teamLocation === '' || !teamName || teamName === '')) return res.send('Team Id and Team Location and/or Team Name is invalid!');

      const response = await mlbController.getTeamColors(teamId, teamLocation, teamName);

      if (!Array.isArray(response)) return res.send(response);

      const colorDivs = response.map((r) => `<div style="background-color:${r}; width:20px; height:20px; border:0.5px solid black"></div>`);
      let mainDivString = '<div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">';
      colorDivs.forEach((cd) => {
        mainDivString += cd;
      });
      mainDivString += '</div>';
      return res.send(mainDivString);
    });

    // ===== players ===== //

    router.get("/mlb/player/:playerId", async (_req, res) => {
      const playerId = _req.params.playerId as string;

      if (!playerId || playerId === '') return res.send('Player ID invalid!');

      const response = await mlbController.getPlayer(playerId);
      return res.send(response);
    });

    router.get("/mlb/player/:playerId/headshot", async (_req, res) => {
      const playerId = _req.params.playerId as string;

      if (!playerId || playerId === '') return res.send('Player ID invalid!');

      const magnification = _req.query.magnification as string | null;
      const response = await mlbController.getPlayerHeadshot(playerId, magnification);
      return res.send(`<img src="${response}" />`);
    });

    // ===== players ===== //
  }
}
