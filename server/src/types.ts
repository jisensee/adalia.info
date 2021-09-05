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
  readonly type: Maybe<AsteroidBonusType>;
  readonly levels: Maybe<ReadonlyArray<Scalars['Int']>>;
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

export type AsteroidCount = {
  readonly __typename?: 'AsteroidCount';
  readonly count: Scalars['Int'];
  readonly total: Scalars['Int'];
};

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
  readonly owned: Maybe<Scalars['Boolean']>;
  readonly scanned: Maybe<Scalars['Boolean']>;
  readonly spectralTypes: Maybe<ReadonlyArray<SpectralType>>;
  readonly radius: Maybe<RangeInput>;
  readonly surfaceArea: Maybe<RangeInput>;
  readonly sizes: Maybe<ReadonlyArray<AsteroidSize>>;
  readonly orbitalPeriod: Maybe<RangeInput>;
  readonly semiMajorAxis: Maybe<RangeInput>;
  readonly inclination: Maybe<RangeInput>;
  readonly eccentricity: Maybe<RangeInput>;
  readonly estimatedPrice: Maybe<RangeInput>;
  readonly rarities: Maybe<ReadonlyArray<AsteroidRarity>>;
  readonly bonuses: Maybe<AsteroidBonusesFilterInput>;
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
  readonly asteroidCount: AsteroidCount;
  readonly asteroid: Maybe<Asteroid>;
  readonly lastDataUpdateAt: Maybe<Scalars['Date']>;
  readonly priceBounds: PriceBounds;
};


export type QueryAsteroidsArgs = {
  page: PageInput;
  sorting: Maybe<AsteroidSortingInput>;
  filter: Maybe<AsteroidFilterInput>;
};


export type QueryAsteroidCountArgs = {
  filter: Maybe<AsteroidFilterInput>;
};


export type QueryAsteroidArgs = {
  id: Scalars['Int'];
};

export type RangeInput = {
  readonly from: Scalars['Float'];
  readonly to: Scalars['Float'];
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
