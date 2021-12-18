let sizeToString = (size: Fragments.AsteroidSize.t_size) =>
  switch size {
  | #HUGE => "Huge"
  | #LARGE => "Large"
  | #MEDIUM => "Medium"
  | #SMALL => "Small"
  }

let sizeFromString: string => option<Fragments.AsteroidSize.t_size> = str =>
  switch str->Js.String2.toLowerCase {
  | "huge" => Some(#HUGE)
  | "large" => Some(#LARGE)
  | "medium" => Some(#MEDIUM)
  | "small" => Some(#SMALL)
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
  switch str->Js.String2.toLowerCase {
  | "common" => Some(#COMMON)
  | "uncommon" => Some(#UNCOMMON)
  | "rare" => Some(#RARE)
  | "superior" => Some(#SUPERIOR)
  | "exceptional" => Some(#EXCEPTIONAL)
  | "incomparable" => Some(#INCOMPARABLE)
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
  switch str->Js.String2.toLowerCase {
  | "c" => Some(#C)
  | "ci" => Some(#CI)
  | "ic" => Some(#CI)
  | "cis" => Some(#CIS)
  | "csi" => Some(#CIS)
  | "sic" => Some(#CIS)
  | "sci" => Some(#CIS)
  | "ics" => Some(#CIS)
  | "isc" => Some(#CIS)
  | "cm" => Some(#CM)
  | "mc" => Some(#CM)
  | "cms" => Some(#CMS)
  | "csm" => Some(#CMS)
  | "msc" => Some(#CMS)
  | "mcs" => Some(#CMS)
  | "scm" => Some(#CMS)
  | "smc" => Some(#CMS)
  | "cs" => Some(#CS)
  | "sc" => Some(#CS)
  | "i" => Some(#I)
  | "m" => Some(#M)
  | "s" => Some(#S)
  | "si" => Some(#SI)
  | "is" => Some(#SI)
  | "sm" => Some(#SM)
  | "ms" => Some(#SM)
  | _ => None
  }

let bonusTypeFromString: string => option<Fragments.AsteroidBonuses.t_bonuses_type> = str =>
  switch str->Js.String2.toLowerCase {
  | "yield" => Some(#YIELD)
  | "volatile" => Some(#VOLATILE)
  | "metal" => Some(#METAL)
  | "organic" => Some(#ORGANIC)
  | "fissile" => Some(#FISSILE)
  | "rare_earth" => Some(#RARE_EARTH)
  | _ => None
  }

let bonusTypeToString = (bonusType: Fragments.AsteroidBonuses.t_bonuses_type) =>
  switch bonusType {
  | #YIELD => "yield"
  | #VOLATILE => "volatile"
  | #METAL => "metal"
  | #ORGANIC => "organic"
  | #FISSILE => "fissile"
  | #RARE_EARTH => "rare_earth"
  }

let bonusTypeToName = (bonusType: Fragments.AsteroidBonuses.t_bonuses_type) =>
  switch bonusType {
  | #YIELD => "Yield"
  | #VOLATILE => "Volatiles"
  | #METAL => "Metals"
  | #ORGANIC => "Organics"
  | #FISSILE => "Fissile"
  | #RARE_EARTH => "Rare Earth"
  }
