let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroids({pageNum, pageSize, sort, owned}) =>
    <AsteroidsPage ?pageNum ?pageSize ?sort ?owned />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
