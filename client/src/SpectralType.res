type t = [#C | #CI | #CIS | #CM | #CMS | #CS | #I | #M | #S | #SI | #SM]

let toString = (t: t) => (t :> string)
let fromString: string => option<t> = s =>
  switch s {
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
