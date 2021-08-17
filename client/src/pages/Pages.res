let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroid(id) => <AsteroidPage id />
  | Route.Asteroids({pageNum, pageSize, sort, filters, columns}) =>
    <AsteroidsPage ?pageNum ?pageSize ?sort ?filters ?columns />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.Privacy => <PrivacyPage />
  | Route.Support => <SupportPage />
  | Route.NotFound => <NotFoundPage />
  }
