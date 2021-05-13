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

module type PageParam = {
  type t
  let fromDict: Js.Dict.t<string> => t
  let toDict: t => Js.Dict.t<string>
}

module Make = (Param: PageParam) => {
  type t = Param.t
  let fromString = params =>
    params->Js.String2.split("&")->Belt.Array.keepMap(parseParam)->Js.Dict.fromArray->Param.fromDict
  let toString = param => param->Param.toDict->dictToStrParams
}
