open Belt

let peek = (v, msg) => {
  Js.log2(msg, v)
  v
}

module AsteroidPageParamType = {
  type t = {
    pageNum: option<int>,
    pageSize: option<int>,
    sort: option<QueryParams.Sort.t>,
    owned: option<bool>,
    radius: option<(int, int)>,
  }
  let fromDict = dict => {
    pageNum: dict->QueryParams.mapIntParam("page"),
    pageSize: dict->QueryParams.mapIntParam("pageSize"),
    sort: dict->Js.Dict.get("sort")->Option.flatMap(QueryParams.Sort.fromString),
    owned: dict->QueryParams.mapBoolParam("owned"),
    radius: dict->QueryParams.mapIntRangeParam("radius"),
  }
  let toDict = ({pageNum, pageSize, sort, owned, radius}) =>
    [
      QueryParams.toIntParam("page", pageNum),
      QueryParams.toIntParam("pageSize", pageSize),
      ("sort", sort->Option.map(QueryParams.Sort.toString)),
      QueryParams.toBoolParam("owned", owned),
      QueryParams.toIntRangeParam("radius", radius),
    ]->QueryParams.paramsToDict
}

module AsteroidPageParam = QueryParams.Make(AsteroidPageParamType)

type t = Home | Asteroids(AsteroidPageParam.t) | GlobalStats | NotFound

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
