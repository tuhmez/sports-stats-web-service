import { Get, Route, Tags, Produces, Query, Hidden } from 'tsoa';
import axios from 'axios';
import { load } from 'cheerio';
import sharp from 'sharp';
import Color from 'color';

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
  recordUrl,
  teamColorCodesPageUrl,
  teamLeadersUrl,
  teamLogosUrl,
  teamUrl,
  standingsUrl,
  leagueUrl,
  sportUrl,
  divisionUrl
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
  IRecordsResponse,
  ITeamByTeamNameResponse,
  ITeamLeadersResponse,
  ITeamRecord,
  ITeamResponse,
  IStandingsResponse,
  ILeagueResponse,
  ISportResponse,
  IDivision,
  IDivisionResponse
} from '../interfaces';
import { getTeamIdByFullTeamName, getTeamIdByTeamAbbreviation, getTeamIdByTeamLocation, getTeamIdByTeamName } from '../utils';
import { validateDate } from '../../utils/date';
import { getAlternateTeamSrc, logos } from '../../data';

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
    @Query() sport?: string,
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
      const data: IGamesResponse = await (await mlbTransport.get(dailyGamesUrl(date, sport))).data as IGamesResponse;

      return data;
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
   * @param {string} format - Optional format input, accepts SVG and PNG; if not provided, SVG will be provided
   * @returns {(HTMLOrSVGElement | Buffer | IError)}
   */
  @Get('/team/logo')
  @Produces('image/*')
  public async getTeamLogo(
    @Query() id?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() format?: string,
    @Query() output?: 'Element' | 'Buffer',
    @Query() url?: string,
    @Query() urlHasId?: boolean,
    @Query() useAltSrc?: boolean,
  ): Promise<HTMLOrSVGElement | Buffer | IError> {
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

      let urlToUse: string = teamLogosUrl(id);

      if (url) {
        if (urlHasId) {
          urlToUse = url;
        } else {
          urlToUse = `${url}/${id}.svg`;
        }
      } else if (useAltSrc) {
        const { exists, includesId, src } = getAlternateTeamSrc({ id });

        if (exists) {
          if (includesId) {
            urlToUse = src;
          } else {
            urlToUse = `${src}/${id}.svg`;
          }
        }
      }

      const response = await mlbTransport.get(urlToUse);

      let image = response.data;

      if (format) {
        if (format.toLowerCase() === "png") {
          try {
            image = await sharp(Buffer.from(image)).png().toBuffer();
          } catch (ex) {
            const message = "Image conversion from SVG to PNG failed";
            const error: IError = {
              message,
              statusCode: 500
            };
            return error;
          }
        } else {
          if (output) {
            if (output === 'Buffer') {
              return Buffer.from(image);
            } else {
              return image;
            }
          }
        }
      }

      return image;
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
    @Query() useAltColor?: string,
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
      location = team.franchiseName;
      name = team.clubName;
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
      const teamRow = $(e).find('th').text().toLowerCase().trim();
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
      teamColors.push(`#${tdStrings[tdStrings.length - 1]}`.trim());
    });
    
    const teamColorsResult = teamColors.filter((tc) => tc !== '#');

    if (useAltColor) {
      if (logos.useSecondaryColorId.includes(id)) {
        const secondaryColor = teamColorsResult.splice(1, 1);

        teamColorsResult.splice(0, 0, secondaryColor[0]);
      } else if (logos.useTertiaryColorId.includes(id)) {
        const tertiaryColor = teamColorsResult.splice(2, 1);

        teamColorsResult.splice(0, 0, tertiaryColor[0]);
      }
    }

    return teamColorsResult;
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
   * Gets the current record for an MLB team
   * @param {string} year - The year requested for record
   * @param {string} date - The date in MM/DD/YYYY format
   * @param {string} location - The MLB team location
   * @param {string} name - The MLB team name
   * @param {string} abbreviation - The MLB team's abbreviation
   * @returns {(IRecordsResponse | IError)}
   */
  @Get('/record')
  public async getRecord(
    @Query() year?: string,
    @Query() date?: string,
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IRecordsResponse | ITeamRecord | IError> {
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

      const record: IRecordsResponse = await(await mlbTransport.get(recordUrl(year, date))).data

      if (!location && !name && !abbreviation) return record;

      const teamRecords = record.records.find((r) => {
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
      LogError(response.status, `/mlb/record`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status
      };
      return error;
    }
  }

  @Get('/game/matchup/graphic')
  @Produces('image/png')
  public async getMatchupGraphic(
    @Query() location?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
    @Query() date?: string,
    @Query() display?: string
  ): Promise<Buffer | IError> {
    const gameResponse = await this.getGameForTeam(location, name, abbreviation, date);

      // @ts-ignore
      if (gameResponse.message) {
        return gameResponse as IError;
      }

      if ((gameResponse as IGameByTeamNameResponse).games.length === 0) {
        return {
          message: `No games found`,
          statusCode: 200
        } as IError;
      }

      const { teams } = (gameResponse as IGameByTeamNameResponse).games[0];

      let homeTeam = '';
      let homeTeamProperty = '';

      if (location) {
        homeTeam = teams.home.team.locationName.toLowerCase();
        homeTeamProperty = 'location';
      } else if (name) {
        homeTeam = teams.home.team.name.toLowerCase();
        homeTeamProperty = 'name';
      } else {
        homeTeam = teams.home.team.abbreviation.toLowerCase();
        homeTeamProperty = 'abbreviation';
      }

      const isHomeTeamDesiredTeam =
        homeTeamProperty === 'location' ? homeTeam === location.toLowerCase() :
        homeTeamProperty === 'name' ? homeTeam === name.toLowerCase() :
        homeTeam === abbreviation.toLowerCase();

      const desiredTeam = isHomeTeamDesiredTeam ? teams.home : teams.away;
      const againstTeam = isHomeTeamDesiredTeam ? teams.away : teams.home;

      const desiredTeamId = desiredTeam.team.id.toString();
      const againstTeamId = againstTeam.team.id.toString();
      const desiredTeamAbbreviation = desiredTeam.team.abbreviation.toLowerCase();
      const againstTeamAbbreviation = againstTeam.team.abbreviation.toLowerCase();

      let desiredTeamColorResponse = await this.getTeamColors(desiredTeamId);
      let againstTeamColorResponse = await this.getTeamColors(againstTeamId);

      if (!Array.isArray(desiredTeamColorResponse)) {
        desiredTeamColorResponse = ['#FFFFFF'];
      }
      if (!Array.isArray(againstTeamColorResponse)) {
        againstTeamColorResponse = ['#FFFFFF'];
      }
      
      let desiredColor = Color(desiredTeamColorResponse[0]);
      let againstColor = Color(againstTeamColorResponse[0]);

      const useSecondaryColorDesired = logos.useSecondaryColor.includes(desiredTeamAbbreviation);
      const useSecondaryColorAgainst = logos.useSecondaryColor.includes(againstTeamAbbreviation);
      const useTertiaryColorDesired = logos.useTertiaryColor.includes(desiredTeamAbbreviation);
      const useTertiaryColorAgainst = logos.useTertiaryColor.includes(againstTeamAbbreviation);
      const useTeamCapOnDarkDesired = logos.useTeamCapOnDark.includes(desiredTeamAbbreviation);
      const useTeamCapOnDarkAgainst = logos.useTeamCapOnDark.includes(againstTeamAbbreviation);
      const useOtherUrlDesired = logos.useOtherUrl.includes(desiredTeamAbbreviation);
      const useOtherUrlAgainst = logos.useOtherUrl.includes(againstTeamAbbreviation);

      let desiredTeamLogo: Buffer;
      let againstTeamLogo: Buffer;

      if (useTeamCapOnDarkDesired) {
        desiredTeamLogo = await this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer', logos.urlTeamCapOnDark, false) as Buffer;
      } else if (useOtherUrlDesired) {
        desiredTeamLogo = await this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer', logos.otherUrls[desiredTeamAbbreviation], true) as Buffer;
      } else {
        desiredTeamLogo = await this.getTeamLogo(desiredTeamId, null, null, null, null, 'Buffer') as Buffer;
      }

      if (useTeamCapOnDarkAgainst) {
        againstTeamLogo = await this.getTeamLogo(againstTeamId, null, null, null, null, 'Buffer', logos.urlTeamCapOnDark, false) as Buffer;
      } else if (useOtherUrlAgainst) {
        againstTeamLogo = await this.getTeamLogo(againstTeamId, null, null, null, null, 'Buffer', logos.otherUrls[againstTeamAbbreviation], true) as Buffer;
      } else {
        againstTeamLogo = await this.getTeamLogo(againstTeam.team.id.toString(), null, null, null, null, 'Buffer') as Buffer;
      }

      if (useSecondaryColorDesired) {
        desiredColor = Color(desiredTeamColorResponse[1]);
      } else if (useTertiaryColorDesired) {
        desiredColor = Color(desiredTeamColorResponse[2]);
      }

      if (useSecondaryColorAgainst) {
        againstColor = Color(againstTeamColorResponse[1]);
      } else if (useTertiaryColorAgainst) {
        againstColor = Color(againstTeamColorResponse[2]);
      }

      const svgHeightAndWidth = 400;
      const translateFactor = (Math.SQRT2 / 2) * -1;

      const background = `
        <svg width="${svgHeightAndWidth}" height="${svgHeightAndWidth}" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="home-away-gradient" gradientTransform="translate(1, ${translateFactor}) rotate(45)">
              <stop stop-color='${(isHomeTeamDesiredTeam ? againstColor.hex() : desiredColor.hex())}' offset="0%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? againstColor.hex() : desiredColor.hex())}' offset="50%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? desiredColor.hex() : againstColor.hex())}' offset="50%" />
              <stop stop-color='${(isHomeTeamDesiredTeam ? desiredColor.hex() : againstColor.hex())}' offset="100%" />
            </linearGradient>
          </defs>
          <style>
            #matchup-background {
              fill: url(#home-away-gradient)
            }
          </style>
          <rect id="matchup-background" width="400" height="400" />
        </svg>
    `;

    // console.log(desiredTeamLogo.viewportElement);
    const desiredGraphic = sharp(Buffer.from(desiredTeamLogo)).resize(150, 150, { fit: 'inside' });
    const againstGraphic = sharp(Buffer.from(againstTeamLogo)).resize(150, 150, { fit: 'inside' });
    const centerOfTriangle = Math.floor((svgHeightAndWidth / 2) / 3);

    const graphic = sharp(Buffer.from(background))
    .composite([
      {
        input: await desiredGraphic.toBuffer(),
        top: isHomeTeamDesiredTeam ? centerOfTriangle + 150 : centerOfTriangle - 25,
        left: isHomeTeamDesiredTeam ? centerOfTriangle + 150 : centerOfTriangle - 25
      },
      {
        input: await againstGraphic.toBuffer(),
        top: isHomeTeamDesiredTeam ? centerOfTriangle - 25 : centerOfTriangle + 150,
        left: isHomeTeamDesiredTeam ? centerOfTriangle - 25 : centerOfTriangle + 150
      }
    ]);

    return await graphic.png().toBuffer();
  }

/**
   * Gets the current standings for an MLB division, league, sport. can also include playoffs
   * @param {string} year - The year requested for record
   * @param {string} date - The date in MM/DD/YYYY format
   * @param {string} location - The MLB team location
   * @param {string} name - The MLB team name
   * @param {string} abbreviation - The MLB team's abbreviation
   * @returns {(IRecordsResponse | IError)}
   */
  @Get('/standings')
  public async getStandings(
    @Query() date?: string,
    @Query() type?: string,
    @Query() specificType?: string
  ): Promise<IStandingsResponse | IError> {
    try {
      let year = null;

      if (!date) {
        const today = new Date();
        const month = (today.getMonth() + 1).toString();
        const day = today.getDate().toString();
        year = today.getFullYear().toString();
        date = `${month}/${day}/${year}`;
      } else {
        year = new Date(date).getFullYear().toString()
      }

      let standings: IStandingsResponse = await(await mlbTransport.get(standingsUrl(year, date, type))).data;

      if (specificType) {
        let idToFind = -1;
        let leagueIndex = -1;
        let propertyToUse = 'division';

        switch(specificType) {
          case 'al':
            propertyToUse = 'league';
            idToFind = standings.structure.sports[0].leagues.find(l => l.abbreviation.toLowerCase() === 'al').id;
            break;
          case 'nl':
            propertyToUse = 'league';
            idToFind = standings.structure.sports[0].leagues.find(l => l.abbreviation.toLowerCase() === 'nl').id;
            break;
          case 'alc':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'alc').id;
            break;
          case 'ale':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'ale').id;
            break;
          case 'alw':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'al');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'alw').id;
            break;
          case 'nlc':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nlc').id;
            break;
          case 'nle':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nle').id;
            break;
          case 'nlw':
            leagueIndex = standings.structure.sports[0].leagues.findIndex(l => l.abbreviation.toLowerCase() === 'nl');
            idToFind = standings.structure.sports[0].leagues[leagueIndex].divisions.find(d => d.abbreviation.toLowerCase() === 'nlw').id;
            break;
          default:
            break;
        }

        //@ts-ignore
        const actualRecords = standings.records.filter(r => r[propertyToUse] === idToFind);
        // console.log(idToFind);
        standings.records = actualRecords;
      }

      return standings;
    } catch (exception) {
      console.log(exception)
      const { data, response } = exception;
      LogError(response.status, `/mlb/standings`, data.message);
      const error: IError = {
        message: data.message,
        statusCode: response.status
      };
      return error;
    }
  }

  /**
   * Gets a league
   * @param id - The league's ID
   * @param name - The league's name
   * @param abbreviation - The league's abbreviation
   * @returns {(ILeagueResponse | IError)}
   */
  @Get('/leagues')
  public async getLeague(
    @Query() id?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<ILeagueResponse | IError> {
    if (id && !id.includes(",")) {
      return await (await mlbTransport.get(leagueUrl(id))).data;
    } else {
      const leagues: ILeagueResponse = await (await mlbTransport.get(leagueUrl(''))).data;

      if (id && id.includes(",")) {
        leagues.leagues = leagues.leagues.filter((l) => {
          const idArr = id.split(",").map((id) => parseInt(id));
          return idArr.indexOf(l.id) !== -1;
        });
      } else if (name) {
        leagues.leagues = leagues.leagues.filter((l) => {
          if (name.includes(",")) {
            const nameArr = name.split(",").map((n) => n.toLowerCase());
            return nameArr.indexOf(l.name.toLowerCase()) !== -1;
          } else {
            return l.name.toLowerCase() === name.toLowerCase();
          }
        });
      } else if (abbreviation) {
        leagues.leagues = leagues.leagues.filter((l) => {
          if (abbreviation.includes(",")) {
            const abbrevArr = abbreviation.split(",").map((a) => a.toLowerCase());
            return abbrevArr.indexOf(l.abbreviation.toLowerCase()) !== -1;
          } else {
            return l.abbreviation.toLowerCase() === abbreviation.toLowerCase();
          }
        });
      }

      return leagues;
    }
  }

  /**
   * Gets a sport
   * @param id  - The sport's ID
   * @param name - The sport's name
   * @param abbreviation - The sport's abbreviation
   */
  @Get('/sports')
  public async getSport(
    @Query() id?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<ISportResponse | IError> {
    if (id && !id.includes(",")) {
      return await (await mlbTransport.get(sportUrl(id))).data;
    } else {
      const sports: ISportResponse = await (await mlbTransport.get(sportUrl(''))).data;

      if (id && id.includes(",")) {
        sports.sports = sports.sports.filter((s) => {
          const idArr = id.split(",").map((id) => parseInt(id));
          return idArr.indexOf(s.id) !== -1;
        });
      } else if (name) {
        sports.sports = sports.sports.filter((s) => {
          if (name.includes(",")) {
            const nameArr = name.split(",").map((n) => n.toLowerCase());
            return nameArr.indexOf(s.name.toLowerCase()) !== -1;
          } else {
            return s.name.toLowerCase() === name.toLowerCase();
          }
        });
      } else if (abbreviation) {
        sports.sports = sports.sports.filter((s) => {
          if (abbreviation.includes(",")) {
            const abbrevArr = abbreviation.split(",").map((a) => a.toLowerCase());
            return abbrevArr.indexOf(s.abbreviation.toLowerCase()) !== -1;
          } else {
            return s.abbreviation.toLowerCase() === abbreviation.toLowerCase();
          }
        });
      }

      return sports;
    }
  }

  @Get("/divisions")
  public async getDivision(
    @Query() id?: string,
    @Query() name?: string,
    @Query() abbreviation?: string,
  ): Promise<IDivisionResponse | IError> {
    if (id && !id.includes(",")) {
      return await (await mlbTransport.get(divisionUrl(id))).data;
    } else {
      const divisions: IDivisionResponse = await (await mlbTransport.get(divisionUrl(''))).data;

      if (id && id.includes(",")) {
        divisions.divisions = divisions.divisions.filter((d) => {
          const idArr = id.split(",").map((id) => parseInt(id));
          return idArr.indexOf(d.id) !== -1;
        });
      } else if (name) {
        divisions.divisions = divisions.divisions.filter((d) => {
          if (name.includes(",")) {
            const nameArr = name.split(",").map((n) => n.toLowerCase());
            return nameArr.indexOf(d.name.toLowerCase()) !== -1;
          } else {
            return d.name.toLowerCase() === name.toLowerCase();
          }
        });
      } else if (abbreviation) {
        divisions.divisions = divisions.divisions.filter((d) => {
          if (abbreviation.includes(",")) {
            const abbrevArr = abbreviation.split(",").map((a) => a.toLowerCase());
            return abbrevArr.indexOf(d.abbreviation.toLowerCase()) !== -1;
          } else {
            return d.abbreviation.toLowerCase() === abbreviation.toLowerCase();
          }
        });
      }

      return divisions;
    }
  }
}
