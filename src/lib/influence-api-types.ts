import { AsteroidBonusType, AsteroidRarity, Blockchain } from '@prisma/client'
import {
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
  Prisma,
} from '@prisma/client'

import {
  OrbitalElements,
  AdalianOrbit,
  Asteroid,
  BonusType,
  Rarity,
  Process,
  Product,
  Building,
} from '@influenceth/sdk'
import { z } from 'zod'

export interface SnapshotAsteroid {
  i: number
  orbital: OrbitalElements
  r: number
  spectralType: number
  scanStatus: number
  purchaseOrder: number
}

export type ApiAsteroid = {
  id: number
  Name?: { name: string } | null
  Celestial: {
    celestialType: number
    bonuses: number
    radius: number
    scanStatus: number
  }
  Nft: {
    owner?: string
    chain?: string
  }
}

export type InventoryContent = {
  product: number
  amount: number
}

export type Inventory = {
  contents: InventoryContent[]
  inventoryType: number
  mass: number
  slot: number
  status: number
  reservedMass: number
  reservedVolume: number
  volume: number
}

export type InventoryResponseItem = {
  id: number
  label: number
  uuid: string
  Inventories: Inventory[]
}

export const convertSnapshotAsteroid = (
  snapshotAsteroid: SnapshotAsteroid
): Prisma.AsteroidCreateManyInput => {
  const orbit = new AdalianOrbit(snapshotAsteroid.orbital)
  const radius = snapshotAsteroid.r
  const surfaceArea = 4 * Math.PI * (radius / 1000) ** 2

  return {
    id: snapshotAsteroid.i,
    radius: snapshotAsteroid.r,
    surfaceArea,
    salePrice: calculatePrice(surfaceArea),
    orbitalPeriod: orbit.getPeriod(),
    eccentricity: snapshotAsteroid.orbital.e,
    inclination: snapshotAsteroid.orbital.i * (180 / Math.PI),
    semiMajorAxis: snapshotAsteroid.orbital.a,
    spectralType: convertSpectralType(snapshotAsteroid.spectralType),
    size: getSize(snapshotAsteroid.r),
    scanStatus: convertScanStatus(snapshotAsteroid.scanStatus),
    purchaseOrder:
      snapshotAsteroid.purchaseOrder > 0
        ? snapshotAsteroid.purchaseOrder
        : undefined,
  }
}

const convertSpectralType = (spectralType: number) => {
  switch (Asteroid.getSpectralType(spectralType)) {
    case 'C':
      return AsteroidSpectralType.C
    case 'S':
      return AsteroidSpectralType.S
    case 'M':
      return AsteroidSpectralType.M
    case 'I':
      return AsteroidSpectralType.I
    case 'Si':
      return AsteroidSpectralType.SI
    case 'Sm':
      return AsteroidSpectralType.SM
    case 'Cs':
      return AsteroidSpectralType.CS
    case 'Ci':
      return AsteroidSpectralType.CI
    case 'Cm':
      return AsteroidSpectralType.CM
    case 'Cms':
      return AsteroidSpectralType.CMS
    case 'Cis':
    default:
      return AsteroidSpectralType.CIS
  }
}

const getSize = (radius: number) => {
  switch (Asteroid.getSize(radius)) {
    case 'Small':
      return AsteroidSize.SMALL
    case 'Medium':
      return AsteroidSize.MEDIUM
    case 'Large':
      return AsteroidSize.LARGE
    case 'Huge':
    default:
      return AsteroidSize.HUGE
  }
}

export const convertScanStatus = (scanStatus: number) => {
  switch (scanStatus) {
    case 1:
      return AsteroidScanStatus.ORBITAL_SCAN
    case 2:
      return AsteroidScanStatus.LONG_RANGE_SCAN
    default:
      return AsteroidScanStatus.UNSCANNED
  }
}

export const convertRarity = (apiRarity: Rarity) => {
  switch (apiRarity) {
    case 'Common':
      return AsteroidRarity.COMMON
    case 'Uncommon':
      return AsteroidRarity.UNCOMMON
    case 'Rare':
      return AsteroidRarity.RARE
    case 'Superior':
      return AsteroidRarity.SUPERIOR
    case 'Exceptional':
      return AsteroidRarity.EXCEPTIONAL
    case 'Incomparable':
    default:
      return AsteroidRarity.INCOMPARABLE
  }
}

