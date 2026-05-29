import type { CountryOption, FlagAsset, GameLevel } from '../game/types';
import { flagDescriptions } from './flagDescriptions';

interface CountrySeed {
  code: string;
  name: string;
  slug: string;
}

interface LevelSeed {
  countries: CountrySeed[];
  mode?: GameLevel['mode'];
  number: number;
}

const flagCdnBaseUrl = 'https://flagcdn.com/w320';

function country(slug: string, name: string, code: string): CountrySeed {
  return {
    code,
    name,
    slug,
  };
}

function createLevel({ countries, mode = 'timed', number }: LevelSeed): GameLevel {
  const complexity = getLevelComplexity(number);
  const flags = countries.map<FlagAsset>((seed) => ({
    alt: getFlagDescription(seed.slug),
    id: getFlagId(seed.slug),
    src: `${flagCdnBaseUrl}/${seed.code.toLowerCase()}.png`,
  }));
  const countryOptions = countries.map<CountryOption>((seed) => ({
    id: getCountryId(seed.slug),
    name: seed.name,
  }));
  const correctMatches = countries.reduce<Record<string, string>>((matches, seed) => {
    matches[getFlagId(seed.slug)] = getCountryId(seed.slug);
    return matches;
  }, {});

  return {
    complexity,
    countries: countryOptions,
    correctMatches,
    flags,
    id: `level-${String(number).padStart(2, '0')}`,
    mode,
    optionCount: countryOptions.length,
    targetScore: mode === 'score' ? countryOptions.length * 125 : undefined,
    timeLimitSeconds: mode === 'timed' ? getTimeLimitSeconds(number) : undefined,
  };
}

function getCountryId(slug: string): string {
  return `country-${slug}`;
}

function getFlagId(slug: string): string {
  return `flag-${slug}`;
}

function getFlagDescription(slug: string): string {
  const description = flagDescriptions[slug];

  if (description === undefined) {
    throw new Error(`Missing accessible flag description for "${slug}".`);
  }

  return description;
}

function getLevelComplexity(number: number): number {
  if (number <= 10) {
    return 1;
  }

  if (number <= 20) {
    return 2;
  }

  if (number <= 25) {
    return 3;
  }

  return 4;
}

function getTimeLimitSeconds(number: number): number {
  if (number <= 10) {
    return 45;
  }

  if (number <= 20) {
    return 55;
  }

  if (number <= 25) {
    return 70;
  }

  return 85;
}

