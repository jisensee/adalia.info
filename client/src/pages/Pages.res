let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroids({pageNum, pageSize, sort, filters}) =>
    <AsteroidsPage ?pageNum ?pageSize ?sort ?filters />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
