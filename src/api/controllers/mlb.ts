import { Get, Route, Tags, Produces, Path, Query } from 'tsoa';
import axios from 'axios';
import { load } from 'cheerio';

import { LogError } from '../../utils';
import {
  dailyGamesUrl,
  gameBoxscoreUrl,
  gameFeedUrl,
  matchupUrl,
  playerCurrentHeadshotUrl,
  playerUrl,
  rosterUrl,
  teamColorCodesPageUrl,
  teamLeadersUrl,
  teamLogosUrl,
  teamUrl
} from '../urls';
import {
  IError,
  IGameBoxscoreResponse,
  IGameByTeamNameResponse,
  IGameFeedByTeamNameResponse,
  IGameFeedResponse,
  IGamesResponse,
  IPlayerResponse,
  IProbablesResponse,
  IRosterResponse,
  ITeamByTeamNameResponse,
  ITeamLeadersResponse,
  ITeamResponse
} from '../interfaces';

const mlbTransport = axios.create();

@Route('mlb')
@Tags('MLB')
export class MlbController {
  /**
   * Gets a list of all the games for a given day. If any inputs are missing, the date will automatically default to the current date of request.
   * @param {string} month - The numerical month 
   * @param {string} day - The numerical day
   * @param {string} year - The year
   * @returns {IGamesResponse}
   */
  @Get('/games')
  public async getGames(
    @Query() month?: string,
    @Query() day?: string,
    @Query() year?: string
  ): Promise<IGamesResponse | IError> {
    if (!month || !day || !year) {
      const today = new Date();
      month = (today.getMonth() + 1).toString();
      day = today.getDate().toString();
      year = today.getFullYear().toString();
    }
    try {
      const data = await mlbTransport.get(dailyGamesUrl(month, day, year));
      return data.data;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/games`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status
      };
      return error;
    }
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
  @Get('/game/feed')
  public async getFeed(
    @Query() gameId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string,
    @Query() month?: string,
    @Query() day?: string,
    @Query() year?: string
  ): Promise<IGameFeedResponse | IGameFeedByTeamNameResponse[] | IError> {
    try {
      if (gameId) {
        const data = await mlbTransport.get(gameFeedUrl(gameId));
        const extractedData = data.data;
        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!month || !day || !year) {
          const today = new Date();
          month = (today.getMonth() + 1).toString();
          day = today.getDate().toString();
          year = today.getFullYear().toString();
        }
        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(month, day, year))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName } = homeTeam;
          return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
        });

        const gameFeedsPromises = await Promise.all(games.map((g) => mlbTransport.get(gameFeedUrl(g.gamePk.toString()))));

        return gameFeedsPromises.map((gfp) => {
          const { gamePk, metaData, gameData, liveData }: IGameFeedResponse = gfp.data;
          const feedData: IGameFeedByTeamNameResponse = {
            gamePk,
            metaData,
            gameData,
            liveData,
          };

          return feedData;
        });
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/${gameId}/feed`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
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
  @Get('/game/boxscore')
  public async getBoxscore(
    @Query() gameId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string,
    @Query() month?: string,
    @Query() day?: string,
    @Query() year?: string
  ): Promise<IGameBoxscoreResponse | IGameBoxscoreResponse[] | IError> {
    try {
      if (gameId) {
        const data = await mlbTransport.get(gameBoxscoreUrl(gameId));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!month || !day || !year) {
          const today = new Date();
          month = (today.getMonth() + 1).toString();
          day = today.getDate().toString();
          year = today.getFullYear().toString();
        }
        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(month, day, year))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName } = homeTeam;
          return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
        });

        const gameBoxscorePromises = await Promise.all(games.map((g) => mlbTransport.get(gameBoxscoreUrl(g.gamePk.toString()))));

