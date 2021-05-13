open Belt

let mapParam = (dict, name, mapper) => dict->Js.Dict.get(name)->Option.flatMap(mapper)
let mapIntParam = (dict, name) => mapParam(dict, name, Int.fromString)
let paramsToDict = items =>
  items->Array.keepMap(((key, value)) => value->Option.map(v => (key, v)))->Js.Dict.fromArray
let toStringParam = (name, value, toString) => (name, value->Option.map(toString))
let toIntParam = (name, value) => toStringParam(name, value, Int.toString)

module AsteroidPageParamType = {
  type t = {
    page: option<int>,
    pageSize: option<int>,
  }
  let fromDict = dict => {
    page: dict->mapIntParam("page"),
    pageSize: dict->mapIntParam("pageSize"),
  }

  let toDict = ({page, pageSize}) =>
    [toIntParam("page", page), toIntParam("pageSize", pageSize)]->paramsToDict
}

module AsteroidPageParam = QueryParams.Make(AsteroidPageParamType)

type t = Home | Asteroids(AsteroidPageParam.t) | GlobalStats | NotFound

let toUrl = r =>
  switch r {
  | Home => "/"
  | Asteroids(params) => `/asteroids/?${params->AsteroidPageParam.toString}`
  | GlobalStats => "/global-stats"
  | NotFound => "/404"
  }

let fromUrl = (url: RescriptReactRouter.url) =>
  switch url {
  | {path: list{}}
  | {path: list{"/"}} =>
    Home
  | {path: list{"asteroids"}, search} => Asteroids(search->AsteroidPageParam.fromString)
  | {path: list{"global-stats"}} => GlobalStats
  | _ => NotFound
  }

let go = route => route->toUrl->RescriptReactRouter.push
