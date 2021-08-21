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
