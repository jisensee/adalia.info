export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
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
  readonly id: Scalars['Int'];
  readonly baseName: Scalars['String'];
  readonly name: Scalars['String'];
  readonly owner: Maybe<Scalars['String']>;
  readonly radius: Scalars['Float'];
  readonly surfaceArea: Scalars['Float'];
  readonly size: AsteroidSize;
  readonly orbitalPeriod: Scalars['Float'];
  readonly semiMajorAxis: Scalars['Float'];
  readonly inclination: Scalars['Float'];
  readonly eccentricity: Scalars['Float'];
  readonly spectralType: SpectralType;
  readonly scanned: Scalars['Boolean'];
  readonly estimatedPrice: Maybe<Scalars['Float']>;
  readonly rarity: Maybe<AsteroidRarity>;
  readonly bonuses: ReadonlyArray<AsteroidBonus>;
};

export type AsteroidBonus = {
  readonly __typename?: 'AsteroidBonus';
  readonly level: Scalars['Int'];
  readonly modifier: Scalars['Int'];
  readonly type: AsteroidBonusType;
};

export type AsteroidBonusConditionInput = {
  readonly type: InputMaybe<AsteroidBonusType>;
  readonly levels: InputMaybe<ReadonlyArray<Scalars['Int']>>;
};

export enum AsteroidBonusType {
  Yield = 'YIELD',
  Volatile = 'VOLATILE',
  Metal = 'METAL',
  Organic = 'ORGANIC',
  RareEarth = 'RARE_EARTH',
  Fissile = 'FISSILE'
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
  Id = 'ID',
  Name = 'NAME',
  Owner = 'OWNER',
  Scanned = 'SCANNED',
  Radius = 'RADIUS',
  SurfaceArea = 'SURFACE_AREA',
  Size = 'SIZE',
  OrbitalPeriod = 'ORBITAL_PERIOD',
  SemiMajorAxis = 'SEMI_MAJOR_AXIS',
  Inclination = 'INCLINATION',
  SpectralType = 'SPECTRAL_TYPE',
  Eccentricity = 'ECCENTRICITY',
  EstimatedPrice = 'ESTIMATED_PRICE',
  Rarity = 'RARITY'
}

export type AsteroidFilterInput = {
  readonly owned: InputMaybe<Scalars['Boolean']>;
  readonly owners: InputMaybe<ReadonlyArray<Scalars['String']>>;
  readonly scanned: InputMaybe<Scalars['Boolean']>;
  readonly spectralTypes: InputMaybe<ReadonlyArray<SpectralType>>;
  readonly radius: InputMaybe<RangeInput>;
  readonly surfaceArea: InputMaybe<RangeInput>;
  readonly sizes: InputMaybe<ReadonlyArray<AsteroidSize>>;
  readonly orbitalPeriod: InputMaybe<RangeInput>;
  readonly semiMajorAxis: InputMaybe<RangeInput>;
  readonly inclination: InputMaybe<RangeInput>;
  readonly eccentricity: InputMaybe<RangeInput>;
  readonly estimatedPrice: InputMaybe<RangeInput>;
  readonly rarities: InputMaybe<ReadonlyArray<AsteroidRarity>>;
  readonly bonuses: InputMaybe<AsteroidBonusesFilterInput>;
};

export type AsteroidPage = {
  readonly __typename?: 'AsteroidPage';
  readonly rows: ReadonlyArray<Asteroid>;
  readonly totalRows: Scalars['Int'];
};

export enum AsteroidRarity {
  Common = 'COMMON',
  Uncommon = 'UNCOMMON',
  Rare = 'RARE',
  Superior = 'SUPERIOR',
  Exceptional = 'EXCEPTIONAL',
  Incomparable = 'INCOMPARABLE'
}

export enum AsteroidSize {
  Small = 'SMALL',
  Medium = 'MEDIUM',
  Large = 'LARGE',
  Huge = 'HUGE'
}

export type AsteroidSortingInput = {
  readonly field: AsteroidField;
  readonly mode: SortingMode;
};

export type AsteroidStats = {
  readonly __typename?: 'AsteroidStats';
  readonly basicStats: BasicAsteroidStats;
  readonly bySpectralType: SpectralTypeCounts;
  readonly byRarity: RarityCounts;
};

export type BasicAsteroidStats = {
  readonly __typename?: 'BasicAsteroidStats';
  readonly count: Scalars['Int'];
  readonly owned: Scalars['Int'];
  readonly scanned: Scalars['Int'];
  readonly surfaceArea: Scalars['Float'];
};

export type ExchangeRates = {
  readonly __typename?: 'ExchangeRates';
  readonly oneEthInUsd: Scalars['Float'];
};

export enum ExportFormat {
  Json = 'JSON',
  Csv = 'CSV'
}

export type Mutation = {
  readonly __typename?: 'Mutation';
  readonly exportAsteroids: Scalars['String'];
  readonly exportAllAsteroids: Scalars['String'];
};


export type MutationExportAsteroidsArgs = {
  sorting: InputMaybe<AsteroidSortingInput>;
  filter: InputMaybe<AsteroidFilterInput>;
  format: ExportFormat;
};


export type MutationExportAllAsteroidsArgs = {
  format: ExportFormat;
};

export type PageInput = {
  readonly size: Scalars['Int'];
  readonly num: Scalars['Int'];
};

export type PriceBounds = {
  readonly __typename?: 'PriceBounds';
  readonly min: Scalars['Float'];
  readonly max: Scalars['Float'];
};

export type Query = {
  readonly __typename?: 'Query';
  readonly asteroids: AsteroidPage;
  readonly asteroidStats: AsteroidStats;
  readonly asteroid: Maybe<Asteroid>;
  readonly lastDataUpdateAt: Maybe<Scalars['Date']>;
  readonly priceBounds: PriceBounds;
  readonly exchangeRates: ExchangeRates;
};


export type QueryAsteroidsArgs = {
  page: PageInput;
  sorting: InputMaybe<AsteroidSortingInput>;
  filter: InputMaybe<AsteroidFilterInput>;
};


export type QueryAsteroidStatsArgs = {
  filter: InputMaybe<AsteroidFilterInput>;
};


export type QueryAsteroidArgs = {
  id: Scalars['Int'];
};

export type RangeInput = {
  readonly from: Scalars['Float'];
  readonly to: Scalars['Float'];
};

export type RarityCounts = {
  readonly __typename?: 'RarityCounts';
  readonly common: Scalars['Int'];
  readonly uncommon: Scalars['Int'];
  readonly rare: Scalars['Int'];
  readonly superior: Scalars['Int'];
  readonly exceptional: Scalars['Int'];
  readonly incomparable: Scalars['Int'];
};

export enum SortingMode {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export enum SpectralType {
  C = 'C',
  Cm = 'CM',
  Ci = 'CI',
  Cs = 'CS',
  Cms = 'CMS',
  Cis = 'CIS',
  S = 'S',
  Sm = 'SM',
  Si = 'SI',
  M = 'M',
  I = 'I'
}

export type SpectralTypeCounts = {
  readonly __typename?: 'SpectralTypeCounts';
  readonly c: Scalars['Int'];
  readonly cm: Scalars['Int'];
  readonly ci: Scalars['Int'];
  readonly cs: Scalars['Int'];
  readonly cms: Scalars['Int'];
  readonly cis: Scalars['Int'];
  readonly s: Scalars['Int'];
  readonly sm: Scalars['Int'];
  readonly si: Scalars['Int'];
  readonly m: Scalars['Int'];
  readonly i: Scalars['Int'];
};
