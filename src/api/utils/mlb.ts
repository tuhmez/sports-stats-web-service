import axios from 'axios';

import { ITeamResponse } from '../interfaces';
import { LogError } from '../../utils';
import { teamUrl } from '../urls';

const mlbTransport = axios.create();

export async function getTeamIdByTeamLocation(location: string, route: string): Promise<string | null> {
  try {
    const data: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
    
    const foundTeam = data.teams.find((t) => t.locationName.toLowerCase() === location.toLowerCase());

    if (foundTeam) {
      return foundTeam.id.toString();
    } else {
      const message = `Could not find team with location: ${location}`;
      LogError(400, route, message);
      return null;
    }
  } catch (exception) {
    const { data, response } = exception;
    LogError(response.status, route, data.message);
    return null;
  }
}

export async function getTeamIdByTeamName(name: string, route: string): Promise<string | null> {
  try {
    const data: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
    
    const foundTeam = data.teams.find((t) => t.teamName.toLowerCase() === name.toLowerCase());

    if (foundTeam) {
      return foundTeam.id.toString();
    } else {
      const message = `Could not find team with name: ${name}`;
      LogError(400, route, message);
      return null;
    }
  } catch (exception) {
    const { data, response } = exception;
    LogError(response.status, route, data.message);
    return null;
  }
}

export async function getTeamIdByFullTeamName(fullName: string, route: string): Promise<string | null> {
  try {
    const data: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
    
    const foundTeam = data.teams.find((t) => t.name.toLowerCase() === fullName.toLowerCase());

    if (foundTeam) {
      return foundTeam.id.toString();
    } else {
      const message = `Could not find team with name: ${fullName}`;
      LogError(400, route, message);
      return null;
    }
  } catch (exception) {
    const { data, response } = exception;
    LogError(response.status, route, data.message);
    return null;
  }
}

export async function getTeamIdByTeamAbbreviation(abbreviation: string, route: string): Promise<string | null> {
  try {
    const data: ITeamResponse = await (await mlbTransport.get(teamUrl(''))).data;
    
    const foundTeam = data.teams.find((t) => t.abbreviation.toLowerCase() === abbreviation.toLowerCase());

    if (foundTeam) {
      return foundTeam.id.toString();
    } else {
      const message = `Could not find team with abbreviation: ${abbreviation}`;
      LogError(400, route, message);
      return null;
    }
  } catch (exception) {
    const { data, response } = exception;
    LogError(response.status, route, data.message);
    return null;
  }
}
