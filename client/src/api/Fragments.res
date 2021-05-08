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
`)
