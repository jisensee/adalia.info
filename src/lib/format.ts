import {
  AsteroidRarity,
  AsteroidScanStatus,
  AsteroidSize,
  AsteroidSpectralType,
} from '@prisma/client'
import { Order, Processor, Product } from '@influenceth/sdk'
import { Constants } from './constants'

const numberFormatter =
  (maxDecimals: number, unit?: string) => (value: number) =>
    value.toLocaleString(undefined, {
      maximumFractionDigits: maxDecimals,
    }) + (unit ? ' ' + unit : '')

const formatKgs = (kgs: number) => {
  if (kgs >= 1_000_000_000) {
    return `${(kgs / 1_000_000_000).toFixed(2)}Mt`
  }
  if (kgs >= 1_000_000) {
    return `${(kgs / 1_000_000).toFixed(2)}kt`
  }
  if (kgs >= 1_000) {
    return `${(kgs / 1000).toFixed(1)}t`
  }
  return `${kgs.toFixed(0)}kg`
}

const formatBigNumber = (value: number) => {
  const absValue = Math.abs(value)
  const formatNumber = (v: number, maxDecimals = 4) =>
    v.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxDecimals,
      useGrouping: false,
    })

  if (absValue >= 1_000_000_000) {
    return `${formatNumber(value / 1_000_000_000, 2)}B`
  }
  if (absValue >= 1_000_000) {
    return `${formatNumber(value / 1_000_000, 2)}M`
  }
  if (absValue >= 1_000) {
    return `${formatNumber(value / 1_000, 2)}K`
  }
  return formatNumber(value)
}

export const Format = {
  bigNumber: formatBigNumber,
  radius: numberFormatter(0, Constants.RADIUS_UNIT),
  surfaceArea: numberFormatter(0, Constants.SURFACE_AREA_UNIT),
  orbitalPeriod: numberFormatter(0, Constants.ORBITAL_PERIOD_UNIT),
  inclination: numberFormatter(2, Constants.INCLINATION_UNIT),
  semiMajorAxis: numberFormatter(3, Constants.SEMI_MAJOR_AXIS_UNIT),
  salePrice: numberFormatter(3, Constants.SALE_PRICE_UNIT),
  eccentricity: numberFormatter(3),
  distance: (distance: number) => `${Math.round(distance)} km`,
  days: (days: number) => `${days} day${days === 1 ? '' : 's'}`,
  ethAddress: (address: string, shownCharacters: number) => {
    const start = address.slice(0, shownCharacters + 2)
    const end = address.slice(-shownCharacters)
    return `${start}...${end}`
  },
  asteroidRarityClassName: (rarity: AsteroidRarity) => {
    switch (rarity) {
      case AsteroidRarity.COMMON:
        return 'text-common'
      case AsteroidRarity.UNCOMMON:
        return 'text-uncommon'
      case AsteroidRarity.RARE:
        return 'text-rare'
      case AsteroidRarity.SUPERIOR:
        return 'text-superior'
      case AsteroidRarity.EXCEPTIONAL:
        return 'text-exceptional'
      case AsteroidRarity.INCOMPARABLE:
        return 'text-incomparable'
    }
  },
  asteroidSize: (size: AsteroidSize) =>
    size[0]?.toUpperCase() + size.toLowerCase().slice(1),
  asteroidRarity: (rarity: AsteroidRarity) =>
    rarity[0]?.toUpperCase() + rarity.toLowerCase().slice(1),
  asteroidSpectralType: (type: AsteroidSpectralType) => type.toString(),
  asteroidScanStatus: (status: AsteroidScanStatus) => {
    switch (status) {
      case AsteroidScanStatus.UNSCANNED:
        return 'Unscanned'
      case AsteroidScanStatus.LONG_RANGE_SCAN:
        return 'Long range scan'
      case AsteroidScanStatus.ORBITAL_SCAN:
        return 'Orbital scan'
    }
  },
  asteroidScanBonus: (scanBonus: number | string) => scanBonus + 'x',
  purchaseOrder: numberFormatter(0),
  percentage: (value: number, maxDecimals = 0) =>
    numberFormatter(maxDecimals, '%')(value * 100),
  remainingTime: (remainingSeconds: number) => {
    if (remainingSeconds < 60) return `${remainingSeconds} s`
    if (remainingSeconds < 3600) {
      const seconds = remainingSeconds % 60
      const minutes = Math.floor(remainingSeconds / 60)
      return `${minutes}m ${seconds}s`
    }
    if (remainingSeconds < 3600 * 24) {
      const minutes = Math.floor(remainingSeconds / 60) % 60
      const hours = Math.floor(remainingSeconds / 3600)
      return `${hours}h ${minutes}m`
    }
    const hours = Math.floor(remainingSeconds / 3600) % 24
    const days = Math.floor(remainingSeconds / (3600 * 24))
    return `${days}d ${hours}h`
  },
  processor: (processorType: number) => {
    switch (processorType) {
      case Processor.IDS.CONSTRUCTION:
        return 'Building Construction'
      case Processor.IDS.REFINERY:
        return 'Refinery'
      case Processor.IDS.FACTORY:
        return 'Factory'
      case Processor.IDS.BIOREACTOR:
        return 'Bioreactor'
      case Processor.IDS.SHIPYARD:
        return 'Shipyard'
      case Processor.IDS.DRY_DOCK:
        return 'Dry Dock'
      default:
        return ''
    }
  },
  mass: (mass: number) => formatKgs(mass),
  productAmount: (product: number, amount: number) => {
    const productType = Product.getType(product)
    if (amount === 0) {
      return productType.name
    }
    if (productType.isAtomic) {
      return `${amount.toLocaleString()} ${productType.name}`
    }
    return `${formatKgs(amount)} ${productType.name}`
  },
  swayAmount: (amount: number, noDecimals = false) =>
    formatBigNumber(noDecimals ? Math.round(amount / 1e6) : amount / 1e6),
  orderType: (orderType: number) =>
    orderType === Order.IDS.LIMIT_SELL ? 'Limit Sell' : 'Limit Buy',
  abundance: (abundance: number) => `${(abundance * 100).toFixed(1)}%`,
  lotIndex: (lotIndex: number) => '#' + lotIndex.toLocaleString('en'),
}
