declare module 'influence-utils' {
  const enum SpectralType {
    C = 'C',
    Cm = 'Cm',
    Ci = 'Ci',
    Cs = 'Cs',
    Cms = 'Cms',
    Cis = 'Cis',
    S = 'S',
    Sm = 'Sm',
    Si = 'Si',
    M = 'M',
    I = 'I',
  }

  const enum Rarity {
    Common = 'Common',
    Uncommon = 'Uncommon',
    Rare = 'Rare',
    Superior = 'Superior',
    Exceptional = 'Exceptional',
    Incomparable = 'Incomparable',
  }

  const enum Size {
    Small = 'Small',
    Medium = 'Medium',
    Large = 'Large',
    Huge = 'Huge',
  }
  export { SpectralType, Rarity, Size }
  export interface OrbitalElements {
    a: number
    e: number
    i: number
    o: number
    w: number
    m: number
  }

  export class KeplerianOrbit {
    constructor(elements: OrbitalElements)

    getPeriod(): number
  }

  export function toSpectralType(num: number): SpectralType

  export function toSize(radius: number): Size
}
