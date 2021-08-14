%graphql(`
fragment DataTableAsteroid on Asteroid {
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
}

fragment DataTableAsteroidPage on AsteroidPage {
  rows {
    ...DataTableAsteroid
  }
  totalRows
}

fragment AsteroidCount on AsteroidCount {
  count
  total
}
`)
