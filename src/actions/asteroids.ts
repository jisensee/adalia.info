'use server'
import { Address, Entity } from '@influenceth/sdk'
import { A, D, flow } from '@mobily/ts-belt'
import { getEntityName } from 'influence-typed-sdk/api'
import { db } from '@/server/db'
import { influenceApi } from '@/lib/influence-api/api'

export const getAsteroidCount = async (address: string) =>
  db.asteroid.count({
    where: { ownerAddress: Address.toStandard(address) },
  })

export const searchAsteroid = (search: string) =>
  search.length === 0
    ? influenceApi.util
        .asteroidPage({
          size: 10,
        })
        .then((r) => r.asteroids)
    : influenceApi.util
        .asteroidSearch(search)
        .then(
          flow(
            (res) => res.hits.hits,
            A.sortBy(D.prop('_score')),
            A.reverse,
            A.map(D.prop('_source'))
          )
        )

export const getAsteroidName = (asteroidId: number) =>
  influenceApi
    .entity({
      id: asteroidId,
      label: Entity.IDS.ASTEROID,
    })
    .then(getEntityName)
