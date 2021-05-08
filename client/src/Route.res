type t = Asteroids | GlobalStats | NotFound

let toUrl = r =>
  switch r {
  | Asteroids => "/asteroids"
  | GlobalStats => "/global-stats"
  | NotFound => "/404"
  }

let fromUrl = (url: RescriptReactRouter.url) =>
  switch url {
  | {path: list{}}
  | {path: list{"/"}}
  | {path: list{"asteroids"}} =>
    Asteroids
  | {path: list{"global-stats"}} => GlobalStats
  | _ => NotFound
  }
