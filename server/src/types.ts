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
};

export type AsteroidCount = {
  readonly __typename?: 'AsteroidCount';
  readonly count: Scalars['Int'];
  readonly total: Scalars['Int'];
};

export enum AsteroidField {
  Id = 'ID',
  Name = 'NAME',
  Owner = 'OWNER',
  Radius = 'RADIUS',
  SurfaceArea = 'SURFACE_AREA',
  OrbitalPeriod = 'ORBITAL_PERIOD',
  SemiMajorAxis = 'SEMI_MAJOR_AXIS',
  Inclination = 'INCLINATION',
  SpectralType = 'SPECTRAL_TYPE',
  Eccentricity = 'ECCENTRICITY'
}

export type AsteroidFilterInput = {
  readonly owned: Maybe<Scalars['Boolean']>;
  readonly spectralTypes: Maybe<ReadonlyArray<SpectralType>>;
  readonly radius: Maybe<RangeInput>;
  readonly surfaceArea: Maybe<RangeInput>;
  readonly orbitalPeriod: Maybe<RangeInput>;
  readonly semiMajorAxis: Maybe<RangeInput>;
  readonly inclination: Maybe<RangeInput>;
  readonly eccentricity: Maybe<RangeInput>;
};

export type AsteroidPage = {
  readonly __typename?: 'AsteroidPage';
  readonly rows: ReadonlyArray<Asteroid>;
  readonly totalRows: Scalars['Int'];
};

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

export type Query = {
  readonly __typename?: 'Query';
  readonly asteroids: AsteroidPage;
  readonly asteroidCount: AsteroidCount;
  readonly asteroid: Maybe<Asteroid>;
  readonly lastDataUpdateAt: Maybe<Scalars['Date']>;
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
