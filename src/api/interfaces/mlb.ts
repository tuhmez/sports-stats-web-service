export interface IGamesResponse {
  copyright: string;
  dates: IGameDate[];
  totalEvents: number;
  totalGames: number;
  totalGamesInProgress: number;
  totalItems: number;
}

export interface IGameByTeamNameResponse {
  games: IGame[];
  totalGames: number;
  totalGamesInProgress: number;
}

export interface IGameFeedResponse {
  copyright: string;
  gameData: IGameData;
  gamePk: number;
  liveData: IGameLiveData;
  metaData: IGameMetadata;
}

export interface IGameFeedByTeamNameResponse {
  gameData: IGameData;
  gamePk: number;
  liveData: IGameLiveData;
  metaData: IGameMetadata;
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
  link: string;
  roster: ITeamPlayer[];
  rosterType: string;
  teamId: number;
}

export interface IProbablesResponse {
  away: IProbablePlayers[];
  home: IProbablePlayers[];
  probables: IProbables;
}

export interface IPlayerResponse {
  copyright: string;
  people: IPlayer[];
}

export interface ITeamLeadersResponse {
  copyright: string;
  teamLeaders: ITeamLeaderCategory[];
}

export interface IRecordsResponse {
  copyright: string;
  records: IRecord[];
}

export interface IGameScoreResponse {
  linescore: ILinescore;
  away: ITeam;
  home: ITeam;
  game: IGameDataGame;
  datetime: IGameDatetime;
  status: IGameStatus;
}

export interface IStandingsResponse {
  clinchIcons: string[];
  "common-version": number;
  lastUpdated: string;
  records: IStandingsRecord[];
  structure: {
    sports: IStandingsStructure[];
  };
  tiedGames: any;
  version: number;
}

export interface ILeagueResponse {
  copyright: string,
  leagues: ILeague[];
}

export interface ISportResponse {
  copyright: string;
  sports: ISport[];
}

export interface IDivisionResponse {
  copyright: string;
  divisions: IDivision[];
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
  county: string;
  defaultCoordinates: {
    latitude: number;
    longitude: number;
  }
  phone: string;
  postalCode: string;
  state: string;
  stateAbbrev: string;
}

export interface ITimezone {
  id: string;
  offset: number;
  tz: string;
}

export interface IFieldInfo {
  capacity: number;
  center?: number;
  left?: number;
  leftCenter?: number;
  leftLine?: number;
  right?: number;
  rightCenter?: number;
  rightLine?: number;
  roofType: string;
  turfType: string;
}

export interface IGameStatus {
  abstractGameCode: string;
  abstractGameState: string;
  codedGameState: string;
  detailedState: string;
  statusCode: string;
  startTimeTBD: boolean;
}

export interface ITeamShortRecord {
  wins: number;
  losses: number;
  ties?: number;
  pct: string;
}

export interface ITeamRecord {
  clinched: boolean;
  conferenceGamesBack: string;
  divisionChamp: boolean;
  divisionGamesBack: string;
  divisionLeader: boolean;
  divisionRank: string;
  eliminationNumber: string;
  gamesBack: string;
  gamesPlayed: number;
  hasWildcard: boolean;
  lastUpdated: string;
  leagueGamesBack: string;
  leagueRank: string;
  leagueRecord: ITeamShortRecord;
  losses: number;
  magicNumber: string;
  records: IExpandedRecords;
  runDifferential: number;
  runsAllowed: number;
  runsScored: number;
  season: string;
  sportGamesBack: string;
  sportRank: string;
  springLeagueGamesBack: string;
  streak: IStreak;
  team: ITeam;
  wildCardEliminationNumber: string;
  wildCardGamesBack: string;
  winningPercentage: string;
  wins: number;
}

