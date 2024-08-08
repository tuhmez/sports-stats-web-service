export const dailyGamesUrl = (date: string) => {
  return `https://statsapi.mlb.com/api/v1/schedule?language=en&sportId=1,11,12,13,14,16&date=${date}&sortBy=gameDate&hydrate=game(content(summary,media(epg))),linescore(runners),flags,team,review`
};
export const gameFeedUrl = (gameId: string) => `https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`;
export const gameBoxscoreUrl = (gameId: string) => `http://statsapi.mlb.com:80/api/v1/game/${gameId}/boxscore`;
export const teamLogosUrl = (teamId: string) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
export const teamUrl = (teamId?: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}`;
export const rosterUrl = (teamId: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/depthChart`;
export const matchupUrl = (gameId: string) => `https://bdfed.stitch.mlbinfra.com/bdfed/matchup/${gameId}`;
export const promotionalSponsorsUrl = (teamAbvreviation: string) => `http://mlb.mlb.com/shared/properties/style/${teamAbvreviation}.json`;
export const playerUrl = (playerId: string) => `https://statsapi.mlb.com/api/v1/people/${playerId}`;
export const playerStatsUrl = (playerId: string) => `https://statsapi.mlb.com/api/v1/people/${playerId}?hydrate=currentTeam,team,stats(type=[yearByYear,yearByYearAdvanced,careerRegularSeason,careerAdvanced,availableStats](team(league)),leagueListId=mlb_hist)&site=en`
export const teamLeadersUrl = (teamId: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/leaders?leaderCategories=wins,saves,earnedRunAverage,strikeouts,walksAndHitsPerInningPitched,battingAverage,runs,homeRuns,runsBattedIn,stolenBases&leaderGameTypes=R&season=2022&hydrate=person,team&limit=1`
export const playerCurrentHeadshotUrl = (playerId: string, maginification: string = '1') => `https://content.mlb.com/images/headshots/current/60x60/${playerId}@${maginification}x.png`;
export const teamColorCodesPageUrl = () => `https://teamcolorcodes.com/mlb-color-codes/`;
export const recordUrl = (year: string, date?: string) => {
  let url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason,springTraining,firstHalf,secondHalf&hydrate=division,conference,sport,league,team`;
  if (date) {
    url = `${url}&date=${date}`;
  }
  return url;
};
export const standingsUrl = (year: string, date: string, type: string) => {
  let standingsType = 'regularSeason';
  let standingsView = type;
  if (type === 'playoff') {
    standingsType = 'wildCard';
    standingsView = 'league';
  }

  return `https://bdfed.stitch.mlbinfra.com/bdfed/transform-mlb-standings?&splitPcts=false&numberPcts=false&standingsView=${standingsView}&sortTemplate=3&season=${year}&leagueIds=103&&leagueIds=104&standingsTypes=${standingsType}&contextTeamId=&date=${date}&hydrateAlias=noSchedule`;
}
export const leagueUrl = (leagueId?: string) => `https://statsapi.mlb.com/api/v1/league/${leagueId}`;
export const sportUrl = (sportId?: string) => `https://statsapi.mlb.com/api/v1/sports/${sportId}`;

/**
 * minor league gameday, score, live data
 * https://ws.statsapi.mlb.com/api/v1.1/game/751942/feed/live?language=en
 */

/**
 * lots of good in-game stats :)
 * https://bdfed.stitch.mlbinfra.com/bdfed/playMetrics/745500?keyMoments=true&scoringPlays=true&homeRuns=true&strikeouts=true&hardHits=true&highLeverage=false&leadChange=true&winProb=true
 */
