open Fragments

%graphql(`
  query DataTableAsteroids($page: PageInput!) {
    asteroids(page: $page) {
        ...DataTableAsteroidPage
    }
  }
`)
