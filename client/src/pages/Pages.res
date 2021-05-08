let fromRoute = r =>
  switch r {
  | Route.Asteroids => <AsteroidsPage />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
