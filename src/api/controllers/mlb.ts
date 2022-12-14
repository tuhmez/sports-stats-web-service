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
  playerStatsUrl,
  rosterUrl,
  standingsUrl,
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
  IGameScoreResponse,
  IGamesResponse,
  IPlayerResponse,
  IProbablesResponse,
  IRosterResponse,
  IStandingsResponse,
  ITeamByTeamNameResponse,
  ITeamLeadersResponse,
  ITeamRecord,
  ITeamResponse
} from '../interfaces';
import { getTeamIdByFullTeamName, getTeamIdByTeamAbbreviation, getTeamIdByTeamLocation, getTeamIdByTeamName } from '../utils';
import { validateDate } from '../../utils/date';

const invalidDateError: IError = {
  message: 'Input date is invalid. Valid format is MM/DD/YYYY (e.g. 10/01/2018)',
  statusCode: 400,
}

const mlbTransport = axios.create();

@Route('mlb')
@Tags('MLB')
export class MlbController {
  /**
   * Gets a list of all the games for a given day. If any inputs are missing, the date will automatically default to the current date of request.
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {IGamesResponse}
   */
  @Get('/games')
  public async getGames(
    @Query() date?: string,
  ): Promise<IGamesResponse | IError> {
    if (!date) {
      const today = new Date();
      const month = (today.getMonth() + 1).toString();
      const day = today.getDate().toString();
      const year = today.getFullYear().toString();
      date = `${month}/${day}/${year}`
    } else {
      if (!validateDate(date)) return invalidDateError;
    }

    try {
      const data = await mlbTransport.get(dailyGamesUrl(date));
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
   * @param {string} id - The game ID
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {(IGameFeedResponse|IGameFeedByTeamNameResponse[]|IError)} Returns the feed(s) for found game(s).
   */
  @Get('/game/feed')
  public async getFeed(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
  ): Promise<IGameFeedResponse | IGameFeedByTeamNameResponse[] | IError> {
    try {
      if (id) {
        const data = await mlbTransport.get(gameFeedUrl(id));
        const extractedData = data.data;
        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!date) {
          const today = new Date();
          const month = (today.getMonth() + 1).toString();
          const day = today.getDate().toString();
          const year = today.getFullYear().toString();
          date = `${month}/${day}/${year}`
        } else {
          if (!validateDate(date)) return invalidDateError;
        }

        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
          
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
          } else {
            const error: IError = {
              message: 'Could not find team!',
              statusCode: 400,
            };
            return error;
          }
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
      LogError(response.status, `/mlb/game/feed`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the boxscore for the given game ID or team location and team name, with optional date.
   * @param {string} id - The game ID
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {(IGameBoxscoreResponse|IGameBoxscoreResponse[]|IError)} - The boxscore(s) for the given game(s).
   */
  @Get('/game/boxscore')
  public async getBoxscore(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
  ): Promise<IGameBoxscoreResponse | IGameBoxscoreResponse[] | IError> {
    try {
      if (id) {
        const data = await mlbTransport.get(gameBoxscoreUrl(id));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!date) {
          const today = new Date();
          const month = (today.getMonth() + 1).toString();
          const day = today.getDate().toString();
          const year = today.getFullYear().toString();
          date = `${month}/${day}/${year}`;
        } else {
          if (!validateDate(date)) return invalidDateError;
        }

        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
          
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
          } else {
            const error: IError = {
              message: 'Could not find team!',
              statusCode: 400,
            };
            return error;
          }
        });

        const gameBoxscorePromises = await Promise.all(games.map((g) => mlbTransport.get(gameBoxscoreUrl(g.gamePk.toString()))));

        return gameBoxscorePromises.map((gsp) => gsp.data as IGameBoxscoreResponse);
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/boxscore`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the game probables for the given game ID or team location and team name, with optional date
   * @param {string} id - The game ID
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {(IProbablesResponse|IProbablesResponse[]|IError)} - The probables(s) for the given game(s).
   */
  @Get('/game/probables')
  public async getGameProbables(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
  ): Promise<IProbablesResponse | IProbablesResponse[] | IError> {
    try {
      if (id) {
        const data = await mlbTransport.get(matchupUrl(id));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!date) {
          const today = new Date();
          const month = (today.getMonth() + 1).toString();
          const day = today.getDate().toString();
          const year = today.getFullYear().toString();
          date = `${month}/${day}/${year}`;
        } else {
          if (!validateDate(date)) return invalidDateError;
        }

        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;

          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
          } else {
            const error: IError = {
              message: 'Could not find team!',
              statusCode: 400,
            };
            return error;
          }
        });

        const gameBoxscorePromises = await Promise.all(games.map((g) => mlbTransport.get(matchupUrl(g.gamePk.toString()))));

        return gameBoxscorePromises.map((gsp) => gsp.data as IProbablesResponse);
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/${id}/probables`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the score for a game, without much of the extra stuff as the feed request
   * @param {string} id - The game ID
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {(IProbablesResponse[]|IError)} - The score(s) for the given game(s).
   */
  @Get('/game/score')
  public async getGameScore(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
  ): Promise<IGameScoreResponse[] | IError> {
    try {
      if (id) {
        const data = await mlbTransport.get(gameFeedUrl(id));
        const extractedData = data.data;
        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
      } else {
        if (!date) {
          const today = new Date();
          const month = (today.getMonth() + 1).toString();
          const day = today.getDate().toString();
          const year = today.getFullYear().toString();
          date = `${month}/${day}/${year}`;
        } else {
          if (!validateDate(date)) return invalidDateError;
        }

        const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date))).data as IGamesResponse;
        if (data.totalGames === 0) return [];

        const games = data.dates[0].games.filter((g) => {
          const { away, home } = g.teams;
          const { team: awayTeam } = away;
          const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
          const { team: homeTeam } = home;
          const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;
          
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
          } else {
            const error: IError = {
              message: 'Could not find team!',
              statusCode: 400,
            };
            return error;
          }
        });

        const gameFeedsPromises = await Promise.all(games.map((g) => mlbTransport.get(gameFeedUrl(g.gamePk.toString()))));

        return gameFeedsPromises.map((gfp) => {
          const { gameData, liveData }: IGameFeedResponse = gfp.data;
          const { linescore } = liveData;
          const { datetime, game, status } = gameData;
          const { away, home } = gameData.teams;

          const scoreData: IGameScoreResponse = {
            linescore,
            away,
            home,
            game,
            datetime,
            status,
          };

          return scoreData;
        });
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game/score`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the game for a given team. Will use current day, unless day, month, and year are passed into function
   * @param {string} location - The team's location (lower case), e.g. milwaukee
   * @param {string} name - The team's name (lower case), e.g. brewers
   * @param {string} abbreviation - The team's abbreviation
   * @param {string} date - The date in MM/DD/YYYY format
   * @returns {IGameByTeamNameResponse}
   */
  @Get('/game')
  public async getGameForTeam(
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
  ): Promise<IGameByTeamNameResponse | IError> {
    if (!date) {
      const today = new Date();
      const month = (today.getMonth() + 1).toString();
      const day = today.getDate().toString();
      const year = today.getFullYear().toString();
      date = `${month}/${day}/${year}`;
    } else {
      if (!validateDate(date)) return invalidDateError;
    }

    try {
      const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date))).data as IGamesResponse;
      if (data.totalGames === 0) {
        const response: IGameByTeamNameResponse = {
          totalGames: 0,
          totalGamesInProgress: 0,
          games: []
        };
        return response;
      }

      const games = data.dates[0].games.filter((g) => {
        const { away, home } = g.teams;
        const { team: awayTeam } = away;
        const { name: awayName, abbreviation: awayAbbreviation } = awayTeam;
        const { team: homeTeam } = home;
        const { name: homeName, abbreviation: homeAbbreviation } = homeTeam;

        if (location && name) {
          const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
          return awayName.toLowerCase() === inputTeam || homeName.toLowerCase() === inputTeam;
        } else if (abbreviation) {
          return awayAbbreviation.toLowerCase() === abbreviation.toLowerCase() || homeAbbreviation.toLowerCase() === abbreviation.toLowerCase();
        } else {
          const error: IError = {
            message: 'Could not find team!',
            statusCode: 400,
          };
          return error;
        }      });

      const response: IGameByTeamNameResponse = {
        totalGames: games.length,
        totalGamesInProgress: games.filter((g) => g.status.statusCode === "I").length,
        games
      };
      return response;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/game`, data.message);
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
   * @param {string} id - The MLB team id
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @returns {(ITeamResponse | ITeamByTeamNameResponse | IError)}
   */
  @Get('/team')
  public async getTeam(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<ITeamResponse | ITeamByTeamNameResponse | IError> {
    const route = '/mlb/game/team';
    try {
      if (!id) {
        let asyncFunctionCall: any;
        let input: string;
        let inputType: string;
        if (location && name) {
          asyncFunctionCall = getTeamIdByFullTeamName;
          input = `${location} ${name}`;
          inputType = 'full team name';
        } else if (location && !name) {
          asyncFunctionCall = getTeamIdByTeamLocation;
          input = location;
          inputType = 'team location';
        } else if (!location && name) {
          asyncFunctionCall = getTeamIdByTeamName;
          input = name;
          inputType = 'team name';
        } else if (abbreviation) {
          asyncFunctionCall = getTeamIdByTeamAbbreviation;
          input = abbreviation;
          inputType = 'team abbreviation';
        } else {
          const message = 'Inputs not valid for request';
          LogError(400, route, message);
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        const teamIdResponse: (string | null) = await asyncFunctionCall(input, route);

        if (!teamIdResponse) {
          const message = `Could not find ${input} via ${inputType} method`;
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        id = teamIdResponse;
      }

        const data = await mlbTransport.get(teamUrl(id));
        const extractedData = data.data;

        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, '/mlb/game/team/', data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets an SVG of the team logo by team id or team location and team name.
   * @param {string} id - The MLB team id
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @returns {(HTMLOrSVGElement | IError)}
   */
  @Get('/team/logo')
  @Produces('image/svg')
  public async getTeamLogo(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<HTMLOrSVGElement | IError> {
    const route = '/mlb/game/team/logo';
    try {
      if (!id) {
        let asyncFunctionCall: any;
        let input: string;
        let inputType: string;
        if (location && name) {
          asyncFunctionCall = getTeamIdByFullTeamName;
          input = `${location} ${name}`;
          inputType = 'full team name';
        } else if (location && !name) {
          asyncFunctionCall = getTeamIdByTeamLocation;
          input = location;
          inputType = 'team location';
        } else if (!location && name) {
          asyncFunctionCall = getTeamIdByTeamName;
          input = name;
          inputType = 'team name';
        } else if (abbreviation) {
          asyncFunctionCall = getTeamIdByTeamAbbreviation;
          input = abbreviation;
          inputType = 'team abbreviation';
        } else {
          const message = 'Inputs not valid for request';
          LogError(400, route, message);
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        const teamIdResponse: (string | null) = await asyncFunctionCall(input, route);

        if (!teamIdResponse) {
          const message = `Could not find ${input} via ${inputType} method`;
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        id = teamIdResponse;
      }

      const data = await mlbTransport.get(teamLogosUrl(id));
      return data.data;
    } catch (exception) {
      const message = 'Failed to retrieve logo';
      LogError(400, `/mlb/team/logo`, message);
      const error: IError = {
        message,
        statusCode: 400,
      };
      return error;
    }
  }

  /**
   * Gets the team leaders in various offensive and defensive stats via team id or team location and team name
   * @param {string} id - The MLB team id
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @returns {(ITeamLeadersResponse | IError)}
   */
  @Get('/team/leaders')
  public async getTeamLeaders(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<ITeamLeadersResponse | IError> {
    const route = "/mlb/team/leaders";
    try {
      if (!id) {
        let asyncFunctionCall: any;
        let input: string;
        let inputType: string;
        if (location && name) {
          asyncFunctionCall = getTeamIdByFullTeamName;
          input = `${location} ${name}`;
          inputType = 'full team name';
        } else if (location && !name) {
          asyncFunctionCall = getTeamIdByTeamLocation;
          input = location;
          inputType = 'team location';
        } else if (!location && name) {
          asyncFunctionCall = getTeamIdByTeamName;
          input = name;
          inputType = 'team name';
        } else if (abbreviation) {
          asyncFunctionCall = getTeamIdByTeamAbbreviation;
          input = abbreviation;
          inputType = 'team abbreviation';
        } else {
          const message = 'Inputs not valid for request';
          LogError(400, route, message);
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        const teamIdResponse: (string | null) = await asyncFunctionCall(input, route);

        if (!teamIdResponse) {
          const message = `Could not find ${input} via ${inputType} method`;
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        id = teamIdResponse;
      }

      const data = await mlbTransport.get(teamLeadersUrl(id));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/team/leaders`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the team's roster via team id or team location and team name
   * @param {string} id - The MLB team id
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @returns {(IRosterResponse | IError)}
   */
  @Get('/team/roster')
  public async getRoster(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IRosterResponse | IError> {
    const route = '/mlb/team/roster';
    try {
      if (!id) {
        let asyncFunctionCall: any;
        let input: string;
        let inputType: string;
        if (location && name) {
          asyncFunctionCall = getTeamIdByFullTeamName;
          input = `${location} ${name}`;
          inputType = 'full team name';
        } else if (location && !name) {
          asyncFunctionCall = getTeamIdByTeamLocation;
          input = location;
          inputType = 'team location';
        } else if (!location && name) {
          asyncFunctionCall = getTeamIdByTeamName;
          input = name;
          inputType = 'team name';
        } else if (abbreviation) {
          asyncFunctionCall = getTeamIdByTeamAbbreviation;
          input = abbreviation;
          inputType = 'team abbreviation';
        } else {
          const message = 'Inputs not valid for request';
          LogError(400, route, message);
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        const teamIdResponse: (string | null) = await asyncFunctionCall(input, route);

        if (!teamIdResponse) {
          const message = `Could not find ${input} via ${inputType} method`;
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        id = teamIdResponse;
      }

      const data = await mlbTransport.get(rosterUrl(id));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/team/${id}/roster`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the team's color palette via team id or team location and team name
   * @param {string} id - The MLB team id
   * @param {string} location - The team's location
   * @param {string} name - The team's name
   * @param {string} abbreviation - The team's abbreviation
   * @returns {(string[] | IError)}
   */
  @Get('/team/colors')
  public async getTeamColors(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<string[] | IError> {
    const route = '/mlb/team/colors';
    if (!location && !name) {
      if (!id) {
        let asyncFunctionCall: any;
        let input: string;
        let inputType: string;
        if (location && !name) {
          asyncFunctionCall = getTeamIdByTeamLocation;
          input = location;
          inputType = 'team location';
        } else if (!location && name) {
          asyncFunctionCall = getTeamIdByTeamName;
          input = name;
          inputType = 'team name';
        } else if (abbreviation) {
          asyncFunctionCall = getTeamIdByTeamAbbreviation;
          input = abbreviation;
          inputType = 'team abbreviation';
        } else {
          const message = 'Inputs not valid for request';
          LogError(400, route, message);
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        const teamIdResponse: (string | null) = await asyncFunctionCall(input, route);

        if (!teamIdResponse) {
          const message = `Could not find ${input} via ${inputType} method`;
          const error: IError = {
            message,
            statusCode: 400
          };
          return error;
        }

        id = teamIdResponse;
      }

      const data: ITeamResponse = await (await mlbTransport.get(teamUrl(id))).data;
      const team = data.teams[0];
      location = team.locationName;
      name = team.teamName;
    }
    const data = await mlbTransport.get(teamColorCodesPageUrl());
    const teamToLookFor = `${location.toLowerCase().trim()} ${name.toLowerCase().trim()}`;

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
   * Gets the player's basic information
   * @param {string} id - The MLB player id
   * @param {string} firstName - The player's first name
   * @param {string} lastName - The player's last name
   * @param {string} location - The location of the team
   * @param {string} name - The name of the team
   * @param {string} abbreviation - The abbreviation for the team
   * @returns {(IPlayerResponse | IError)}
   */
  @Get('/player')
  public async getPlayer(
    @Query() id?: string,
    @Query() firstName?: string,
    @Query() lastName?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IPlayerResponse | IError> {
    try {
      if (!id) {
        const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
        
        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
        
        const foundTeam = teams.teams.find((t) => {
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return t.name.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return t.abbreviation.toLowerCase() === abbreviation
          } else {
            return false;
          }
        });

        if (!foundTeam) {
          return {
            message: `Could not find team`,
            statusCode: 400,
          };
        }

        const rosterData: IRosterResponse = await (await mlbTransport.get(rosterUrl(foundTeam.id.toString()))).data;

        const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);

        if (!foundPlayer) {
          return {
            message: `Could not find player: ${inputPlayer}`,
            statusCode: 400,
          };
        } else {
          id = foundPlayer.person.id.toString();
        }
      }

      const data = await mlbTransport.get(playerUrl(id));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/player/${id}`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

    /**
   * Gets the player stats
   * @param {string} id - The MLB player id
   * @param {string} firstName - The player's first name
   * @param {string} lastName - The player's last name
   * @param {string} location - The location of the team
   * @param {string} name - The name of the team
   * @param {string} abbreviation - The abbreviation for the team
   * @returns {(IPlayerResponse | IError)}
   */
  @Get('/player/stats')
  public async getPlayerStats(
    @Query() id?: string,
    @Query() firstName?: string,
    @Query() lastName?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IPlayerResponse | IError> {
    try {
      if (!id) {
        const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;
        
        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
        
        const foundTeam = teams.teams.find((t) => {
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return t.name.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return t.abbreviation.toLowerCase() === abbreviation
          } else {
            return false;
          }
        });

        if (!foundTeam) {
          return {
            message: `Could not find team`,
            statusCode: 400,
          };
        }

        const rosterData: IRosterResponse = await (await mlbTransport.get(rosterUrl(foundTeam.id.toString()))).data;

        const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);

        if (!foundPlayer) {
          return {
            message: `Could not find player: ${inputPlayer}`,
            statusCode: 400,
          };
        } else {
          id = foundPlayer.person.id.toString();
        }
      }

      const data = await mlbTransport.get(playerStatsUrl(id));
      const extractedData = data.data;

      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/player/${id}`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
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
  @Get('/player/headshot')
  public async getPlayerHeadshot(
    @Query() id: string,
    @Query() magnification?: string,
    @Query() firstName?: string,
    @Query() lastName?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<string | IError> {
    try {
      if (!id) {
        const inputPlayer = `${firstName.trim().toLowerCase()} ${lastName.trim().toLowerCase()}`;

        const teams: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;

        const foundTeam = teams.teams.find((t) => {
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return t.name.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return t.abbreviation.toLowerCase() === abbreviation
          } else {
            return false;
          }
        });

        if (!foundTeam) {
          return {
            message: `Could not find team`,
            statusCode: 400,
          };
        }

        const rosterData: IRosterResponse = await (await mlbTransport.get(rosterUrl(foundTeam.id.toString()))).data;

        const foundPlayer = rosterData.roster.find((r) => r.person.fullName.toLowerCase() === inputPlayer);

        if (!foundPlayer) {
          return {
            message: `Could not find player: ${inputPlayer}`,
            statusCode: 400,
          };
        } else {
          id = foundPlayer.person.id.toString();
        }
      }

      return playerCurrentHeadshotUrl(id, magnification);
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `mlb/player/${id}/headshot`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status,
      };
      return error;
    }
  }

  /**
   * Gets the current standings for the MLB
   * @param {string} year - The year requested for standings
   * @param {string} date - The date in MM/DD/YYYY format
   * @param {string} location - The MLB team location
   * @param {string} name - The MLB team name
   * @param {string} abbreviation - The MLB team's abbreviation
   * @returns {(IStandingsResponse | IError)}
   */
  @Get('/standings')
  public async getStandings(
    @Query() year?: string,
    @Query() date?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IStandingsResponse | ITeamRecord | IError> {
    try {
      if (!year && !date) {
        const today = new Date();
        const month = (today.getMonth() + 1).toString();
        const day = today.getDate().toString();
        year = today.getFullYear().toString();
        date = `${month}/${day}/${year}`;
      } else if (!year && date) {
        if (!validateDate(date)) return invalidDateError;
        year = date.split('/')[2];
      } else if (year && date) {
        if (!validateDate(date)) return invalidDateError;
        if (year !== date.split('/')[2]) {
          return {
            message: 'The input year and input date\'s year must match',
            statusCode: 400,
          } as IError;
        }
      }

      const standings: IStandingsResponse = await(await mlbTransport.get(standingsUrl(year, date))).data

      if (!location && !name && !abbreviation) return standings;

      const teamRecords = standings.records.find((r) => {
        return r.teamRecords.find((tr) => {
          const { team } = tr;
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return team.name.toLowerCase() === inputTeam;
          } else if (abbreviation) {
            return team.abbreviation.toLowerCase() === abbreviation.toLowerCase();
          } else {
            return false;
          }
        })
      });

      if (teamRecords) {
        const actualTeamRecord = teamRecords.teamRecords.find((tr) => {
          const { team } = tr;
          if (location && name) {
            const inputTeam = `${location.trim().toLowerCase()} ${name.trim().toLowerCase()}`;
            return team.name.toLowerCase() === inputTeam;
          } else {
            return team.abbreviation.toLowerCase() === abbreviation.toLowerCase();
          }
        });

        return actualTeamRecord;
      } else {
        const inputTeam = location && name ? `${location.toLowerCase()} ${name.toLowerCase()}` : abbreviation.toLowerCase();
        const error: IError = {
          message: `Could not find team: ${inputTeam}`,
          statusCode: 400
        }
        return error;
      }
    } catch (exception) {
      const { data, response } = exception;
      LogError(response.status, `/mlb/standings`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status
      };
      return error;
    }
  }
}