export interface ITeam {
  abbreviation: string;
  active: boolean;
  allStartStatus: string;
  clubName: string;
  division: IDivisionId;
  fileCode: string;
  firstYearOfPlay: string;
  franchiseName: string;
  id: number;
  league: ILeagueId;
  link: string;
  locationName: string;
  name: string;
  nextGameSchedule?: IGamesResponse;
  previousGameSchedule?: IGamesResponse;
  season: number;
  shortName: string;
  sport: ISportId;
  springLeague?: ILeagueId;
  springVenue: IVenueId;
  teamCode: string;
  teamName: string;
  record?: ITeamRecord;
  venue: IVenueId;
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

export interface IPlayerSplitStats {
  airOuts: number;
  atBats: number;
  atBatsPerHomeRun: string;
  avg: string;
  babip: string;
  balks: number;
  baseOnBalls: number;
  battersFaced: number;
  blownSaves: number;
  catchersInterference: number;
  caughtStealing: number;
  completeGames: number;
  doubles: number;
  earnedRuns: number;
  era: number;
  gamesFinished: number;
  gamesPitched: number;
  gamesPlayed: number;
  gamesStarted: number;
  groundOuts: number;
  groundIntoDoublePlay: number;
  groundOutsToAirouts: string;
  hitBatsmen: number;
  hitByPitch: number;
  hits: number;
  hitsPer9Inn: string;
  holds: number;
  homeRuns: number;
  homeRunsPer9: string;
  inheritedRunners: number;
  inheritedRunnersScored: number;
  inningsPitched: string;
  intentionalWalks: number;
  leftOnBase: number;
  losses: number;
  numberOfPitches: number;
  obp: string;
  ops: string;
  outs: number;
  pickoffs: number;
  pitchesPerInning: string;
  plateAppearances: number;
  rbi: number;
  runs: number;
  runsScoredPer9: string;
  sacBunts: number;
  sacFlies: number;
  saveOpportunities: number;
  saves: number;
  shutouts: number;
  slg: string;
  stolenBasePercentage: string;
  stolenBases: number;
  strikeOuts: number;
  strikePercentage: string;
  strikeoutWalkRatio: string;
  strikeoutsPer9Inn: string;
  strikes: number;
  totalBases: number;
  triples: number;
  walksPer9Inn: string;
  whip: string;
  wildPitches: number;
  winPercentage: string;
  wins: number;
}

export interface IPlayerSplit {
  gameType: string;
  league: ILeagueId;
  player: IPlayerId;
  season: string;
  sport: ISportId;
  stat: IPlayerSplitStats;
  team: ITeam;
}

export interface IPlayerExtendedStats {
  exemption: any[];
  group: {
    displayName: string;
  };
  splits: IPlayerSplit[];
  type: {
    displayName: string;
  };
}

export interface IPlayer extends IPlayerId {
  active: boolean;
  batSide: ICode;
  birthCity: string;
  birthCountry: string;
  birthDate: string;
  birthStateProvince: string;
  boxscoreName: string;
  currentAge: number;
  currentTeam: ITeam;
  firstLastName: string;
  firstName: string;
  fullFMLName: string;
  fullLFMName: string;
  fullName: string;
  gender: string;
  height: string;
  id: number;
  initLastName: string;
  isPlayer: boolean;
  isVerified: boolean;
  lastFirstName: string;
  lastInitName: string;
  lastName: string;
  link: string;
  mlbDebutDate: string;
  nameFirstLast: string;
  nameMatrilineal: string;
  nameSlug: string;
  nickName: string;
  pitchHand: ICode;
  primaryNumber: string;
  primaryPosition: IPlayerPosition;
  stats: IPlayerExtendedStats;
  strikeZoneBottom: number;
  strikeZoneTop: number;
  useName: string;
  weight: number;
  middleName: string;
  draftYear: number;
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

export interface IRecordDivision {
  abbreviation: string;
  active: boolean;
  hasWildCard: boolean;
  id: number;
  league: ILeagueId;
  link: string;
  name: string;
  nameShort: string;
  numPlayoffTeams: number;
  season: string;
  sortOrder: number;
  sport: ISportId;
}

export interface ISeasonDateInfo {
  allStarDate: string;
  firstDate2ndHalf: string;
  gameLevelGamedayType: string;
  lastDate1stHalf: string;
  offseasonEndDate: string;
  offseasonStartDate: string;
  postSeasonEndDate: string;
  postSeasonStartDate: string;
  preSeasonEndDate: string;
  preSeasonStartDate: string;
  qualifierOutsPitched: number;
  qualifierPlateAppearances: number;
  regularSeasonEndDate: string;
  regularSeasonStartDate: string;
  seasonEndDate: string;
  seasonId: string;
  seasonLevelGamedayType: string;
  seasonStartDate: string;
  springEndDate: string;
  springStartDate: string;
}

export interface IRecordLeague {
  abbreviation: string;
  active: boolean;
  conferencesInUse: boolean;
  divisionsInUse: boolean;
  hasPlayoffPoints: boolean;
  hasSplitSeason: boolean;
  hasWildCard: boolean;
  id: number;
  link: string;
  name: string;
  nameShort: string;
  numGames: number;
  numWildcardTeams: number;
  orgCode: string;
  seasonDateInfo: ISeasonDateInfo;
  seasonState: string;
  sortOrder: number;
  sport: ISportId;
}

export interface IRecordSport {
  abbreviation: string;
  activeStatus: boolean;
  code: string;
  id: number;
  link: string;
  name: string;
  sortOrder: number;
}

export interface IRecord {
  division: IRecordDivision;
  lastUpdated: string;
  league: IRecordLeague;
  standingsType: string;
  sport: IRecordSport;
  teamRecords: ITeamRecord[];
}

export interface IStreak {
  streakCode: string;
  streakNumber: number;
  streakType: string;
}

export interface IExpandedRecords {
  divisionRecords: IExpandedDivisionRecord[];
  expectedRecords: IExpandedExpectedRecord[];
  leagueRecords: IExpandedLeagueRecord[];
  overallRecords: IExpandedOverallRecord[];
  splitRecords: IExpandedSplitRecord[];
}

export interface IExpandedDivisionRecord {
  division: IDivisionId;
  losses: number;
  pct: string;
  wins: number;
}

export interface IExpandedExpectedRecord {
  losses: number;
  pct: string;
  type: string;
  wins: number;
}

export interface IExpandedLeagueRecord {
  league: ILeagueId;
  losses: number;
  pct: string;
  wins: number;
}

export interface IExpandedOverallRecord {
  losses: number;
  pct: string;
  type: string;
  wins: number;
}

export interface IExpandedSplitRecord {
  losses: number;
  pct: string;
  type: string;
  wins: number;
}

export interface IStandingsStructure {
  abbreviation: string;
  activeStatus: boolean;
  code: string;
  id: number;
  leagues: IStandingsLeague[];
  link: string;
  name: string;
  sortIndex1: number;
  sortIndex2: number;
  sortIndex3: number;
  sortOrder: number;
  standingsUtils: IStandingsUtils;
}

export interface IStandingsLeague {
  abbreviation: string;
  active: boolean;
  conferencesInUse: boolean;
  divisions?: IStandingsDivision[];
  divisionsInUse: boolean;
  hasPlayoffPoints: boolean;
  hasSplitSeason: boolean;
  hasWildCard: boolean;
  id: number;
  link: string;
  name: string;
  nameShort: string;
  numGames: number;
  numTeams: number;
  numWildcardTeams: number;
  orgCode: string;
  season: string;
  seasonDateInfo: ISeasonDateInfo;
  seasonState: string;
  sortIndex1: number;
  sortIndex2: number;
  sortindex3: number;
  sortOrder: number;
  sport: ISportId;
  standingsUtils: IStandingsUtils;
}

export interface IStandingsDivision {
  abbreviation: string;
  active: boolean;
  hasWildcard: boolean;
  id: number;
  league: ILeagueId;
  link: string;
  name: string;
  nameShort: string;
  numPlayoffTeams: number;
  season: string;
  sortIndex1: number;
  sortIndex2: number;
  sortIndex3: number;
  sport: ISportId;
  standingsUtils: IStandingsUtils;
}

export interface IStandingsUtils {
  hasContextItem: boolean;
  hasFavorites: boolean;
  hasFollowed: boolean;
  hasMostFavorite: boolean;
}

export interface IStandingsRecord {
  clinchIcons: string[];
  division: number;
  lastUpdated: string;
  standingsType: string;
  teamRecords: IStandingsTeamRecord[];
}

export interface IStandingsTeamRecord {
  abbreviation: string;
  clinchIndicator: string;
  clinched: boolean;
  conferenceGamesBack: string;
  conferenceRank: number;
  division: number;
  divisionChamp: boolean;
  divisionGamesBack: string;
  divisionLeader: boolean;
  divisionRank: number;
  eliminationNumber: string;
  id: string;
  isContextTeam: boolean;
  isFavorite: boolean;
  isFollowed: boolean;
  league: number;
  leagueGamesBack: string;
  leagueRank: number;
  losses: number;
  name: string;
  pct: string;
  record_away: string;
  record_day: string;
  record_division: string;
  record_extraInning: string;
  record_grass: string;
  record_home: string;
  record_interLeague: string;
  record_lastTen: string;
  record_league_103: string;
  record_league_104: string;
  record_left: string;
  record_leftAway: string;
  record_leftHome: string;
  record_night: string;
  record_oneRun: string;
  record_right: string;
  record_rightAway: string;
  record_rightHome: string;
  record_turf: string;
  record_vsDivisionCentral: string;
  record_vsDivisionEast: string;
  record_vsDivisionWest: string;
  record_winnners: string;
  record_xWinLoss: string;
  record_xWinLossSeason: string;
  runDifferential: number;
  runsAllowed: number;
  runsScored: number;
  shortName: string;
  sortStreak: number;
  sport: number;
  sportGamesBack: string;
  sportRank: number;
  streak: string;
  team: ITeam;
  viewGamesBack: string;
  viewRank: number;
  wildCardEliminationNumber: string;
  wildCardGamesBack: string;
  wildCardLeader: boolean;
  wildCardRank: number;
  wins: number;
}

export interface ILeague {
  abbreviation: string;
  active: boolean;
  conferencesInUse: boolean;
  divisionsInUse: boolean;
  hasPlayoffPoints: boolean;
  hasWildCard: boolean;
  id: number;
  link: string;
  name: string;
  nameShort: string;
  numGames: number;
  numTeams: number;
  numWildcardTeams: number;
  orgCode: string;
  season: string;
  seasonDateInfo: ISeasonDateInfo;
  seasonState: string;
  sortOrder: number;
  sport: ISportId;
}

export interface ISport {
  abbreviation: string;
  activeStatus: boolean;
  code: string;
  id: number;
  link: string;
  name: string;
  sortOrder: number;
}

export interface IDivision {
  abbreviation: string;
  active: boolean;
  hasWildcard: boolean;
  id: number;
  league: ILeagueId;
  link: string;
  name: string;
  nameShort: string;
  season: string;
  sortOrder: number;
  sport: ISportId;
}
