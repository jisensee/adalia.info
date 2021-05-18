open Fragments

%graphql(`
query DataTableAsteroids($page: PageInput!, $sort: AsteroidSortingInput!, $filter: AsteroidFilterInput!) {
  asteroids(page: $page, sorting: $sort, filter: $filter) {
      ...DataTableAsteroidPage
  }
}

query AsteroidCount($filter: AsteroidFilterInput) {
  asteroidCount(filter: $filter) {
    ...AsteroidCount
  }
}
`)
