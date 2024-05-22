"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.standingsUrl = exports.recordUrl = exports.teamColorCodesPageUrl = exports.playerCurrentHeadshotUrl = exports.teamLeadersUrl = exports.playerStatsUrl = exports.playerUrl = exports.promotionalSponsorsUrl = exports.matchupUrl = exports.rosterUrl = exports.teamUrl = exports.teamLogosUrl = exports.gameBoxscoreUrl = exports.gameFeedUrl = exports.dailyGamesUrl = void 0;
const dailyGamesUrl = (date) => {
    return `https://statsapi.mlb.com/api/v1/schedule?language=en&sportId=1,11,12,13,14,16&date=${date}&sortBy=gameDate&hydrate=game(content(summary,media(epg))),linescore(runners),flags,team,review`;
};
exports.dailyGamesUrl = dailyGamesUrl;
const gameFeedUrl = (gameId) => `https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`;
exports.gameFeedUrl = gameFeedUrl;
const gameBoxscoreUrl = (gameId) => `http://statsapi.mlb.com:80/api/v1/game/${gameId}/boxscore`;
exports.gameBoxscoreUrl = gameBoxscoreUrl;
const teamLogosUrl = (teamId) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
exports.teamLogosUrl = teamLogosUrl;
const teamUrl = (teamId) => `https://statsapi.mlb.com/api/v1/teams/${teamId}`;
exports.teamUrl = teamUrl;
const rosterUrl = (teamId) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/depthChart`;
exports.rosterUrl = rosterUrl;
const matchupUrl = (gameId) => `https://bdfed.stitch.mlbinfra.com/bdfed/matchup/${gameId}`;
exports.matchupUrl = matchupUrl;
const promotionalSponsorsUrl = (teamAbvreviation) => `http://mlb.mlb.com/shared/properties/style/${teamAbvreviation}.json`;
exports.promotionalSponsorsUrl = promotionalSponsorsUrl;
const playerUrl = (playerId) => `https://statsapi.mlb.com/api/v1/people/${playerId}`;
exports.playerUrl = playerUrl;
const playerStatsUrl = (playerId) => `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam,team,stats(type=[yearByYear,yearByYearAdvanced,careerRegularSeason,careerAdvanced,availableStats](team(league)),leagueListId=mlb_hist)&site=en`;
exports.playerStatsUrl = playerStatsUrl;
const teamLeadersUrl = (teamId) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/leaders?leaderCategories=wins,saves,earnedRunAverage,strikeouts,walksAndHitsPerInningPitched,battingAverage,runs,homeRuns,runsBattedIn,stolenBases&leaderGameTypes=R&season=2022&hydrate=person,team&limit=1`;
exports.teamLeadersUrl = teamLeadersUrl;
const playerCurrentHeadshotUrl = (playerId, maginification = '1') => `https://content.mlb.com/images/headshots/current/60x60/${playerId}@${maginification}x.png`;
exports.playerCurrentHeadshotUrl = playerCurrentHeadshotUrl;
const teamColorCodesPageUrl = () => `https://teamcolorcodes.com/mlb-color-codes/`;
exports.teamColorCodesPageUrl = teamColorCodesPageUrl;
const recordUrl = (year, date) => {
    let url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason,springTraining,firstHalf,secondHalf&hydrate=division,conference,sport,league,team`;
    if (date) {
        url = `${url}&date=${date}`;
    }
    return url;
};
exports.recordUrl = recordUrl;
const standingsUrl = (year, date, type) => {
    let standingsType = 'regularSeason';
    let standingsView = type;
    if (type === 'playoff') {
        type = 'wildCard';
        standingsView = 'league';
    }
    return `https://bdfed.stitch.mlbinfra.com/bdfed/transform-mlb-standings?&splitPcts=false&numberPcts=false&standingsView=${standingsView}&sortTemplate=3&season=${year}&leagueIds=103&&leagueIds=104&standingsTypes=${standingsType}&contextTeamId=&date=${date}&hydrateAlias=noSchedule`;
};
exports.standingsUrl = standingsUrl;
/**
 * minor league gameday, score, live data
 * https://ws.statsapi.mlb.com/api/v1.1/game/751942/feed/live?language=en
 */
//# sourceMappingURL=urls.js.map