export const convertBonusType = (t: BonusType) => {
  switch (t) {
    case 'yield':
      return AsteroidBonusType.YIELD
    case 'fissile':
      return AsteroidBonusType.FISSILE
    case 'metal':
      return AsteroidBonusType.METAL
    case 'organic':
      return AsteroidBonusType.ORGANIC
    case 'rareearth':
      return AsteroidBonusType.RARE_EARTH
    case 'volatile':
    default:
      return AsteroidBonusType.VOLATILE
  }
}

export const getApiBonuses = ({
  Celestial: { bonuses, celestialType },
}: ApiAsteroid) =>
  bonuses
    ? Asteroid.getBonuses(bonuses, celestialType).filter((b) => b.level > 0)
    : []

export const convertChain = (chain?: string) => {
  switch (chain) {
    case 'ETHEREUM':
      return Blockchain.ETHEREUM
    case 'STARKNET':
      return Blockchain.STARKNET
  }
}

export const calculatePrice = (surfaceArea: number) => {
  const basePrice = 0.0299
  const lotPrice = 0.00092

  return basePrice + surfaceArea * lotPrice
}

const idsSchema = z.object({
  id: z.number(),
  label: z.number(),
  uuid: z.string(),
})
const timestamp = z.number().transform((v) => new Date(v * 1000))

const controlSchema = z.object({
  controller: idsSchema,
})

const nameSchema = z.object({
  name: z.string(),
})

const nftSchema = z.object({
  owners: z.object({
    ethereum: z.string().nullable(),
    starknet: z.string().nullable(),
  }),
})

const inventorySchema = z.object({
  contents: z.array(
    z.object({
      product: z.number(),
      amount: z.number(),
    })
  ),
  inventoryType: z.number(),
})

const locationSchema = z
  .object({
    location: idsSchema,
    locations: z.array(idsSchema),
  })
  .optional()

const processorSchema = z.object({
  destinationSlot: z.number(),
  finishTime: timestamp,
  outputProduct: z.number().transform((v) => Product.getType(v)),
  processorType: z.number(),
  recipes: z.number(),
  runningProcess: z.number().transform((v) => Process.getType(v)),
  secondaryEff: z.number(),
  slot: z.number(),
  status: z.number(),
  destination: idsSchema.nullish(),
})

const crewSchema = z.object({
  actionTarget: idsSchema.nullish(),
  readyAt: timestamp.nullish(),
})

const extractorSchema = z.object({
  destination: idsSchema.nullish(),
  extractorType: z.number(),
  finishTime: timestamp,
  yield: z.number(),
  outputProduct: z.number().transform((v) => Product.getType(v)),
})

const buildingSchema = z.object({
  buildingType: z.number().transform((v) => Building.getType(v)),
  finishTime: timestamp,
  status: z.number(),
})

export type EntityControl = z.infer<typeof controlSchema>
export type EntityName = z.infer<typeof nameSchema>
export type EntityNft = z.infer<typeof nftSchema>
export type EntityInventory = z.infer<typeof inventorySchema>
export type EntityLocation = z.infer<typeof locationSchema>
export type EntityProcessor = z.infer<typeof processorSchema>
export type EntityCrew = z.infer<typeof crewSchema>
export type EntityExtractor = z.infer<typeof extractorSchema>
export type EntityBuilding = z.infer<typeof buildingSchema>

const entitySchema = z.object({
  id: z.number(),
  label: z.number(),
  uuid: z.string(),
  Control: controlSchema.nullish(),
  Name: nameSchema.nullish(),
  Nft: nftSchema.nullish(),
  Inventories: z.array(inventorySchema).default([]),
  Location: locationSchema.nullish(),
  Processors: z.array(processorSchema).default([]),
  Crew: crewSchema.nullish(),
  Extractors: z.array(extractorSchema).default([]),
  Building: buildingSchema.nullish(),
})

export const entityResponseSchema = z.array(entitySchema)

export type EntityResponse = z.infer<typeof entityResponseSchema>
