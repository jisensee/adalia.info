%graphql(`
fragment AsteroidSize on Asteroid {
  size @ppxOmitFutureValue
}

fragment AsteroidType on Asteroid {
  spectralType @ppxOmitFutureValue
}

fragment AsteroidRarity on Asteroid {
  rarity @ppxOmitFutureValue
}

fragment AsteroidBonuses on Asteroid {
  bonuses {
    level
    modifier
    type @ppxOmitFutureValue
  }
}

fragment DataTableAsteroid on Asteroid {
  id
  name
  owner
  radius
  surfaceArea
  orbitalPeriod
  semiMajorAxis
  inclination
  eccentricity
  scanned
  estimatedPrice
  ...AsteroidType
  ...AsteroidSize
  ...AsteroidRarity
}

fragment FullAsteroid on Asteroid {
  id
  name
  owner
  radius
  surfaceArea
  orbitalPeriod
  semiMajorAxis
  inclination
  spectralType
  eccentricity
  scanned
  estimatedPrice
  ...AsteroidType
  ...AsteroidSize
  ...AsteroidRarity
  ... AsteroidBonuses
}

fragment DataTableAsteroidPage on AsteroidPage {
  rows {
    ...DataTableAsteroid
  }
  totalRows
}

fragment SpectralTypeCounts on SpectralTypeCounts {
  c
  cm
  ci
  cs
  cms
  cis
  s
  sm
  si
  m
  i
}

fragment RarityCounts on RarityCounts {
  common
  uncommon
  rare
  superior
  exceptional
  incomparable
}

fragment BasicAsteroidStats on BasicAsteroidStats {
  count
  owned
  scanned
  surfaceArea
}

fragment AsteroidStats on AsteroidStats {
  basicStats {
    ...BasicAsteroidStats
  }
  bySpectralType {
    ...SpectralTypeCounts
  }
  byRarity {
    ...RarityCounts  
  }
}
`)
