export interface IGamesResponse {
  copyright: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  dates: IGameDate[];
}

export interface IGameByTeamNameResponse {
  totalGames: number;
  totalGamesInProgress: number;
  games: IGame[];
}

export interface IGameFeedResponse {
  copyright: string;
  gamePk: number;
  metaData: IGameMetadata;
  gameData: IGameData;
  liveData: IGameLiveData;
}

export interface IGameFeedByTeamNameResponse {
  gamePk: number;
  metaData: IGameMetadata;
  gameData: IGameData;
  liveData: IGameLiveData;
}

export interface IGameBoxscoreResponse extends IBoxscore {};

export interface ITeamResponse {
  copyright: string;
  teams: ITeam[];
}

export interface ITeamByTeamNameResponse {
  team: ITeam;
}

export interface IRosterResponse {
  copyright: string;
  roster: ITeamPlayer[];
  link: string;
  teamId: number;
  rosterType: string;
}

export interface IProbablesResponse {
  probables: IProbables;
  home: IProbablePlayers[];
  away: IProbablePlayers[];
}

export interface IPlayerResponse {
  copyright: string;
  people: IPlayer[];
}

export interface ITeamLeadersResponse {
  copyright: string;
  teamLeaders: ITeamLeaderCategory[];
}

export enum GameType {
  // All-star
  A = 'A',
  // LDS
  D = 'D',
  // Wildcard
  F = 'F',
  // LCS
  L = 'L',
  // Regular
  R = 'R',
  // Spring training
  S = 'S',
  // World series
  W = 'W'
}

export interface ILocation {
  address1: string;
  city: string;
  state: string;
  stateAbbrev: string;
  postalCode: string;
  defaultCoordinates: {
    latitude: number;
    longitude: number;
  }
  county: string;
  phone: string;
}

export interface ITimezone {
  id: string;
  offset: number;
  tz: string;
}

export interface IFieldInfo {
  capacity: number;
  turfType: string;
  roofType: string;
  leftLine?: number;
  left?: number;
  leftCenter?: number;
  center?: number;
  rightCenter?: number;
  right?: number;
  rightLine?: number;
}

export interface IGameStatus {
  abstractGameState: string;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
  abstractGameCode: string;
}

export interface ITeamShortRecord {
  wins: number;
  losses: number;
  ties?: number;
  pct: string;
}

export interface ITeamRecord {
  gamesPlayed: number;
  wildCardGamesBack: string;
  leagueGamesBack: string;
  springLeagueGamesBack: string;
  sportGamesBack: string;
  divisionGamesBack: string;
  conferenceGamesBack: string;
  leagueRecord: ITeamShortRecord;
  records: any;
  divisionLeader: boolean;
  wins: number;
  losses: number;
  winningPercentage: string;
}

export interface ITeam {
  allStartStatus: string;
  id: number;
  name: string;
  link: string;
  season: number;
  venue: IVenueId;
  springVenue: IVenueId;
  teamCode: string;
  fileCode: string;
  abbreviation: string;
  teamName: string;
  locationName: string;
  firstYearOfPlay: string;
  league: ILeagueId;
  division: IDivisionId;
  sport: ISportId;
  shortName: string;
  franchiseName: string;
  clubName: string;
  active: boolean;
  record?: ITeamRecord;
  springLeague?: ILeagueId;
}

export interface IGameTeam {
  leagueRecord: ITeamShortRecord;
  score: number;
  team: ITeam;
  isWinner: boolean;
  splitSquad: boolean;
  seriesNumber: number;
  springLeague: ILeagueId;
}

