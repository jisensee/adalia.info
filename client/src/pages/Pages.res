let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroids({pageNum, pageSize, sort}) => <AsteroidsPage ?pageNum ?pageSize ?sort />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
