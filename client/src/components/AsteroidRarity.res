@react.component
let make = (~rarity: string) => {
  let color = switch EnumUtils.rarityFromString(rarity) {
  | None | Some(#COMMON) => ""
  | Some(#UNCOMMON) => "text-cyan"
  | Some(#RARE) => "text-blue"
  | Some(#SUPERIOR) => "text-purple"
  | Some(#EXCEPTIONAL) => "text-orange"
  | Some(#INCOMPARABLE) => "text-yellow"
  }
  <span className=color> {rarity->React.string} </span>
}
