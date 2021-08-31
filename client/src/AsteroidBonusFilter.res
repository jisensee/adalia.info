open Belt

module Mode = {
  type t = [#AND | #OR]
  let toString = t =>
    switch t {
    | #AND => "and"
    | #OR => "or"
    }
  let fromString = s =>
    switch s {
    | "and" => Some(#AND)
    | "or" => Some(#OR)
    | _ => None
    }
}

module Condition = {
  type t = {
    type_: option<Fragments.AsteroidBonuses.t_bonuses_type>,
    levels: array<int>,
  }
  let levelsToString = l => l->Array.map(Int.toString)->Js.Array2.joinWith(",")
  let levelsFromString = s => s->Js.String2.split(",")->Array.keepMap(Int.fromString)
  let toString = t => {
    let type_ = switch t.type_ {
    | None => ""
    | Some(t) => t->EnumUtils.bonusTypeToString
    }
    let levels = t.levels->levelsToString
    `${type_};${levels}`
  }

  let filterOutEmpty = c =>
    switch (c.type_, c.levels->List.fromArray) {
    | (None, list{}) => None
    | _ => Some(c)
    }

  let fromString = s =>
    switch s->Js.String2.split(";")->List.fromArray {
    | list{type_, levels} =>
      {
        type_: type_->EnumUtils.bonusTypeFromString,
        levels: levels->levelsFromString,
      }->Some
    | _ => None
    }->Option.flatMap(filterOutEmpty)
}

// Represented for example as "and|fissile;1,2|volatile"
type t = {
  mode: Mode.t,
  conditions: array<Condition.t>,
}

let toString = t => {
  let mode = t.mode->Mode.toString
  let conditions = t.conditions->Array.map(Condition.toString)->Js.Array2.joinWith("|")
  `${mode}|${conditions}`
}

let fromString = s => {
  switch s->Js.String2.split("|")->List.fromArray {
  | list{mode, ...conditions} => {
      let m = mode->Mode.fromString
      let c = conditions->List.keepMap(Condition.fromString)->List.toArray
      switch m {
      | None => None
      | Some(m) =>
        {
          mode: m,
          conditions: c,
        }->Some
      }
    }
  | _ => None
  }
}
