'use client'

import { FC, useEffect, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { ProductType } from '@influenceth/sdk'
import { ProductProduction } from '../api'
import { beltProductionParams } from '../params'
import { columns } from './table-columns'

import { DataTable } from '@/components/ui/data-table'
import { useCsvDownload } from '@/hooks/csv'

type BeltProductionTableProps = {
  productions: ProductProduction[]
}

export const BeltProductionTable: FC<BeltProductionTableProps> = ({
  productions,
}) => {
  const [data, setData] = useState(productions)
  const [{ productSearch }] = useQueryStates(beltProductionParams)

  useEffect(() => {
    if (productSearch) {
      setData(
        productions.filter((p) => doesProductMatch(p.product, productSearch))
      )
    } else {
      setData(productions)
    }
  }, [productSearch, productions])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
      sorting: [{ id: 'product', desc: true }],
    },
  })

  const onCsvExport = useCsvDownload('belt-production.csv', data, (row) => ({
    product: row.product.name,
    amount: row.amount,
    producers: row.producers,
    producerAverage: row.amount / row.producers,
    recipes: row.recipes,
    marketValue: row.floorPrice / 1e6,
  }))

  return <DataTable table={table} onCsvExport={onCsvExport} />
}

const doesProductMatch = (product: ProductType, filter: string) =>
  [product.name, product.category, product.classification].some((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  )
