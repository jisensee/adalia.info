declare module '@influenceth/sdk' {
  export type Size = 'Small' | 'Medium' | 'Large' | 'Huge'
  export type SpectralType =
    | 'C'
    | 'S'
    | 'M'
    | 'I'
    | 'Si'
    | 'Sm'
    | 'Cs'
    | 'Ci'
    | 'Cm'
    | 'Cms'
    | 'Cis'

  export type Rarity =
    | 'Common'
    | 'Uncommon'
    | 'Rare'
    | 'Superior'
    | 'Exceptional'
    | 'Incomparable'

  export type BonusType =
    | 'yield'
    | 'fissile'
    | 'metal'
    | 'organic'
    | 'rareearth'
    | 'volatile'

  export type Bonus = {
    position: number
    name: string
    level: 1 | 2 | 3
    modifier: number
    type: BonusType
  }

  export interface OrbitalElements {
    a: number
    e: number
    i: number
    o: number
    w: number
    m: number
  }

  export class AdalianOrbit {
    constructor(orbitalElements: OrbitalElements)

    getPeriod(): number
  }

  export class Asteroid {
    static getSize(radius: number): Size
    static getRarity(bonuses: Bonus[]): Rarity
    static getSpectralType(spectralTypeId: number): SpectralType
    static getBonuses(packedBonuses: number, spectralTypeId: number): Bonus[]
  }

  export const Entity: {
    packEntity: (params: { id: number; label: number }) => string
    unpackEntity: (uuid: string) => { id: number; label: number }
    IDS: {
      CREW: number
      CREWMATE: number
      ASTEROID: number
      LOT: number
      BUILDING: number
      SHIP: number
      DEPOSIT: number
      ORDER: number
      DELIVERY: number
      SPACE: number
    }
  }

  export const Lot: {
    toId: (asteroidId: number, lotIndex: number) => number
    toIndex: (lotId: number) => number
  }

  export type ProductType = {
    i: number
    name: string
    classification: string
    category: string
    massPerUnit: number
    isAtomic: boolean
  }

  export const Product: {
    getType: (productId: number) => ProductType
    IDS: Record<string, number>
  }

  export type ProcessType = {
    i: number
    name: string
    processorType: ProcessorType
    inputs: Record<number, number>
    outputs: Record<number, number>
  }

  export const Process: {
    TYPES: Record<number, ProcessType>

    getType: (processId: number) => ProcessType
    getProcessingTime: (
      processId: number,
      recipes: number,
      totalBonus: number
    ) => number
    getSetupTime: (processId: number, totalBonus: number) => number
  }

  export const Processor: {
    IDS: {
      REFINERY: number
      FACTORY: number
      BIOREACTOR: number
      SHIPYARD: number
      DRY_DOCK: number
    }
  }

  export type BuildingType = {
    i: number
    name: string
    description: string
  }
  export const Building: {
    CONSTRUCTION_STATUSES: {
      UNPLANNED: number
      PLANNED: number
      UNDER_CONSTRUCTION: number
      OPERATIONAL: number
    }
    IDS: {
      EMPTY_LOT: number
      WAREHOUSE: number
      EXTRACTOR: number
      REFINERY: number
      BIOREACTOR: number
      FACTORY: number
      SHIPYARD: number
      SPACEPORT: number
      MARKETPLACE: number
      HABITAT: number9
    }
    getType: (buildingId: number) => BuildingType
  }
}