        return gameBoxscorePromises.map((gsp) => gsp.data as IGameBoxscoreResponse);
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/${gameId}/boxscore`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
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
  @Get('/game/probables')
  public async getGameProbables(
    @Query() gameId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string,
    @Query() month?: string,
    @Query() day?: string,
    @Query() year?: string
  ): Promise<IProbablesResponse | IProbablesResponse[] | IError> {
    try {
      if (gameId) {
        const data = await mlbTransport.get(matchupUrl(gameId));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!month || !day || !year) {
          const today = new Date();
          month = (today.getMonth() + 1).toString();
          day = today.getDate().toString();
          year = today.getFullYear().toString();
        }
        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(month, day, year))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName } = homeTeam;
          return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
        });

        const gameBoxscorePromises = await Promise.all(games.map((g) => mlbTransport.get(matchupUrl(g.gamePk.toString()))));

        return gameBoxscorePromises.map((gsp) => gsp.data as IProbablesResponse);
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/${gameId}/probables`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
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
  @Get('/game/{teamLocation}-{teamName}')
  public async getGameForTeam(
    @Path() teamLocation: string,
    @Path() teamName: string,
    @Query() month?: string,
    @Query() day?: string,
    @Query() year?: string
  ): Promise<IGameByTeamNameResponse | IError> {
    if (!month || !day || !year) {
      const today = new Date();
      month = (today.getMonth() + 1).toString();
      day = today.getDate().toString();
      year = today.getFullYear().toString();
    }
    try {
      const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(month, day, year))).data as IGamesResponse;
      if (data.totalGames === 0) {
        const response: IGameByTeamNameResponse = {
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

      const response: IGameByTeamNameResponse = {
        totalGames: games.length,
        totalGamesInProgress: games.filter((g) => g.status.statusCode === "I").length,
        games
      };
      return response;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/${teamLocation.trim().toLowerCase()}-${teamName.trim().toLowerCase()}`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status
      };
      return error;
    }
  }

  /**
   * Gets all teams associated with the MLB (may include Spring Leagues, Minor Leagues, etc.)
   * @returns {(ITeamResponse|IError)}
   */
  @Get('/teams')
  public async getTeamNoId(): Promise<ITeamResponse | IError> {
    try {
      const data = await mlbTransport.get(teamUrl(''));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/teams`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets a team by its team id or team name and team location.
   * @param {string} teamId - The MLB team id
   * @param {string} teamLocation - The team's location
   * @param {string} teamName - The team's name
   * @returns {(ITeamResponse | ITeamByTeamNameResponse | IError)}
   */
  @Get('/team')
  public async getTeam(
    @Query() teamId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string
  ): Promise<ITeamResponse | ITeamByTeamNameResponse | IError> {
    try {
      if (teamId) {
        const data = await mlbTransport.get(teamUrl(teamId));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;

        const foundTeam = teams.teams.find((t) => t.name.toLowerCase() === inputTeam);

        if (!foundTeam) {
          return {
            message: `Could not find team: ${inputTeam}`,
            statusCode: 400,
          };
        } else {
          return {
            team: foundTeam
          };
        }
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/team/${teamId}`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets an SVG of the team logo by team id or team location and team name.
   * @param {string} teamId - The MLB team id
   * @param {string} teamLocation - The team's location
   * @param {string} teamName - The team's name
   * @returns {(HTMLOrSVGElement | IError)}
   */
  @Get('/team/logo')
  @Produces('image/svg')
  public async getTeamLogo(
    @Query() teamId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string,
  ): Promise<HTMLOrSVGElement | IError> {
    try {
      if (!teamId) {
        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;

        const foundTeam = teams.teams.find((t) => t.name.toLowerCase() === inputTeam);

        if (!foundTeam) {
          return {
            message: `Could not find team: ${inputTeam}`,
            statusCode: 400,
          };
        } else {
          teamId = foundTeam.id.toString();
        }
      }
      const data = await mlbTransport.get(teamLogosUrl(teamId));
      return data.data;
    } catch (exception) {
      const { response } = exception;
      const message = 'Failed to retrieve logo';
      LogError(response.status, `/mlb/team/${teamId}/logo`, message);
      const error: IError = {
        message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the team leaders in various offensive and defensive stats via team id or team location and team name
   * @param {string} teamId - The MLB team id
   * @param {string} teamLocation - The team's location
   * @param {string} teamName - The team's name
   * @returns {(ITeamLeadersResponse | IError)}
   */
  @Get('/team/leaders')
  public async getTeamLeaders(
    @Query() teamId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string
  ): Promise<ITeamLeadersResponse | IError> {
    try {
      if (!teamId) {
        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;

        const foundTeam = teams.teams.find((t) => t.name.toLowerCase() === inputTeam);

        if (!foundTeam) {
          return {
            message: `Could not find team: ${inputTeam}`,
            statusCode: 400,
          };
        } else {
          teamId = foundTeam.id.toString();
        }
      }
      const data = await mlbTransport.get(teamLeadersUrl(teamId));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/team/${teamId}/leaders`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the team's roster via team id or team location and team name
   * @param {string} teamId - The MLB team id
   * @param {string} teamLocation - The team's location
   * @param {string} teamName - The team's name
   * @returns {(IRosterResponse | IError)}
   */
  @Get('/team/roster')
  public async getRoster(
    @Query() teamId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string
  ): Promise<IRosterResponse | IError> {
    try {
      if (!teamId) {
        const inputTeam = `${teamLocation.trim().toLowerCase()} ${teamName.trim().toLowerCase()}`;

        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;

        const foundTeam = teams.teams.find((t) => t.name.toLowerCase() === inputTeam);

        if (!foundTeam) {
          return {
            message: `Could not find team: ${inputTeam}`,
            statusCode: 400,
          };
        } else {
          teamId = foundTeam.id.toString();
        }
      }
      const data = await mlbTransport.get(rosterUrl(teamId));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/team/${teamId}/roster`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the team's color palette via team id or team location and team name
   * @param {string} teamId - The MLB team id
   * @param {string} teamLocation - The team's location
   * @param {string} teamName - The team's name
   * @returns {(string[] | IError)}
   */
  @Get('/team/colors')
  public async getTeamColors(
    @Query() teamId?: string,
    @Query() teamLocation?: string,
    @Query() teamName?: string,
  ): Promise<string[] | IError> {
    if (teamId) {
      const data: ITeamResponse = await (await mlbTransport.get(teamUrl(teamId))).data;
      const team = data.teams[0];
      teamLocation = team.locationName;
      teamName = team.teamName;
    }
    const data = await mlbTransport.get(teamColorCodesPageUrl());
    const teamToLookFor = `${teamLocation.toLowerCase().trim()} ${teamName.toLowerCase().trim()}`;

    // cheerio loading the html string
    const $ = load(data.data);

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
      const error: IError = {
        message: `Could not find team: ${teamToLookFor}`,
        statusCode: 400,
      };
      return error;
    };

    // extract the table data with the hex codes and split the common names
    // add the hex code to our array
    const teamColors: string[] = [];
    $(teamColorRow).find('td').each((i, e) => {
      const tdStrings = $(e).text().split('#');
      teamColors.push(`#${tdStrings[tdStrings.length - 1]}`);
    });

    return teamColors.filter((tc) => tc !== '#');
  }

  /**
   * Gets the player via player id
   * @param {string} playerId - The MLB player id
   * @returns {(IPlayerResponse | IError)}
   */
  @Get('/player/{playerId}')
  public async getPlayer(
    @Path() playerId: string,
  ): Promise<IPlayerResponse | IError> {
    try {
      const data = await mlbTransport.get(playerUrl(playerId));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/player/${playerId}`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the player's current headshot via player id
   * @param {string} playerId - The MLB player id
   * @returns {(string | IError)}
   */
  @Get('/player/{playerId}/headshot')
  public async getPlayerHeadshot(
    @Path() playerId: string,
    @Query() magnification?: string,
  ): Promise<string | IError> {
    try {
      await mlbTransport.get(playerUrl(playerId));
      return playerCurrentHeadshotUrl(playerId, magnification);
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `mlb/player/${playerId}/headshot`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }
}
