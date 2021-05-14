open Fragments

%graphql(`
  query DataTableAsteroids($page: PageInput!, $sort: AsteroidSortingInput!) {
    asteroids(page: $page, sorting: $sort) {
        ...DataTableAsteroidPage
    }
  }
`)
