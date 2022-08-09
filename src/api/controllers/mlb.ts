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
  IGameFeedResponse,
  IGamesResponse,
  IPlayerResponse,
  IProbablesResponse,
  IRosterResponse,
  ITeamLeadersResponse,
  ITeamResponse
} from '../interfaces';

const mlbTransport = axios.create();

@Route('mlb')
@Tags('MLB')
export class MlbController {
  /**
   * Gets a list of all the games for a given day. If any inputs are missing, the date will automatically default to the current date of request.
   * @param month 
   * @param day 
   * @param year 
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
   * Gets the game feed for the given game id.
   * @param gameId 
   * @returns {IGameFeedResponse}
   */
  @Get('/game/{gameId}/feed')
  public async getFeed(
    @Path() gameId: string
  ): Promise<IGameFeedResponse | IError> {
    try {
      const data = await mlbTransport.get(gameFeedUrl(gameId));
      const extractedData = data.data;
      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
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
   * Gets the boxscore for the given game id.
   * @param gameId 
   * @returns {IGameBoxscoreResponse}
   */
  @Get('/game/{gameId}/boxscore')
  public async getBoxscore(
    @Path() gameId: string
  ): Promise<IGameBoxscoreResponse | IError> {
    try {
      const data = await mlbTransport.get(gameBoxscoreUrl(gameId));
      const extractedData = data.data;
      
      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
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

  
  @Get('/game/{gameId}/probables')
  public async getGameProbables(
    @Path() gameId: string,
  ): Promise<IProbablesResponse | IError> {
    try {
      const data = await mlbTransport.get(matchupUrl(gameId));
      const extractedData = data.data;
      
      return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
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

  @Get('/team/{teamId}')
  public async getTeam(
    @Path() teamId: string,
    ): Promise<ITeamResponse | IError> {
      try {
        const data = await mlbTransport.get(teamUrl(teamId || ''));
        const extractedData = data.data;
      
        return extractedData.messageNumber === 11 ? extractedData.message : extractedData;
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
     * Gets an SVG of the team logo.
     * @param teamId 
     * @returns 
     */
    @Get('/team/{teamId}/logo')
    @Produces('image/svg')
    public async getTeamLogo(
      @Path() teamId: string,
    ): Promise<HTMLOrSVGElement | IError> {
      try {
        const data = await mlbTransport.get(teamLogosUrl(teamId));
        console.log(data.data);
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
    @Get('/team/{teamId}/leaders')
    public async getTeamLeaders(
      @Path() teamId: string,
    ): Promise<ITeamLeadersResponse | IError> {
      try {
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

  @Get('/team/{teamId}/roster')
  public async getRoster(
    @Path() teamId: string,
  ): Promise<IRosterResponse | IError> {
    try {
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

  @Get('/team/colors/{teamLocation}-{teamName}')
  public async getTeamColors(
    @Path() teamLocation: string,
    @Path() teamName: string,
  ): Promise<string[] | IError> {
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
}
