export type Maybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Date: any;
};

export type Asteroid = {
  readonly __typename?: 'Asteroid';
  readonly baseName: Scalars['String'];
  readonly bonuses: ReadonlyArray<AsteroidBonus>;
  readonly eccentricity: Scalars['Float'];
  readonly estimatedPrice: Maybe<Scalars['Float']>;
  readonly id: Scalars['Int'];
  readonly inclination: Scalars['Float'];
  readonly name: Scalars['String'];
  readonly orbitalPeriod: Scalars['Float'];
  readonly owner: Maybe<Scalars['String']>;
  readonly radius: Scalars['Float'];
  readonly rarity: Maybe<AsteroidRarity>;
  readonly scanned: Scalars['Boolean'];
  readonly semiMajorAxis: Scalars['Float'];
  readonly size: AsteroidSize;
  readonly spectralType: SpectralType;
  readonly surfaceArea: Scalars['Float'];
};

export type AsteroidBonus = {
  readonly __typename?: 'AsteroidBonus';
  readonly level: Scalars['Int'];
  readonly modifier: Scalars['Int'];
  readonly type: AsteroidBonusType;
};

export type AsteroidBonusConditionInput = {
  readonly levels: Maybe<ReadonlyArray<Scalars['Int']>>;
  readonly type: Maybe<AsteroidBonusType>;
};

export enum AsteroidBonusType {
  Fissile = 'FISSILE',
  Metal = 'METAL',
  Organic = 'ORGANIC',
  RareEarth = 'RARE_EARTH',
  Volatile = 'VOLATILE',
  Yield = 'YIELD'
}

export type AsteroidBonusesFilterInput = {
  readonly conditions: ReadonlyArray<AsteroidBonusConditionInput>;
  readonly mode: AsteroidBonusesFilterMode;
};

export enum AsteroidBonusesFilterMode {
  And = 'AND',
  Or = 'OR'
}

export enum AsteroidField {
  Eccentricity = 'ECCENTRICITY',
  EstimatedPrice = 'ESTIMATED_PRICE',
  Id = 'ID',
  Inclination = 'INCLINATION',
  Name = 'NAME',
  OrbitalPeriod = 'ORBITAL_PERIOD',
  Owner = 'OWNER',
  Radius = 'RADIUS',
  Rarity = 'RARITY',
  Scanned = 'SCANNED',
  SemiMajorAxis = 'SEMI_MAJOR_AXIS',
  Size = 'SIZE',
  SpectralType = 'SPECTRAL_TYPE',
  SurfaceArea = 'SURFACE_AREA'
}

export type AsteroidFilterInput = {
  readonly bonuses: Maybe<AsteroidBonusesFilterInput>;
  readonly eccentricity: Maybe<RangeInput>;
  readonly estimatedPrice: Maybe<RangeInput>;
  readonly inclination: Maybe<RangeInput>;
  readonly orbitalPeriod: Maybe<RangeInput>;
  readonly owned: Maybe<Scalars['Boolean']>;
  readonly owners: Maybe<ReadonlyArray<Scalars['String']>>;
  readonly radius: Maybe<RangeInput>;
  readonly rarities: Maybe<ReadonlyArray<AsteroidRarity>>;
  readonly scanned: Maybe<Scalars['Boolean']>;
  readonly semiMajorAxis: Maybe<RangeInput>;
  readonly sizes: Maybe<ReadonlyArray<AsteroidSize>>;
  readonly spectralTypes: Maybe<ReadonlyArray<SpectralType>>;
  readonly surfaceArea: Maybe<RangeInput>;
};

export type AsteroidPage = {
  readonly __typename?: 'AsteroidPage';
  readonly rows: ReadonlyArray<Asteroid>;
  readonly totalRows: Scalars['Int'];
};

export enum AsteroidRarity {
  Common = 'COMMON',
  Exceptional = 'EXCEPTIONAL',
  Incomparable = 'INCOMPARABLE',
  Rare = 'RARE',
  Superior = 'SUPERIOR',
  Uncommon = 'UNCOMMON'
}

