open Fragments

%graphql(`
  query DataTableAsteroids {
    asteroids {
      ...DataTableAsteroid
    }
  }
`)
