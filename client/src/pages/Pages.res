let fromRoute = r =>
  switch r {
  | Route.Home => <p> {"Home"->React.string} </p>
  | Route.Asteroids({pageNum, pageSize, sort}) => <AsteroidsPage ?pageNum ?pageSize ?sort />
  | Route.GlobalStats => <GlobalStatsPage />
  | Route.NotFound => <NotFoundPage />
  }
