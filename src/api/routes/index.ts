import express from 'express';
import { readFileSync } from 'fs';
import { MlbController } from '../controllers/mlb';
import PingController from '../controllers/ping';

const router = express.Router();

const mlbController = new MlbController();
const pingController = new PingController();

// ----------------- MLB ----------------- //

// ===== games ===== //
router.get("/mlb/games", async (_req, res) => {
  const month = _req.query.month as string;
  const day = _req.query.day as string;
  const year = _req.query.year as string;
  const response = await mlbController.getGames(month, day, year);
  return res.send(response);
});

router.get("/mlb/game/:gameId/feed", async (_req, res) => {
  const gameId = _req.params.gameId as string;

  if (!gameId || gameId === '') return res.send('Game ID invalid!');

  const response = await mlbController.getFeed(gameId);
  return res.send(response);
});

router.get("/mlb/game/:gameId/boxscore", async (_req, res) => {
  const gameId = _req.params.gameId as string;

  if (!gameId || gameId === '') return res.send('Game ID invalid!');

  const response = await mlbController.getBoxscore(gameId);
  return res.send(response);
});

router.get("/mlb/game/:gameId/probables", async (_req, res) => {
  const gameId = _req.params.gameId as string;

  if (!gameId || gameId === '') return res.send('Game ID invalid!');

  const response = await mlbController.getGameProbables(gameId);
  return res.send(response);
});

// ===== games ===== //

// ===== teams ===== //

router.get("/mlb/teams", async (_req, res) => {
  const response = await mlbController.getTeamNoId();
  return res.send(response);
});

router.get("/mlb/team/:teamId", async (_req, res) => {
  const teamId = _req.params.teamId as string;

  if (!teamId || teamId === '') return res.send('Team ID invalid!');

  const response = await mlbController.getTeam(teamId);
  return res.send(response);
});

router.get("/mlb/team/:teamId/logo", async (_req, res) => {
  const teamId = _req.params.teamId as string;

  if (!teamId || teamId === '') return res.send('Team ID invalid!');

  const response = await mlbController.getTeamLogo(teamId);
  return res.send(response);
});

router.get("/mlb/team/:teamId/leaders", async (_req, res) => {
  const teamId = _req.params.teamId as string;

  if (!teamId || teamId === '') return res.send('Team ID invalid!');

  const response = await mlbController.getTeamLeaders(teamId);
  return res.send(response);
});

router.get("/mlb/team/:teamId/roster", async (_req, res) => {
  const teamId = _req.params.teamId as string;

  if (!teamId || teamId === '') return res.send('Team ID invalid!');

  const response = await mlbController.getRoster(teamId);
  return res.send(response);
});

router.get("/mlb/team/colors/:teamLocation-:teamName", async (_req, res) => {
  const teamLocation = _req.params.teamLocation as string;
  const teamName = _req.params.teamName;

  if (!teamLocation || teamLocation === '' || !teamName || teamName === '') return res.send('Team Location and/or Team Name is invalid!');

  const response = await mlbController.getTeamColors(teamLocation, teamName);

  if (!Array.isArray(response)) return res.send(response);

  const colorDivs = response.map((r) => `<div style="background-color:${r}; width:20px; height:20px; border:0.5px solid black"></div>`);
  let mainDivString = '<div style="display: flex; flex-direction: row; align-items: center; gap: 8px;">';
  colorDivs.forEach((cd) => {
    mainDivString += cd;
  });
  mainDivString += '</div>';
  return res.send(mainDivString);
});

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

// ----------------- Ping ----------------- //
router.get("/ping", async(_req, res) => {
  const response = await pingController.getMessage();
  return res.send(response);
});

export default router;
