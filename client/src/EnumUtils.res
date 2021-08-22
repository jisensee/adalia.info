let sizeToString = (size: Fragments.AsteroidSize.t_size) =>
  switch size {
  | #HUGE => "Huge"
  | #LARGE => "Large"
  | #MEDIUM => "Medium"
  | #SMALL => "Small"
  }

let sizeFromString: string => option<Fragments.AsteroidSize.t_size> = str =>
  switch str {
  | "Huge" => Some(#HUGE)
  | "Large" => Some(#LARGE)
  | "Medium" => Some(#MEDIUM)
  | "Small" => Some(#SMALL)
  | _ => None
  }

let rarityToString = (rarity: Fragments.AsteroidRarity.t_rarity) =>
  switch rarity {
  | #COMMON => "Common"
  | #UNCOMMON => "Uncommon"
  | #RARE => "Rare"
  | #SUPERIOR => "Superior"
  | #EXCEPTIONAL => "Exceptional"
  | #INCOMPARABLE => "Incomparable"
  }

let rarityFromString: string => option<Fragments.AsteroidRarity.t_rarity> = str =>
  switch str {
  | "Common" => Some(#COMMON)
  | "Uncommon" => Some(#UNCOMMON)
  | "Rare" => Some(#RARE)
  | "Superior" => Some(#SUPERIOR)
  | "Exceptional" => Some(#EXCEPTIONAL)
  | "Incomparable" => Some(#INCOMPARABLE)
  | _ => None
  }
