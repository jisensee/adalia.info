open Fragments

module Date = {
  type t = Js.Date.t
  let parse = value => {
    value->Js.Json.decodeString->Belt.Option.getUnsafe->Js.Date.fromString
  }
  let serialize = value => value->Js.Date.toISOString->Js.Json.string
}

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

query Asteroid($id: Int!) {
  asteroid(id: $id) {
    ...FullAsteroid
  }
}

query LastDataUpdateAt {
  lastDataUpdateAt @ppxCustom(module: "Date")
}

query PriceBounds {
  priceBounds {
    min
    max
  }
}

query ExchangeRates {
  exchangeRates {
    oneEthInUsd
  }
}
`)
