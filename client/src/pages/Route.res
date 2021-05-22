type t = Home | Asteroids(PageQueryParams.AsteroidPage.t) | GlobalStats | NotFound

let defaultAsteroidsRoute = Asteroids({
  pageNum: None,
  pageSize: None,
  sort: None,
  owned: None,
  radius: None,
})

let toUrl = r =>
  switch r {
  | Home => "/"
  | Asteroids(params) => `/asteroids/${params->PageQueryParams.AsteroidPage.toString}`
  | GlobalStats => "/global-stats"
  | NotFound => "/404"
  }

let fromUrl = (url: RescriptReactRouter.url) =>
  switch url {
  | {path: list{}}
  | {path: list{"/"}} =>
    Home
  | {path: list{"asteroids"}, search} => Asteroids(search->PageQueryParams.AsteroidPage.fromString)
  | {path: list{"global-stats"}} => GlobalStats
  | _ => NotFound
  }

let go = route => route->toUrl->RescriptReactRouter.push
let update = route => route->toUrl->RescriptReactRouter.replace
