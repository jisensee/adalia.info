let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroids({pageNum, pageSize, sort, owned, radius, spectralTypes}) =>
    <AsteroidsPage ?pageNum ?pageSize ?sort ?owned ?radius ?spectralTypes />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
