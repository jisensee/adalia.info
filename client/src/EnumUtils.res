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

let spectralTypeToString = (spectralType: Fragments.AsteroidType.t_spectralType) =>
  switch spectralType {
  | #C => "C"
  | #CI => "CI"
  | #CIS => "CIS"
  | #CM => "CM"
  | #CMS => "CMS"
  | #CS => "CS"
  | #I => "I"
  | #M => "M"
  | #S => "S"
  | #SI => "SI"
  | #SM => "SM"
  }

let spectralTypeFromString: string => option<Fragments.AsteroidType.t_spectralType> = str =>
  switch str {
  | "C" => Some(#C)
  | "CI" => Some(#CI)
  | "CIS" => Some(#CIS)
  | "CM" => Some(#CM)
  | "CMS" => Some(#CMS)
  | "CS" => Some(#CS)
  | "I" => Some(#I)
  | "M" => Some(#M)
  | "S" => Some(#S)
  | "SI" => Some(#SI)
  | "SM" => Some(#SM)
  | _ => None
  }
