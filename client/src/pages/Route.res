type t =
  | Home
  | Asteroids(PageQueryParams.AsteroidPage.t)
  | Asteroid(string)
  | GlobalStats
  | Support
  | Privacy
  | NotFound

let defaultAsteroidsRoute = Asteroids({
  pageNum: None,
  pageSize: None,
  sort: None,
  filters: None,
  columns: None,
})

let toUrl = r =>
  switch r {
  | Home => "/"
  | Asteroids(params) => `/asteroids/${params->PageQueryParams.AsteroidPage.toString}`
  | Asteroid(id) => `/asteroids/${id}`
  | GlobalStats => "/global-stats"
  | Support => "/support"
  | Privacy => "/privacy"
  | NotFound => "/404"
  }

let fromUrl = (url: RescriptReactRouter.url) =>
  switch url {
  | {path: list{}}
  | {path: list{"/"}} =>
    Home
  | {path: list{"asteroids", id}} => Asteroid(id)
  | {path: list{"asteroids"}, search} => Asteroids(search->PageQueryParams.AsteroidPage.fromString)
  | {path: list{"global-stats"}} => GlobalStats
  | {path: list{"support"}} => Support
  | {path: list{"privacy"}} => Privacy
  | _ => NotFound
  }

let go = route => route->toUrl->RescriptReactRouter.push
let update = route => route->toUrl->RescriptReactRouter.replace