export interface IInningTeamLineScore {
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

export interface IInning {
  num: number;
  ordinalNum: string;
  away: IInningTeamLineScore;
  home: IInningTeamLineScore;
}

export interface ISportId {
  id: number;
  name: string;
  link: string;
}

export interface ILeagueId {
  id: number;
  name: string;
  link: string;
  abbreviation: string;
}

export interface IDivisionId {
  id: number;
  name: string;
  link: string;
}

export interface IPlayerId {
  id: number;
  link: string;
  fullName?: string;
}

export interface IPlayerPosition {
  code: string;
  name: string;
  type: string;
  abbreviation: string;
}

export interface ICode {
  code: string;
  description: string;
}

export interface IDescription {
  id: string;
  description: string;
}

export interface IPlayer extends IPlayerId {
  firstName: string;
  lastName: string;
  primaryNumber: string;
  birthDate: string;
  currentAge: number;
  birthCity: string;
  birthStateProvince: string;
  birthCountry: string;
  height: string;
  weight: number;
  active: boolean;
  primaryPosition: IPlayerPosition;
  useName: string;
  middleName: string;
  boxscoreName: string;
  nickName: string;
  gender: string;
  isPlayer: boolean;
  isVerified: boolean;
  draftYear: number;
  mlbDebutDate: string;
  batSide: ICode;
  pitchHand: ICode;
  nameFirstLast: string;
  nameSlug: string;
  firstLastName: string;
  lastFirstName: string;
  lastInitName: string;
  initLastName: string;
  fullFMLName: string;
  fullLFMName: string;
  strikeZoneTop: number;
  strikeZoneBottom: number;
  pronunciation?: string;
}

export interface ITeamId {
  id: number;
  name: string;
  link: string;
}

export interface IVenueId {
  id: number;
  link: string;
  name?: string;
}

export interface IVenue extends IVenueId {
  location: ILocation;
  timeZone: ITimezone;
  fieldInfo: IFieldInfo;
  active: boolean;
}

export interface IDefense {
  pitcher: IPlayerId;
  catcher: IPlayerId;
  first: IPlayerId;
  second: IPlayerId;
  third: IPlayerId;
  shortstop: IPlayerId;
  left: IPlayerId;
  center: IPlayerId;
  right: IPlayerId;
  batter: IPlayerId;
  onDeck: IPlayerId;
  inHole: IPlayerId;
  battingOrder: number;
  team: ITeamId;
}

export interface IOffense {
  batter: IPlayerId;
  onDeck: IPlayerId;
  inHole: IPlayerId;
  pitcher: IPlayerId;
  batingOrder: number;
  team: ITeamId;
}

export interface ILinescore {
  currentInning: number;
  currentInningOrdinal: string;
  inningState: string;
  inningHalf: string;
  isTopInning: boolean;
  innings: IInning[];
  teams: {
    away: IInningTeamLineScore;
    home: IInningTeamLineScore;
  };
  defense: IDefense;
  offense: IOffense;
  balls: number;
  strikes: number;
  outs: number;
}

export interface IEpgMlbTvItem {
  id: number;
  contentId: string;
  mediaId: string;
  mediaState: string;
  mediaFeedType: string;
  mediaFeedSubType: string;
  callLetters: string;
  foxAuthRequired: boolean;
  tbsAuthRequired: boolean;
  espnAuthRequired: boolean;
  fs1AuthRequired: boolean;
  mlbnAuthRequired: boolean;
  freeGame: boolean;
  gameDate: string;
}

export interface IEpgMlbTvAudioItem {
  id: number;
  type: string;
  mediaFeedType: string;
  description: string;
  renditionName: string;
  language: string;
}

export interface IEpgAudioItem {
  id: number;
  contentId: string;
  mediaId: string;
  mediaState: string;
  type: string;
  mediaFeedSubType: string;
  callLetters: string;
  language: string;
}

export interface IEpgKeyword {
  type: string;
  value: string;
  displayName: string;
}

export interface IMediaCut {
  aspectRatio: string;
  width: number;
  height: number;
  src: string;
  at2x: string;
  at3x: string;
}

export interface IImage {
  title: string;
  altText?: any;
  templateUrl: string;
  cuts: IMediaCut[];
}

export interface IPlayback {
  name: string;
  url: string;
  width: string;
  height: string;
}

export interface IEpgAlternateItem {
  type: string;
  state: string;
  date: string;
  id: string;
  headling: string;
  seoTitle: string;
  slug: string;
  blurb: string;
  keywordsAll: IEpgKeyword[];
  keywordsDisplay: IEpgKeyword[];
  image: IImage;
  noIndex: boolean;
  mediaPlaybackId: string;
  title: string;
  description: string;
  duration: string;
  mediaPlaybackUrl: string;
  playbacks: IPlayback[];
}

export interface IEpg {
  title: string;
  items: (IEpgMlbTvItem | IEpgMlbTvAudioItem | IEpgAudioItem | IEpgAlternateItem)[];
}

export interface IMediaContent {
  epg: IEpg[];
  epgAlternate: IEpg[];
  freeGame: boolean;
  enhancedGame: boolean;
}

export interface IContentSummary {
  hasPreviewArticle: boolean;
  hasRecapArticle: boolean;
  hasWrapArticle: boolean;
  hasHighlightsVideo: boolean;
}

export interface IContent {
  link: string;
  editorial: any;
  media: IMediaContent;
  highlights: any;
  summary: IContentSummary;
  gameNotes: any;
}

export interface IReview {
  hasChallenges: boolean;
  away: {
    used: number;
    remaining: number;
  };
  home: {
    used: number;
    remaining: number;
  };
}

export interface IGameFlags {
  noHitter: boolean;
  perfectGame: boolean;
  awayTeamNoHitter: boolean;
  awayTeamPerfectGame: boolean;
  homeTeamNoHitter: boolean;
  homeTeamPerfectGame: boolean;
}

export interface IGame {
  gamePk: number;
  link: string;
  gameType: GameType;
  season: string;
  gameDate: string;
  officialDate: string;
  status: IGameStatus;
  teams: {
    away: IGameTeam;
    home: IGameTeam;
  };
  linescore: ILinescore;
  venue: IVenueId;
  content: IContent;
  isTie: boolean;
  gameNumber: number;
  publicFacing: boolean;
  doubleHeader: string;
  gamedayType: string;
  tiebreaker: string;
  calendarEventID: string;
  seasonDisplay: string;
  dayNight: string;
  scheduledInnings: number;
  reverseHomeAwayState: boolean;
  inningBreakLength: number;
  gamesInSeries: number;
  seriesGameNumber: number;
  seriesDescription: string;
  review: IReview;
  flags: IGameFlags;
  recordSource: string;
  ifNecessary: string;
  ifNecessaryDescription: string;
}

export interface IGameDate {
  date: string;
  totalItems: number;
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  games: IGame[];
  events: any[];
}

export interface IGameMetadata {
  wait: number;
  timeStamp: string;
  gameEvents: string[];
  logicalEvents: string[];
}

export interface IGameDataGame {
  pk: number;
  type: GameType;
  doubleHeader: string;
  id: string;
  gamedayType: string;
  tiebreaker: string;
  gameNumber: number;
  calendarEventID: string;
  season: string;
  seasonDisplay: string;
}

export interface IGameDatetime {
  dateTime: string;
  originalDate: string;
  officialDate: string;
  dayNight: string;
  time: string;
  ampm: string;
}

export interface IProbablePitchers {
  away: IPlayerId;
  home: IPlayerId;
}

export interface IGameWeather {
  condition: string;
  temp: string;
  wind: string;
}

export interface IGameInfo {
  firstPitch: string;
  attendance?: number;
  gameDurationMinutes?: number;
}

export interface IGameData {
  game: IGameDataGame;
  datetime: IGameDatetime;
  status: IGameStatus;
  teams: {
    away: ITeam;
    home: ITeam;
  };
  players: {
    [key: string]: IPlayer;
  };
  venue: IVenue;
  officialVenue: IVenueId;
  weather: IGameWeather;
  gameInfo: IGameInfo;
  review: IReview;
  flags: IGameFlags;
  alerts: any[];
  probablePitchers: IProbablePitchers;
  officialScorer?: IPlayerId;
  primaryDatacaster?: IPlayerId;
}

export interface IGameLeaders {
  hitDistance: any;
  hitSpeed: any;
  pitchSpeed: any;
}

export interface IPlayResult {
  type: string;
  event: string;
  eventType: string;
  description: string;
  rbi: number;
  awayScore: number;
  homeScore: number;
}

export interface IPlayAbout {
  atBatIndex: number;
  halfInning: string;
  isTopInning: boolean;
  inning: number;
  startTime: string;
  endTime: string;
  isComplete: boolean;
  isScoringPlay: boolean;
  hasReview: boolean;
  hasOut: boolean;
  captivatingIndex: number;
}

export interface IPlayCount {
  balls: number;
  strikes: number;
  outs: number;
}

export interface IPlaySplits {
  batter: string;
  pitcher: string;
  menOnBase: string;
}

export interface IBatterPitcherZone {
  zone: string;
  color: string;
  temp: string;
  value: string;
}

export interface IBatterHotColdZoneStat {
  type: {
    displayName: string;
  };
  group: {
    displayName: string;
  };
  exemptions: any[];
  splits: { stat: { name: string; zones: IBatterPitcherZone[] } }[]
}

export interface IPlayMatchup {
  batter: IPlayerId;
  batSide: ICode;
  pitcher: IPlayerId;
  pitchHand: ICode;
  batterHotColdZones: IBatterPitcherZone[];
  pitcherHotColdZones: IBatterPitcherZone[];
  splits: IPlaySplits;
  batterHotColdZoneStats?: {
    stats: IBatterHotColdZoneStat[];
  }
}

export interface IRunnerMovement {
  originBase: string | null;
  start: string | null;
  end: string | null;
  outBase: string;
  isOut: boolean;
  outNumber: number;
}

export interface IRunnerDetails {
  event: string;
  eventType: string;
  movementReason: string | null;
  runner: IPlayerId;
  responsiblePitcher: IPlayerId | null;
  isScoringEvent: boolean;
  rbi: boolean;
  earned: boolean;
  teamUnearned: boolean;
  playIndex: number;
}

export interface IRunnerCredit {
  player: IPlayerId;
  position: IPlayerPosition;
  credit: string;
}

export interface IPlayRunners {
  movement: IRunnerMovement;
  details: IRunnerDetails;
  credits: IRunnerCredit[];
}

export interface IGamePlayEventsDetails {
  description: string;
  event: string;
  eventType: string;
  awayScore: number;
  homeScore: number;
  isScoringPlay: boolean;
  hasReview: boolean;
}

export interface IGameCurrentPlayEventsDetails {
  call: ICode;
  description: string;
  code: string;
  ballColor: string;
  trailColor: string;
  isInPlay: boolean;
  isStrike: boolean;
  isBall: boolean;
  type: ICode;
  hasReview: boolean;
}

export interface IPitchCoordinates {
  aY: number;
  aZ: number;
  pfxX: number;
  pfxZ: number;
  pX: number;
  pZ: number;
  vX0: number;
  vY0: number;
  vZ0: number;
  x: number;
  y: number;
  x0: number;
  y0: number;
  z0: number;
  aX: number;
}

export interface IPitchBreaks {
  breakAngle: number;
  breakLength: number;
  breakY: number;
  spinRate: number;
  spinDirection: number;
}

export interface IPitchData {
  startSpeed: number;
  endSpeed: number;
  strikeZoneTop: number;
  strikeZoneBottom: number;
  coordinates: IPitchCoordinates;
  breaks: IPitchBreaks;
  zone: number;
  typeConfidence: number;
  plateTime: number;
  extension: number;
}

export interface IGamePlayEvents {
  detail: IGamePlayEventsDetails | IGameCurrentPlayEventsDetails;
  count: IPlayCount;
  index: number;
  startTime: string;
  endTime: string;
  isPitch: boolean;
  type: string;
  player?: IPlayerId;
  pitchData?: IPitchData;
  playId?: string;
  pitchNumber?: number;
}

export interface IGamePlay {
  result: IPlayResult;
  about: IPlayAbout;
  count: IPlayCount;
  matchup: IPlayMatchup;
  pitchIndex: number[];
  actionIndex: number[];
  runnerIndex: number[];
  runners: IPlayRunners[];
  playEvents: IGamePlayEvents[];
  playEndTime: string;
  atBatIndex: number;
}

export interface ITeamHit {
  team: {
    springLeague: ILeagueId;
    allStarStatus: string;
    id: number;
    name: string;
    link: string;
  };
  inning: number;
  pitcher: IPlayerId;
  batter: IPlayerId;
  coordinates: {
    x: number;
    y: number;
  };
  type: string;
  description: string;
}

export interface IPlaysByInning {
  startIndex: number;
  endIndex: number;
  top: number[];
  bottom: number[];
  hits: {
    away: ITeamHit[];
    home: ITeamHit[];
  }
}

export interface IGamePlays {
  allPlays: IGamePlay[];
  currentPlay: IGamePlay;
  scoringPlays: number[];
  playsByInning: IPlaysByInning[];
}

export interface IFieldListEntry {
  label: string;
  value: string;
}

export interface IBoxscoreInfo {
  title: string;
  fieldList: IFieldListEntry[];
}

export interface ITeamBattingStats {
  flyOuts: number;
  groundOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  avg: string;
  atBats: number;
  obp: string;
  slg: string;
  ops: string;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  groundIntoDoublePlay: number;
  groundIntoTriplePlay: number;
  plateAppearances: number;
  totalBases: number;
  rbi: number;
  leftOnBase: number;
  sacBunts: number;
  sacFlies: number;
  catchersInterference: number;
  pickoffs: number;
  atBatsPerHomeRun: string;
}

export interface ITeamPitchingStats {
  groundOuts: number;
  airOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  atBats: number;
  obp: string;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  numberOfPitches: number;
  era: string;
  inningsPitched: string;
  saveOpportunities: number;
  earnedRuns: number;
  whip: string;
  battersFaced: number;
  outs: number;
  completeGames: number;
  shutouts: number;
  pitchesThrown: number;
  balls: number;
  strikes: number;
  strikePercentage: string;
  hitBatsmen: number;
  balks: number;
  wildPitches: number;
  pickoffs: number;
  groundOutsToAirouts: string;
  rbi: number;
  pitchesPerInning: string;
  runsScoredPer9: string;
  homeRunsPer9: string;
  inheritedRunners: number;
  inheritedRunnersScored: number;
  catchersInterference: number;
  sacBunts: number;
  sacFlies: number;
  passedBall: number;
}

export interface ITeamFieldingStats {
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  assists: number;
  putOuts: number;
  errors: number;
  chances: number;
  passedBall: number;
  pickoffs: number;
}

export interface ITeamStats {
  batting: ITeamBattingStats;
  pitching: ITeamPitchingStats;
  fielding: ITeamFieldingStats;
}

export interface IPlayerBattingStats {
  gamesPlayed: number;
  flyOuts: number;
  groundOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  atBats: number;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  groundIntoDoublePlay: number;
  groundIntoTriplePlay: number;
  plateAppearances: number;
  totalBases: number;
  rbi: number;
  leftOnBase: number;
  sacBunts: number;
  sacFlies: number;
  catchersInterference: number;
  pickoffs: number;
  atBatsPerHomeRun: string;
  avg?: string;
  obp?: string;
  slg?: string;
  ops?: string;
  babip?: string;
}

export interface IPlayerPitchingStats {
  gamesPlayed: number;
  gamesStarted: number;
  groundOuts: number;
  airOuts: number;
  runs: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  strikeOuts: number;
  baseOnBalls: number;
  intentionalWalks: number;
  hits: number;
  hitByPitch: number;
  atBats: number;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  numberOfPitches: number;
  inningsPitched: string;
  wins: number;
  losses: number;
  saves: number;
  saveOpportunities: number;
  holds: number;
  blownSaves: number;
  earnedRuns: number;
  battersFaced: number;
  outs: number;
  gamesPitched: number;
  completeGames: number;
  shutouts: number;
  balls: number;
  strikes: number;
  strikePercentage: string;
  hitBatsmen: number;
  balks: number;
  wildPitches: number;
  pickoffs: number;
  rbi: number;
  gamesFinished: number;
  runsScoredPer9: string;
  homeRunsPer9: string;
  inheritedRunners: number;
  inheritedRunnersScored: number;
  catchersInterference: number;
  sacBunts: number;
  sacFlies: number;
  passedBall: number;
  obp?: string;
  era?: string;
  whip?: string;
  pitchesThrown?: number;
  groundOutsToAirouts: string;
  winPercentage: string;
  pitchesPerInning: string;
  strikeoutWalkRatio: string;
  strikeoutsPer9Inn: string;
  walksPer9Inn: string;
  hitsPer9Inn: string;
}

export interface IPlayerFieldingStats {
  gamesStarted: number;
  caughtStealing: number;
  stolenBases: number;
  stolenBasePercentage: string;
  assists: number;
  putOuts: number;
  errors: number;
  chances: number;
  fielding: string;
  passedBall: number;
  pickoffs: number;
}

export interface IPlayerStats {
  batting: IPlayerBattingStats;
  pitching: IPlayerPitchingStats;
  fielding: IPlayerFieldingStats;
}

export interface IPlayerGameStatus {
  isCurrentBatter: boolean;
  isCurrentPitcher: boolean;
  isOnBench: boolean;
  isSubstitute: boolean;
}

export interface ITeamPlayer {
  person: IPlayerId;
  jerseyNumber: string;
  position: IPlayerPosition;
  status: ICode;
  parentTeamId: number;
  battingOrder: string;
  stats: IPlayerStats;
  seasonStats: IPlayerStats;
  gameStatus: IPlayerGameStatus;
  allPositions: IPlayerPosition[];
}

export interface IBoxscoreTeam {
  team: {
    springLeague: ILeagueId;
    allStarStatus: string;
    id: number;
    name: string;
    link: string;
  };
  teamStats: ITeamStats;
  players: {
    [key: string]: ITeamPlayer;
  };
  batters: number[];
  pitchers: number[];
  bench: number[];
  bullpen: number[];
  battingOrder: number[];
  info: IBoxscoreInfo[];
  note: IFieldListEntry[];
}

export interface IOfficial {
  official: IPlayerId;
  officialType: string;
}

export interface IGameInfoLabels {
  label: string;
  value?: string;
}

export interface IBoxscore {
  teams: {
    away: IBoxscoreTeam;
    home: IBoxscoreTeam;
  };
  officials: IOfficial[];
  info: IGameInfoLabels[];
  pitchingNotes: any[];
}

export interface IGameDecisions {
  winner?: IPlayerId;
  loser?: IPlayerId;
  save?: IPlayerId;
}

export interface IGameLiveData {
  plays: IGamePlays;
  linescore: ILinescore;
  boxscore: IBoxscore;
  leaders: IGameLeaders;
  decisions?: IGameDecisions;
}

export interface IProbables {
  gameType: string;
  season: string;
  homeLeague: number;
  gameDate: string;
  homeId: number;
  awayId: number;
  homeAbbreviation: string;
  awayAbbreviation: string;
  homeProbable: number;
  awayProbable: number;
  homeProbableLastName: string;
  awayProbableLastName: string;
}

export interface IProbablePlayerStats {
  homeRuns: number;
  avg: string;
  atBats: number;
  rbi: number;
}

export interface IProbablePlayers {
  id: number;
  boxscoreName: string;
  primaryPosition: string;
  stats?: IProbablePlayerStats;
}

export interface ITeamLeader {
  rank: number;
  value: string;
  team: ITeam;
  league: ILeagueId;
  sport: ISportId;
  season: string;
}

export interface ITeamLeaderCategory {
  leaderCategory: string;
  season: string;
  gameType: IDescription;
  leaders: ITeamLeader[],
  statGroup: string;
  team: ITeamId;
  totalSplits: number;
}

