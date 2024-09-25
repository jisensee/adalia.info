import { Transform, TransformCallback } from 'stream'

import { Asteroid } from '@prisma/client'
import { AsteroidService } from '@/server/asteroid-service'
import { AsteroidFilters } from '@/components/asteroid-filters/filter-params'

const csvHeader = [
  'id',
  'name',
  'ownerAddress',
  'rarity',
  'spectralType',
  'scanStatus',
  'size',
  'radius',
  'surfaceArea',
  'orbitalPeriod',
  'semiMajorAxis',
  'inclination',
  'eccentricity',
  'salePrice',
  'totalBuildings',
  'warehouses',
  'tankFarms',
  'extractors',
  'refineries',
  'bioreactors',
  'factories',
  'shipyards',
  'marketplaces',
  'spaceports',
  'habitats',
].join(',')

const toCsvLine = (asteroid: Asteroid) =>
  [
    asteroid.id,
    asteroid.name,
    asteroid.ownerAddress ?? '',
    asteroid.rarity ?? '',
    asteroid.spectralType,
    asteroid.scanStatus,
    asteroid.size,
    asteroid.radius,
    asteroid.surfaceArea,
    asteroid.orbitalPeriod,
    asteroid.semiMajorAxis,
    asteroid.inclination,
    asteroid.eccentricity,
    asteroid.salePrice ?? '',
    asteroid.totalBuildings ?? '',
    asteroid.warehouses ?? '',
    asteroid.tankFarms ?? '',
    asteroid.extractors ?? '',
    asteroid.refineries ?? '',
    asteroid.bioreactors ?? '',
    asteroid.factories ?? '',
    asteroid.shipyards ?? '',
    asteroid.marketplaces ?? '',
    asteroid.spaceports ?? '',
    asteroid.habitats ?? '',
  ].join(',')

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const filters = JSON.parse(params.get('filter') ?? '{}') as AsteroidFilters
  const format = params.get('format') ?? 'csv'

  const stream = await AsteroidService.getExport(filters, (a) =>
    format === 'json' ? JSON.stringify(a) + '\n' : toCsvLine(a) + '\n'
  )

  const prepend =
    format === 'json'
      ? new PrependStream('[', ']')
      : new PrependStream(csvHeader + '\n', '')
  stream.pipe(prepend)

  return new Response(prepend as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="adalia.info.export.${format}"`,
    },
  })
}

class PrependStream extends Transform {
  private prepended: boolean = false
  constructor(
    private prefix: string,
    private suffix: string
  ) {
    super()
  }

  _transform(
    chunk: unknown,
    _encoding: BufferEncoding,
    callback: TransformCallback
  ): void {
    if (!this.prepended) {
      // Prepend the prefix only once
      this.push(this.prefix)
      this.prepended = true
    }
    this.push(chunk)
    callback()
  }

  _flush(callback: TransformCallback) {
    this.push(this.suffix)
    callback()
  }
}