export enum AsteroidSize {
  Huge = 'HUGE',
  Large = 'LARGE',
  Medium = 'MEDIUM',
  Small = 'SMALL'
}

export type AsteroidSortingInput = {
  readonly field: AsteroidField;
  readonly mode: SortingMode;
};

export type AsteroidStats = {
  readonly __typename?: 'AsteroidStats';
  readonly basicStats: BasicAsteroidStats;
  readonly byRarity: RarityCounts;
  readonly bySpectralType: SpectralTypeCounts;
};

export type BasicAsteroidStats = {
  readonly __typename?: 'BasicAsteroidStats';
  readonly count: Scalars['Int'];
  readonly owned: Scalars['Int'];
  readonly scanned: Scalars['Int'];
  readonly surfaceArea: Scalars['Float'];
  readonly totalCount: Scalars['Int'];
};


export type ExchangeRates = {
  readonly __typename?: 'ExchangeRates';
  readonly oneEthInUsd: Scalars['Float'];
};

export enum ExportFormat {
  Csv = 'CSV',
  Json = 'JSON'
}

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly exportAllAsteroids: Scalars['String'];
  readonly exportAsteroids: Scalars['String'];
};


export type MutationExportAllAsteroidsArgs = {
  format: ExportFormat;
};


export type MutationExportAsteroidsArgs = {
  filter: Maybe<AsteroidFilterInput>;
  format: ExportFormat;
  sorting: Maybe<AsteroidSortingInput>;
};

export type PageInput = {
  readonly num: Scalars['Int'];
  readonly size: Scalars['Int'];
};

export type PriceBounds = {
  readonly __typename?: 'PriceBounds';
  readonly max: Scalars['Float'];
  readonly min: Scalars['Float'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly asteroid: Maybe<Asteroid>;
  readonly asteroidStats: AsteroidStats;
  readonly asteroids: AsteroidPage;
  readonly exchangeRates: ExchangeRates;
  readonly lastDataUpdateAt: Maybe<Scalars['Date']>;
  readonly priceBounds: PriceBounds;
};


export type QueryAsteroidArgs = {
  id: Scalars['Int'];
};


export type QueryAsteroidStatsArgs = {
  filter: Maybe<AsteroidFilterInput>;
};


export type QueryAsteroidsArgs = {
  filter: Maybe<AsteroidFilterInput>;
  page: PageInput;
  sorting: Maybe<AsteroidSortingInput>;
};

export type RangeInput = {
  readonly from: Scalars['Float'];
  readonly to: Scalars['Float'];
};

export type RarityCounts = {
  readonly __typename?: 'RarityCounts';
  readonly common: Scalars['Int'];
  readonly exceptional: Scalars['Int'];
  readonly incomparable: Scalars['Int'];
  readonly rare: Scalars['Int'];
  readonly superior: Scalars['Int'];
  readonly uncommon: Scalars['Int'];
};

export enum SortingMode {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export enum SpectralType {
  C = 'C',
  Ci = 'CI',
  Cis = 'CIS',
  Cm = 'CM',
  Cms = 'CMS',
  Cs = 'CS',
  I = 'I',
  M = 'M',
  S = 'S',
  Si = 'SI',
  Sm = 'SM'
}

export type SpectralTypeCounts = {
  readonly __typename?: 'SpectralTypeCounts';
  readonly c: Scalars['Int'];
  readonly ci: Scalars['Int'];
  readonly cis: Scalars['Int'];
  readonly cm: Scalars['Int'];
  readonly cms: Scalars['Int'];
  readonly cs: Scalars['Int'];
  readonly i: Scalars['Int'];
  readonly m: Scalars['Int'];
  readonly s: Scalars['Int'];
  readonly si: Scalars['Int'];
  readonly sm: Scalars['Int'];
};
