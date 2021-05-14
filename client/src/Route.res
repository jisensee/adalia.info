open Belt

let mapParam = (dict, name, mapper) => dict->Js.Dict.get(name)->Option.flatMap(mapper)
let mapIntParam = (dict, name) => mapParam(dict, name, Int.fromString)
let paramsToDict = items =>
  items->Array.keepMap(((key, value)) => value->Option.map(v => (key, v)))->Js.Dict.fromArray
let toStringParam = (name, value, toString) => (name, value->Option.map(toString))
let toIntParam = (name, value) => toStringParam(name, value, Int.toString)

module AsteroidPageParamType = {
  module SortMode = {
    type t = Ascending | Descending
    let toString = mode =>
      switch mode {
      | Ascending => "asc"
      | Descending => "desc"
      }
    let fromString = str =>
      switch str {
      | "asc" => Some(Ascending)
      | "desc" => Some(Descending)
      | _ => None
      }
  }
  module Sort = {
    type t = {
      by: string,
      mode: SortMode.t,
    }
    let fromString = str =>
      switch str->Js.String2.split(":")->List.fromArray {
      | list{field, mode} => mode->SortMode.fromString->Option.map(m => {by: field, mode: m})
      | _ => None
      }
    let toString = sort => `${sort.by}:${sort.mode->SortMode.toString}`
  }
  type t = {
    page: option<int>,
    pageSize: option<int>,
    sort: option<Sort.t>,
  }
  let fromDict = dict => {
    page: dict->mapIntParam("page"),
    pageSize: dict->mapIntParam("pageSize"),
    sort: dict->Js.Dict.get("sort")->Option.flatMap(Sort.fromString),
  }

  let toDict = ({page, pageSize, sort}) =>
    [
      toIntParam("page", page),
      toIntParam("pageSize", pageSize),
      ("sort", sort->Option.map(Sort.toString)),
    ]->paramsToDict
}

module AsteroidPageParam = QueryParams.Make(AsteroidPageParamType)

type t = Home | Asteroids(AsteroidPageParam.t) | GlobalStats | NotFound

let toUrl = r =>
  switch r {
  | Home => "/"
  | Asteroids(params) => `/asteroids/${params->AsteroidPageParam.toString}`
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
let update = route => route->toUrl->RescriptReactRouter.replace
