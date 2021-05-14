let fromRoute = r =>
  switch r {
  | Route.Home => <p> {"Home"->React.string} </p>
  | Route.Asteroids({page, pageSize, sort}) => <AsteroidsPage ?page ?pageSize ?sort />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
