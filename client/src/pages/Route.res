type t =
  | Home
  | Asteroids
  | Asteroid(string)
  | Stats
  | Resources
  | Support
  | Privacy
  | NotFound

let toUrl = r =>
  switch r {
  | Home => "/"
  | Asteroids => "/asteroids"
  | Asteroid(id) => `/asteroids/${id}`
  | Stats => "/stats"
  | Resources => "/resources"
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
  | {path: list{"asteroids"}} => Asteroids
  | {path: list{"stats"}} => Stats
  | {path: list{"resources"}} => Resources
  | {path: list{"support"}} => Support
  | {path: list{"privacy"}} => Privacy
  | _ => NotFound
  }

let go = route => route->toUrl->RescriptReactRouter.push
let update = route => route->toUrl->RescriptReactRouter.replace

let hasAsteroidFilters = Js.Array2.includes([Asteroids, Stats])
