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
