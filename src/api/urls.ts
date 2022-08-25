export const dailyGamesUrl = (month: string, day: string, year: string) => {
  const date = `${month}/${day}/${year}`;
  return `https://statsapi.mlb.com/api/v1/schedule?language=en&sportId=1&date=${date}&sortBy=gameDate&hydrate=game(content(summary,media(epg))),linescore(runners),flags,team,review`
};
export const gameFeedUrl = (gameId: string) => `https://statsapi.mlb.com/api/v1.1/game/${gameId}/feed/live`;
export const gameBoxscoreUrl = (gameId: string) => `http://statsapi.mlb.com:80/api/v1/game/${gameId}/boxscore`;
export const teamLogosUrl = (teamId: string) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
export const teamUrl = (teamId?: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}`;
export const rosterUrl = (teamId: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/roster/depthChart`;
export const matchupUrl = (gameId: string) => `https://bdfed.stitch.mlbinfra.com/bdfed/matchup/${gameId}`;
export const promotionalSponsorsUrl = (teamAbvreviation: string) => `http://mlb.mlb.com/shared/properties/style/${teamAbvreviation}.json`;
export const playerUrl = (playerId: string) => `https://statsapi.mlb.com/api/v1/people/${playerId}`;
export const teamLeadersUrl = (teamId: string) => `https://statsapi.mlb.com/api/v1/teams/${teamId}/leaders?leaderCategories=wins,saves,earnedRunAverage,strikeouts,walksAndHitsPerInningPitched,battingAverage,runs,homeRuns,runsBattedIn,stolenBases&leaderGameTypes=R&season=2022&hydrate=person,team&limit=1`
export const playerCurrentHeadshotUrl = (playerId: string, maginification: string = '1') => `https://content.mlb.com/images/headshots/current/60x60/${playerId}@${maginification}x.png`;
export const teamColorCodesPageUrl = () => `https://teamcolorcodes.com/mlb-color-codes/`;
export const standingsUrl = (year: string, month?: string, day?: string) => {
  let url = `https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&season=${year}&standingsTypes=regularSeason,springTraining,firstHalf,secondHalf&hydrate=division,conference,sport,league,team`;
  if (month && day) {
    const date = `${year}-${month}-${day}`;
    url = `${url}&date=${date}`;
  }
  return url;
};
