let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroids({pageNum, pageSize, sort, owned, radius}) =>
    <AsteroidsPage ?pageNum ?pageSize ?sort ?owned ?radius />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