export const campaignLevels: GameLevel[] = [
  createLevel({
    countries: [
      country('canada', 'Canada', 'ca'),
      country('japan', 'Japan', 'jp'),
      country('brazil', 'Brazil', 'br'),
      country('france', 'France', 'fr'),
      country('united-states', 'United States', 'us'),
      country('germany', 'Germany', 'de'),
      country('italy', 'Italy', 'it'),
      country('spain', 'Spain', 'es'),
    ],
    number: 1,
  }),
  createLevel({
    countries: [
      country('united-states', 'United States', 'us'),
      country('united-kingdom', 'United Kingdom', 'gb'),
      country('germany', 'Germany', 'de'),
      country('italy', 'Italy', 'it'),
      country('spain', 'Spain', 'es'),
      country('ireland', 'Ireland', 'ie'),
      country('netherlands', 'Netherlands', 'nl'),
      country('portugal', 'Portugal', 'pt'),
    ],
    number: 2,
  }),
  createLevel({
    countries: [
      country('mexico', 'Mexico', 'mx'),
      country('china', 'China', 'cn'),
      country('india', 'India', 'in'),
      country('australia', 'Australia', 'au'),
      country('indonesia', 'Indonesia', 'id'),
      country('thailand', 'Thailand', 'th'),
      country('vietnam', 'Vietnam', 'vn'),
      country('philippines', 'Philippines', 'ph'),
    ],
    number: 3,
  }),
  createLevel({
    countries: [
      country('south-korea', 'South Korea', 'kr'),
      country('sweden', 'Sweden', 'se'),
      country('norway', 'Norway', 'no'),
      country('denmark', 'Denmark', 'dk'),
      country('finland', 'Finland', 'fi'),
      country('iceland', 'Iceland', 'is'),
      country('estonia', 'Estonia', 'ee'),
      country('latvia', 'Latvia', 'lv'),
    ],
    number: 4,
  }),
  createLevel({
    countries: [
      country('netherlands', 'Netherlands', 'nl'),
      country('switzerland', 'Switzerland', 'ch'),
      country('greece', 'Greece', 'gr'),
      country('turkey', 'Turkey', 'tr'),
      country('portugal', 'Portugal', 'pt'),
      country('belgium', 'Belgium', 'be'),
      country('austria', 'Austria', 'at'),
      country('croatia', 'Croatia', 'hr'),
    ],
    number: 5,
  }),
  createLevel({
    countries: [
      country('argentina', 'Argentina', 'ar'),
      country('chile', 'Chile', 'cl'),
      country('colombia', 'Colombia', 'co'),
      country('peru', 'Peru', 'pe'),
      country('uruguay', 'Uruguay', 'uy'),
      country('paraguay', 'Paraguay', 'py'),
      country('bolivia', 'Bolivia', 'bo'),
      country('ecuador', 'Ecuador', 'ec'),
    ],
    number: 6,
  }),
  createLevel({
    countries: [
      country('egypt', 'Egypt', 'eg'),
      country('south-africa', 'South Africa', 'za'),
      country('morocco', 'Morocco', 'ma'),
      country('kenya', 'Kenya', 'ke'),
      country('nigeria', 'Nigeria', 'ng'),
      country('ghana', 'Ghana', 'gh'),
      country('senegal', 'Senegal', 'sn'),
      country('cameroon', 'Cameroon', 'cm'),
    ],
    number: 7,
  }),
  createLevel({
    countries: [
      country('russia', 'Russia', 'ru'),
      country('ukraine', 'Ukraine', 'ua'),
      country('poland', 'Poland', 'pl'),
      country('czechia', 'Czechia', 'cz'),
      country('austria', 'Austria', 'at'),
      country('slovakia', 'Slovakia', 'sk'),
      country('slovenia', 'Slovenia', 'si'),
      country('hungary', 'Hungary', 'hu'),
    ],
    number: 8,
  }),
  createLevel({
    countries: [
      country('indonesia', 'Indonesia', 'id'),
      country('thailand', 'Thailand', 'th'),
      country('vietnam', 'Vietnam', 'vn'),
      country('philippines', 'Philippines', 'ph'),
      country('malaysia', 'Malaysia', 'my'),
      country('singapore', 'Singapore', 'sg'),
      country('brunei', 'Brunei', 'bn'),
      country('timor-leste', 'Timor-Leste', 'tl'),
    ],
    number: 9,
  }),
  createLevel({
    countries: [
      country('saudi-arabia', 'Saudi Arabia', 'sa'),
      country('israel', 'Israel', 'il'),
      country('united-arab-emirates', 'United Arab Emirates', 'ae'),
      country('qatar', 'Qatar', 'qa'),
      country('singapore', 'Singapore', 'sg'),
      country('jordan', 'Jordan', 'jo'),
      country('lebanon', 'Lebanon', 'lb'),
      country('oman', 'Oman', 'om'),
    ],
    number: 10,
  }),
  createLevel({
    countries: [
      country('ireland', 'Ireland', 'ie'),
      country('belgium', 'Belgium', 'be'),
      country('croatia', 'Croatia', 'hr'),
      country('serbia', 'Serbia', 'rs'),
      country('romania', 'Romania', 'ro'),
      country('bulgaria', 'Bulgaria', 'bg'),
      country('albania', 'Albania', 'al'),
      country('montenegro', 'Montenegro', 'me'),
    ],
    number: 11,
  }),
  createLevel({
    countries: [
      country('new-zealand', 'New Zealand', 'nz'),
      country('fiji', 'Fiji', 'fj'),
      country('samoa', 'Samoa', 'ws'),
      country('tonga', 'Tonga', 'to'),
      country('vanuatu', 'Vanuatu', 'vu'),
      country('papua-new-guinea', 'Papua New Guinea', 'pg'),
      country('solomon-islands', 'Solomon Islands', 'sb'),
      country('micronesia', 'Micronesia', 'fm'),
    ],
    number: 12,
  }),
  createLevel({
    countries: [
      country('pakistan', 'Pakistan', 'pk'),
      country('bangladesh', 'Bangladesh', 'bd'),
      country('sri-lanka', 'Sri Lanka', 'lk'),
      country('nepal', 'Nepal', 'np'),
      country('bhutan', 'Bhutan', 'bt'),
      country('maldives', 'Maldives', 'mv'),
      country('afghanistan', 'Afghanistan', 'af'),
      country('myanmar', 'Myanmar', 'mm'),
    ],
    number: 13,
  }),
  createLevel({
    countries: [
      country('iran', 'Iran', 'ir'),
      country('iraq', 'Iraq', 'iq'),
      country('jordan', 'Jordan', 'jo'),
      country('lebanon', 'Lebanon', 'lb'),
      country('oman', 'Oman', 'om'),
      country('kuwait', 'Kuwait', 'kw'),
      country('bahrain', 'Bahrain', 'bh'),
      country('qatar', 'Qatar', 'qa'),
    ],
    number: 14,
  }),
  createLevel({
    countries: [
      country('ethiopia', 'Ethiopia', 'et'),
      country('ghana', 'Ghana', 'gh'),
      country('senegal', 'Senegal', 'sn'),
      country('cameroon', 'Cameroon', 'cm'),
      country('algeria', 'Algeria', 'dz'),
      country('tunisia', 'Tunisia', 'tn'),
      country('benin', 'Benin', 'bj'),
      country('togo', 'Togo', 'tg'),
    ],
    number: 15,
  }),
  createLevel({
    countries: [
      country('uruguay', 'Uruguay', 'uy'),
      country('paraguay', 'Paraguay', 'py'),
      country('bolivia', 'Bolivia', 'bo'),
      country('ecuador', 'Ecuador', 'ec'),
      country('venezuela', 'Venezuela', 've'),
      country('panama', 'Panama', 'pa'),
      country('costa-rica', 'Costa Rica', 'cr'),
      country('suriname', 'Suriname', 'sr'),
    ],
    number: 16,
  }),
  createLevel({
    countries: [
      country('iceland', 'Iceland', 'is'),
      country('estonia', 'Estonia', 'ee'),
      country('latvia', 'Latvia', 'lv'),
      country('lithuania', 'Lithuania', 'lt'),
      country('slovakia', 'Slovakia', 'sk'),
      country('slovenia', 'Slovenia', 'si'),
      country('hungary', 'Hungary', 'hu'),
      country('croatia', 'Croatia', 'hr'),
    ],
    number: 17,
  }),
  createLevel({
    countries: [
      country('cambodia', 'Cambodia', 'kh'),
      country('laos', 'Laos', 'la'),
      country('myanmar', 'Myanmar', 'mm'),
      country('mongolia', 'Mongolia', 'mn'),
      country('kazakhstan', 'Kazakhstan', 'kz'),
      country('uzbekistan', 'Uzbekistan', 'uz'),
      country('kyrgyzstan', 'Kyrgyzstan', 'kg'),
      country('tajikistan', 'Tajikistan', 'tj'),
    ],
    number: 18,
  }),
  createLevel({
    countries: [
      country('cyprus', 'Cyprus', 'cy'),
      country('malta', 'Malta', 'mt'),
      country('albania', 'Albania', 'al'),
      country('north-macedonia', 'North Macedonia', 'mk'),
      country('bosnia-and-herzegovina', 'Bosnia and Herzegovina', 'ba'),
      country('moldova', 'Moldova', 'md'),
      country('montenegro', 'Montenegro', 'me'),
      country('serbia', 'Serbia', 'rs'),
    ],
    number: 19,
  }),
  createLevel({
    countries: [
      country('jamaica', 'Jamaica', 'jm'),
      country('cuba', 'Cuba', 'cu'),
      country('dominican-republic', 'Dominican Republic', 'do'),
      country('haiti', 'Haiti', 'ht'),
      country('trinidad-and-tobago', 'Trinidad and Tobago', 'tt'),
      country('barbados', 'Barbados', 'bb'),
      country('bahamas', 'Bahamas', 'bs'),
      country('grenada', 'Grenada', 'gd'),
    ],
    number: 20,
  }),
  createLevel({
    countries: [
      country('andorra', 'Andorra', 'ad'),
      country('liechtenstein', 'Liechtenstein', 'li'),
      country('san-marino', 'San Marino', 'sm'),
      country('monaco', 'Monaco', 'mc'),
      country('luxembourg', 'Luxembourg', 'lu'),
      country('malta', 'Malta', 'mt'),
      country('vatican-city', 'Vatican City', 'va'),
      country('montenegro', 'Montenegro', 'me'),
    ],
    number: 21,
  }),
  createLevel({
    countries: [
      country('benin', 'Benin', 'bj'),
      country('togo', 'Togo', 'tg'),
      country('burkina-faso', 'Burkina Faso', 'bf'),
      country('niger', 'Niger', 'ne'),
      country('mali', 'Mali', 'ml'),
      country('chad', 'Chad', 'td'),
      country('mauritania', 'Mauritania', 'mr'),
      country('gambia', 'Gambia', 'gm'),
      country('guinea', 'Guinea', 'gn'),
    ],
    number: 22,
  }),
  createLevel({
    countries: [
      country('suriname', 'Suriname', 'sr'),
      country('guyana', 'Guyana', 'gy'),
      country('belize', 'Belize', 'bz'),
      country('grenada', 'Grenada', 'gd'),
      country('saint-lucia', 'Saint Lucia', 'lc'),
      country('dominica', 'Dominica', 'dm'),
      country('antigua-and-barbuda', 'Antigua and Barbuda', 'ag'),
      country(
        'saint-vincent-and-the-grenadines',
        'Saint Vincent and the Grenadines',
        'vc',
      ),
    ],
    number: 23,
  }),
  createLevel({
    countries: [
      country('kyrgyzstan', 'Kyrgyzstan', 'kg'),
      country('tajikistan', 'Tajikistan', 'tj'),
      country('turkmenistan', 'Turkmenistan', 'tm'),
      country('azerbaijan', 'Azerbaijan', 'az'),
      country('armenia', 'Armenia', 'am'),
      country('georgia', 'Georgia', 'ge'),
      country('moldova', 'Moldova', 'md'),
      country('belarus', 'Belarus', 'by'),
    ],
    number: 24,
  }),
  createLevel({
    countries: [
      country('brunei', 'Brunei', 'bn'),
      country('timor-leste', 'Timor-Leste', 'tl'),
      country('laos', 'Laos', 'la'),
      country('cambodia', 'Cambodia', 'kh'),
      country('myanmar', 'Myanmar', 'mm'),
      country('nepal', 'Nepal', 'np'),
      country('bhutan', 'Bhutan', 'bt'),
      country('maldives', 'Maldives', 'mv'),
    ],
    number: 25,
  }),
  createLevel({
    countries: [
      country('canada', 'Canada', 'ca'),
      country('brazil', 'Brazil', 'br'),
      country('germany', 'Germany', 'de'),
      country('japan', 'Japan', 'jp'),
      country('kenya', 'Kenya', 'ke'),
      country('australia', 'Australia', 'au'),
      country('india', 'India', 'in'),
      country('mexico', 'Mexico', 'mx'),
      country('sweden', 'Sweden', 'se'),
      country('south-africa', 'South Africa', 'za'),
    ],
    mode: 'score',
    number: 26,
  }),
  createLevel({
    countries: [
      country('france', 'France', 'fr'),
      country('spain', 'Spain', 'es'),
      country('italy', 'Italy', 'it'),
      country('greece', 'Greece', 'gr'),
      country('turkey', 'Turkey', 'tr'),
      country('egypt', 'Egypt', 'eg'),
      country('morocco', 'Morocco', 'ma'),
      country('saudi-arabia', 'Saudi Arabia', 'sa'),
      country('thailand', 'Thailand', 'th'),
      country('vietnam', 'Vietnam', 'vn'),
      country('philippines', 'Philippines', 'ph'),
    ],
    mode: 'score',
    number: 27,
  }),
  createLevel({
    countries: [
      country('united-states', 'United States', 'us'),
      country('united-kingdom', 'United Kingdom', 'gb'),
      country('china', 'China', 'cn'),
      country('russia', 'Russia', 'ru'),
      country('argentina', 'Argentina', 'ar'),
      country('chile', 'Chile', 'cl'),
      country('norway', 'Norway', 'no'),
      country('finland', 'Finland', 'fi'),
      country('denmark', 'Denmark', 'dk'),
      country('netherlands', 'Netherlands', 'nl'),
      country('switzerland', 'Switzerland', 'ch'),
      country('portugal', 'Portugal', 'pt'),
    ],
    mode: 'score',
    number: 28,
  }),
  createLevel({
    countries: [
      country('indonesia', 'Indonesia', 'id'),
      country('malaysia', 'Malaysia', 'my'),
      country('singapore', 'Singapore', 'sg'),
      country('new-zealand', 'New Zealand', 'nz'),
      country('fiji', 'Fiji', 'fj'),
      country('samoa', 'Samoa', 'ws'),
      country('colombia', 'Colombia', 'co'),
      country('peru', 'Peru', 'pe'),
      country('uruguay', 'Uruguay', 'uy'),
      country('paraguay', 'Paraguay', 'py'),
      country('ghana', 'Ghana', 'gh'),
      country('senegal', 'Senegal', 'sn'),
    ],
    mode: 'score',
    number: 29,
  }),
  createLevel({
    countries: [
      country('kazakhstan', 'Kazakhstan', 'kz'),
      country('mongolia', 'Mongolia', 'mn'),
      country('uzbekistan', 'Uzbekistan', 'uz'),
      country('iran', 'Iran', 'ir'),
      country('iraq', 'Iraq', 'iq'),
      country('jordan', 'Jordan', 'jo'),
      country('lebanon', 'Lebanon', 'lb'),
      country('israel', 'Israel', 'il'),
      country('ethiopia', 'Ethiopia', 'et'),
      country('nigeria', 'Nigeria', 'ng'),
      country('jamaica', 'Jamaica', 'jm'),
      country('dominican-republic', 'Dominican Republic', 'do'),
    ],
    mode: 'score',
    number: 30,
  }),
];

function getRequiredCampaignLevel(levelId: string): GameLevel {
  const level = campaignLevels.find((campaignLevel) => campaignLevel.id === levelId);

  if (level === undefined) {
    throw new Error(`Campaign level "${levelId}" was not found.`);
  }

  return level;
}

export const beginnerLevel = getRequiredCampaignLevel('level-01');
