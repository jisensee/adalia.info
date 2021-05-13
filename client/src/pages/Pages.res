let fromRoute = r =>
  switch r {
  | Route.Home => <p> {"Home"->React.string} </p>
  | Route.Asteroids({page, pageSize}) => <AsteroidsPage ?page ?pageSize />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
