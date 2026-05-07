import type { CountryOption, FlagAsset, GameLevel, LevelHint } from '../game/types';

interface CountrySeed {
  code: string;
  hint?: string;
  name: string;
  slug: string;
}

interface LevelSeed {
  countries: CountrySeed[];
  mode?: GameLevel['mode'];
  number: number;
}

const flagCdnBaseUrl = 'https://flagcdn.com/w320';

const countryHintCatalog: Record<string, string> = {
  albania: 'Look for the bold red field with a black double-headed eagle.',
  andorra: 'Its vertical tricolor includes a central coat of arms.',
  argentina: 'The pale blue and white stripes frame a sun emblem.',
  australia: 'This flag combines the Union Jack with stars on a blue field.',
  bahamas: 'A black triangle points into bright aqua and yellow bands.',
  bangladesh: 'A red disc sits slightly off-center on a green field.',
  barbados: 'The broken trident is the key symbol on this flag.',
  belarus: 'Look for a red and green flag with an ornamental pattern at the hoist.',
  belgium: 'Its vertical stripes are black, yellow, and red.',
  belize: 'This flag has a detailed coat of arms inside a white disc.',
  benin: 'A green hoist block sits beside yellow and red horizontal bands.',
  bhutan: 'A dragon stretches across diagonal yellow and orange fields.',
  brazil: 'A yellow diamond surrounds a blue globe on a green field.',
  brunei: 'Diagonal black and white bands cut across a yellow field.',
  bulgaria: 'Its horizontal bands are white, green, and red.',
  'burkina-faso': 'A yellow star sits where red and green halves meet.',
  cambodia: 'A temple silhouette sits in the center band.',
  cameroon: 'Look for vertical green, red, and yellow with a central star.',
  canada: 'The maple leaf is the giveaway.',
  chad: 'Its vertical blue, yellow, and red bands are easy to confuse with Romania.',
  chile: 'Look for a single white star in a blue canton.',
  china: 'One large yellow star leads four smaller stars on red.',
  colombia: 'The yellow band takes up half of the flag height.',
  'costa-rica': 'The red center stripe is wider than the blue and white stripes.',
  croatia: 'The checkerboard shield sits over red, white, and blue stripes.',
  cuba: 'A red triangle with a white star points into blue and white stripes.',
  cyprus: 'The island outline appears above olive branches.',
  czechia: 'A blue triangle sits beside white and red horizontal bands.',
  denmark: 'This is the red Nordic cross flag.',
  dominica: 'A parrot appears inside a red disc.',
  'dominican-republic': 'A central coat of arms sits on a white cross.',
  ecuador: 'Its coat of arms sits on yellow, blue, and red horizontal bands.',
  egypt: 'The golden eagle sits in the middle of red, white, and black stripes.',
  estonia: 'Its horizontal stripes are blue, black, and white.',
  ethiopia: 'A blue disc with a yellow star sits on green, yellow, and red.',
  fiji: 'The light blue field and Union Jack make it stand out.',
  finland: 'This Nordic cross is blue on a white field.',
  france: 'The vertical tricolor is blue, white, and red.',
  gambia: 'A blue stripe is separated by thin white lines.',
  georgia: 'Look for one large red cross plus four smaller crosses.',
  germany: 'The horizontal tricolor is black, red, and gold.',
  ghana: 'A black star sits in the middle of red, yellow, and green.',
  greece: 'Blue and white stripes pair with a white cross canton.',
  grenada: 'Nutmeg appears near the hoist on this red-bordered flag.',
  guinea: 'Its vertical stripes are red, yellow, and green.',
  guyana: 'The golden arrowhead points across a green field.',
  haiti: 'A coat of arms sits between blue and red horizontal bands.',
  hungary: 'The horizontal tricolor is red, white, and green.',
  iceland: 'This Nordic cross uses blue, white, and red.',
  india: 'The navy wheel sits between saffron, white, and green.',
  indonesia: 'A simple red-over-white bicolor.',
  iran: 'The red emblem sits between green, white, and red bands.',
  iraq: 'Arabic script appears in green on the white band.',
  ireland: 'The vertical tricolor is green, white, and orange.',
  israel: 'A blue Star of David sits between blue stripes.',
  italy: 'The vertical tricolor is green, white, and red.',
  jamaica: 'A gold X divides green and black triangles.',
  japan: 'This island nation uses a red circle on a white field.',
  jordan: 'A red triangle with a white star points into black, white, and green.',
  kazakhstan: 'A sun and eagle appear on a sky blue field.',
  kenya: 'A Maasai shield sits at the center.',
  kuwait: 'A black trapezoid anchors green, white, and red stripes.',
  kyrgyzstan: 'A yellow sun emblem sits on a red field.',
  laos: 'A white disc sits on a blue band between red bands.',
  latvia: 'A thin white stripe cuts through deep red.',
  lebanon: 'The green cedar tree is the central symbol.',
  liechtenstein: 'A small crown appears on blue and red bands.',
  lithuania: 'The horizontal bands are yellow, green, and red.',
  luxembourg: 'Its light blue stripe distinguishes it from similar tricolors.',
  malaysia: 'Look for stripes plus a crescent and star on blue.',
  maldives: 'A white crescent sits inside a green rectangle on red.',
  mali: 'Its vertical stripes are green, yellow, and red.',
  malta: 'The George Cross appears in the upper hoist corner.',
  mauritania: 'A crescent and star sit on green between red bands.',
  mexico: 'The eagle and serpent emblem sits in the center.',
  moldova: 'Its tricolor includes a central eagle crest.',
  monaco: 'A simple red-over-white bicolor.',
  mongolia: 'The Soyombo symbol sits on the hoist stripe.',
  montenegro: 'A gold border surrounds a red field with a coat of arms.',
  morocco: 'A green pentagram sits on a red field.',
  myanmar: 'A large white star sits over yellow, green, and red bands.',
  nepal: 'This is the only non-rectangular national flag in the set.',
  netherlands: 'The horizontal tricolor is red, white, and blue.',
  'new-zealand': 'Look for red stars beside the Union Jack.',
  niger: 'An orange disc sits between orange, white, and green bands.',
  nigeria: 'A white vertical band sits between two green bands.',
  'north-macedonia': 'A yellow sunburst radiates across a red field.',
  norway: 'This Nordic cross is blue and white on red.',
  oman: 'A red hoist band joins white, red, and green stripes.',
  pakistan: 'A white crescent and star sit on green beside a white stripe.',
  panama: 'Four quarters include blue and red stars.',
  paraguay: 'Look for red, white, and blue horizontal bands with a central emblem.',
  peru: 'A white vertical band sits between two red bands.',
  philippines: 'A white triangle contains a sun and three stars.',
  poland: 'A simple white-over-red bicolor.',
  portugal: 'The shield sits where green and red fields meet.',
  qatar: 'Its maroon field has a serrated white band.',
  romania: 'Its vertical stripes are blue, yellow, and red.',
  russia: 'The horizontal tricolor is white, blue, and red.',
  samoa: 'A blue canton with white stars sits on red.',
  'san-marino': 'A detailed coat of arms sits between white and light blue.',
  'saint-lucia': 'A black and white triangle rises from a light blue field.',
  'saint-vincent-and-the-grenadines':
    'Three green diamonds sit on the yellow center band.',
  'saudi-arabia': 'Arabic script and a sword sit on a green field.',
  senegal: 'A green star sits in the center yellow band.',
  serbia: 'Its coat of arms sits near the hoist over red, blue, and white.',
  singapore: 'A crescent and five stars sit in the red upper band.',
  slovakia: 'A shield sits near the hoist on white, blue, and red stripes.',
  slovenia: 'The mountain shield appears near the hoist.',
  'south-africa': 'The Y shape combines several bright colors.',
  'south-korea': 'The red-blue taegeuk sits between four black trigrams.',
  spain: 'The yellow center band is wider than the red bands.',
  'sri-lanka': 'A lion holding a sword dominates the flag.',
  suriname: 'A yellow star sits on a red stripe bordered by white.',
  sweden: 'This Nordic cross is yellow on blue.',
  switzerland: 'A white cross sits centered on a red square-style flag.',
  tajikistan: 'A crown and stars sit in the white center band.',
  thailand: 'The wide blue center stripe is bordered by white and red.',
  'timor-leste': 'A black triangle and white star sit inside a yellow triangle.',
  togo: 'A white star sits in a red canton over green and yellow stripes.',
  tonga: 'A red cross appears in a white canton.',
  'trinidad-and-tobago': 'A black diagonal band cuts across a red field.',
  tunisia: 'A red crescent and star sit inside a white disc.',
  turkey: 'A white crescent and star sit on a red field.',
  turkmenistan: 'A patterned carpet stripe appears near the hoist.',
  ukraine: 'A blue band sits over a yellow band.',
  'united-arab-emirates': 'A red hoist band anchors green, white, and black.',
  'united-kingdom': 'The Union Jack combines multiple crosses.',
  'united-states': 'Look for stars and stripes.',
  uruguay: 'The sun appears in the canton beside blue and white stripes.',
  uzbekistan: 'A crescent and stars sit above thin red separators.',
  vanuatu: 'A black Y shape divides red and green fields.',
  'vatican-city': 'Crossed keys sit beside yellow and white vertical bands.',
  venezuela: 'A row of white stars arcs across the blue band.',
  vietnam: 'A yellow star sits centered on a red field.',
};

