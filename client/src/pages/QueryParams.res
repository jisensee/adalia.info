open Belt

module type ParamType = {
  type t
  let toString: t => string
  let fromString: string => option<t>
}

module MakeParam = (Type: ParamType) => {
  let toParam = (name, value) => value->Option.map(v => (name, v->Type.toString))
  let fromDict = (dict, name) => dict->Js.Dict.get(name)->Option.flatMap(Type.fromString)
}

module IntParam = MakeParam({
  type t = int
  let toString = Int.toString
  let fromString = Int.fromString
})

module BoolParam = MakeParam({
  type t = bool
  let toString = b =>
    switch b {
    | true => "true"
    | false => "false"
    }
  let fromString = s =>
    switch s {
    | "true" => true->Some
    | _ => false->Some
    }
})

module FloatRangeParam = MakeParam({
  type t = (float, float)
  let toString = ((a, b)) => `${a->Float.toString}-${b->Float.toString}`
  let fromString = range =>
    switch range->Js.String2.split("-")->List.fromArray {
    | list{from, to_} =>
      Float.fromString(from)->Option.flatMap(f => Float.fromString(to_)->Option.map(t => (f, t)))
    | _ => None
    }
})

module StringListParam = MakeParam({
  type t = array<string>
  let toString = (a: t) => a->Js.Array2.joinWith("")
  let fromString = s => s->Js.String2.split(_, ",")->Some
})

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

type sortingParam = {
  field: string,
  mode: SortMode.t,
}
module SortingParamType = {
  type t = sortingParam
  let toString = sort => `${sort.field}:${sort.mode->SortMode.toString}`
  let fromString = str =>
    switch str->Js.String2.split(":")->List.fromArray {
    | list{field, mode} => mode->SortMode.fromString->Option.map(m => {field: field, mode: m})
    | _ => None
    }
}
module SortingParam = MakeParam(SortingParamType)

module SpectralTypesParam = MakeParam({
  type t = array<SpectralType.t>
  let toString = arr => arr->Array.map(SpectralType.toString)->Array.joinWith(",", v => v)
  let fromString = s => s->Js.String2.split(",")->Array.keepMap(SpectralType.fromString)->Some
})

module type PageParams = {
  type t
  let fromDict: Js.Dict.t<string> => t
  let toValues: t => array<option<(string, string)>>
}

let parseParam = param =>
  switch param->Js.String2.split("=")->List.fromArray {
  | list{key, value} => Some((key, value))
  | _ => None
  }
let dictToStrParams = dict =>
  dict->Js.Dict.entries->Array.map(((key, value)) => `${key}=${value}`)->Array.joinWith("&", s => s)

module Make = (Params: PageParams) => {
  type t = Params.t
  let fromString = params =>
    params->Js.String2.split("&")->Array.keepMap(parseParam)->Js.Dict.fromArray->Params.fromDict
  let toString = param =>
    switch param
    ->Params.toValues
    ->Array.keepMap(opValues => opValues)
    ->Js.Dict.fromArray
    ->dictToStrParams {
    | "" => ""
    | s => "?" ++ s
    }
}
