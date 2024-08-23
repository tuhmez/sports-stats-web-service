interface ILogo {
  useSecondaryColor: string[];
  useSecondaryColorId: string[];
  useTertiaryColor: string[];
  useTertiaryColorId: string[];
  useTeamCapOnDark: string[];
  useTeamCapOnDarkId: string[];
  urlTeamCapOnDark: string;
  useOtherUrl: string[];
  useOtherUrlId: string[];
  otherUrls: any;
}

export const logos: ILogo = {
  useSecondaryColor: ['bal', 'sf'],
  useSecondaryColorId: ['110', '137'],
  useTertiaryColor: ['nyy'],
  useTertiaryColorId: ['147'],
  useTeamCapOnDark: ['nyy', 'tb', 'det', 'stl', 'wsh', 'col', 'lad', 'sd', 'cin', 'kc', 'tex'],
  useTeamCapOnDarkId: ['113', '115', '116', '118', '119', '120', '135', '138', '139', '140', '147'],
  urlTeamCapOnDark: 'https://www.mlbstatic.com/team-logos/team-cap-on-dark',
  useOtherUrl: ['min', 'oak'],
  useOtherUrlId: ['133', '142'],
  otherUrls: {
    min: 'https://images.ctfassets.net/iiozhi00a8lc/t142_header_primaryMN_TC_19_blue_svg/c0f95eb9469a7d98b24498395d4f4dc9/MIN23_Dark_Active.svg',
    '142': 'https://images.ctfassets.net/iiozhi00a8lc/t142_header_primaryMN_TC_19_blue_svg/c0f95eb9469a7d98b24498395d4f4dc9/MIN23_Dark_Active.svg',
    tex: 'https://images.ctfassets.net/iiozhi00a8lc/6HSwMP9twv0hrrHVF4Nyo0/0f0063a3fb5f029ac4dadd420b1f1142/140.svg',
    '140': 'https://images.ctfassets.net/iiozhi00a8lc/6HSwMP9twv0hrrHVF4Nyo0/0f0063a3fb5f029ac4dadd420b1f1142/140.svg',
    oak: 'https://images.ctfassets.net/iiozhi00a8lc/6pTfb3rol9EuujxQMapyVn/e58bc760571f353a06ae8fb8ccb31c40/133_gold.svg',
    '133': 'https://images.ctfassets.net/iiozhi00a8lc/6pTfb3rol9EuujxQMapyVn/e58bc760571f353a06ae8fb8ccb31c40/133_gold.svg',
  }
};

interface IAlternateTeamSrcRequest {
  id?: string;
  abbreviation?: string;
}
interface IAlternateTeamSrcResult {
  exists: boolean;
  src: string;
  includesId: boolean;
}

export const getAlternateTeamSrc = (args: IAlternateTeamSrcRequest): IAlternateTeamSrcResult => {
  const result = {
    exists: false,
    src: '',
    includesId: false,
  };

  if (args.id) {
    const { id } = args;
    if (logos.useTeamCapOnDarkId.includes(id)) {
      result.exists = true;
      result.src = logos.urlTeamCapOnDark;
    } else if (logos.useOtherUrlId.includes(id)) {
      result.exists = true;
      result.includesId = true;
      result.src = logos.otherUrls[id];
    }
  } else if (args.abbreviation) {
    const { abbreviation } = args;
    if (logos.useTeamCapOnDark.includes(abbreviation.toLowerCase())) {
      result.exists = true;
      result.src = logos.urlTeamCapOnDark;
    } else if (logos.useOtherUrl.includes(abbreviation.toLowerCase())) {
      result.exists = true;
      result.includesId = true;
      result.src = logos.otherUrls[abbreviation.toLowerCase()];
    }
  }

  return result;
}