function country(slug: string, name: string, code: string, hint?: string): CountrySeed {
  return {
    code,
    hint,
    name,
    slug,
  };
}

function createLevel({ countries, mode = 'timed', number }: LevelSeed): GameLevel {
  const complexity = getLevelComplexity(number);
  const flags = countries.map<FlagAsset>((seed) => ({
    alt: `Flag of ${seed.name}`,
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
  const hints = countries
    .map((seed) => ({
      seed,
      text: seed.hint ?? countryHintCatalog[seed.slug],
    }))
    .filter(({ text }) => text !== undefined)
    .map<LevelHint>((seed) => ({
      countryId: getCountryId(seed.seed.slug),
      text: seed.text ?? '',
    }));

  return {
    complexity,
    countries: countryOptions,
    correctMatches,
    flags,
    hints: hints.length > 0 ? hints : undefined,
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
      country(
        'japan',
        'Japan',
        'jp',
        'This island nation uses a red circle on a white field.',
      ),
      country('brazil', 'Brazil', 'br'),
      country('france', 'France', 'fr'),
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
    ],
    number: 2,
  }),
  createLevel({
    countries: [
      country('mexico', 'Mexico', 'mx'),
      country('china', 'China', 'cn'),
      country('india', 'India', 'in'),
      country('australia', 'Australia', 'au'),
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
    ],
    number: 5,
  }),
  createLevel({
    countries: [
      country('argentina', 'Argentina', 'ar'),
      country('chile', 'Chile', 'cl'),
      country('colombia', 'Colombia', 'co'),
      country('peru', 'Peru', 'pe'),
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
