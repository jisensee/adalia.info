let fromRoute = r =>
  switch r {
  | Route.Home => <HomePage />
  | Route.Asteroid(id) => <AsteroidPage id />
  | Route.Asteroids => <AsteroidsPage />
  | Route.Stats => <StatsPage />
  | Route.Resources => <ResourcesPage />
  | Route.Privacy => <PrivacyPage />
  | Route.Support => <SupportPage />
  | Route.NotFound => <NotFoundPage />
  }
