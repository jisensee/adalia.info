let parseParam = param =>
  switch param->Js.String2.split("=")->Belt.List.fromArray {
  | list{key, value} => Some((key, value))
  | _ => None
  }

let dictToStrParams = dict =>
  dict
  ->Js.Dict.entries
  ->Belt.Array.map(((key, value)) => `${key}=${value}`)
  ->Belt.Array.joinWith("&", s => s)

let mapParam = (dict, name, mapper) => dict->Js.Dict.get(name)->Belt.Option.flatMap(mapper)
let mapIntParam = (dict, name) => mapParam(dict, name, Belt.Int.fromString)
let mapBoolParam = (dict, name) =>
  mapParam(dict, name, str =>
    switch str {
    | "true" => Some(true)
    | _ => Some(false)
    }
  )

let paramsToDict = items =>
  items
  ->Belt.Array.keepMap(((key, value)) => value->Belt.Option.map(v => (key, v)))
  ->Js.Dict.fromArray

let toStringParam = (name, value, toString) => (name, value->Belt.Option.map(toString))
let toIntParam = (name, value) => toStringParam(name, value, Belt.Int.toString)
let toBoolParam = (name, value) => (
  name,
  switch value {
  | Some(true) => Some("true")
  | Some(false) => Some("false")
  | None => None
  },
)

module type PageParams = {
  type t
  let fromDict: Js.Dict.t<string> => t
  let toDict: t => Js.Dict.t<string>
}

module Make = (Params: PageParams) => {
  type t = Params.t
  let fromString = params =>
    params
    ->Js.String2.split("&")
    ->Belt.Array.keepMap(parseParam)
    ->Js.Dict.fromArray
    ->Params.fromDict
  let toString = param =>
    switch param->Params.toDict->dictToStrParams {
    | "" => ""
    | s => "?" ++ s
    }
}

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
    field: string,
    mode: SortMode.t,
  }
  let fromString = str =>
    switch str->Js.String2.split(":")->Belt.List.fromArray {
    | list{field, mode} => mode->SortMode.fromString->Belt.Option.map(m => {field: field, mode: m})
    | _ => None
    }
  let toString = sort => `${sort.field}:${sort.mode->SortMode.toString}`
}
