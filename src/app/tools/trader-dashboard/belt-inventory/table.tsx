'use client'

import { useEffect, useState } from 'react'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQueryStates } from 'nuqs'
import { Product, ProductType } from '@influenceth/sdk'
import { beltProductionParams } from '../params'
import { columns } from './table-columns'

import { BeltInventoryItem } from './api'
import { DataTable } from '@/components/ui/data-table'
import { useCsvDownload } from '@/hooks/csv'

type BeltInventoryTableProps = {
  products: BeltInventoryItem[]
}

export const BeltInventoryTable = ({ products }: BeltInventoryTableProps) => {
  const [data, setData] = useState(products)
  const [{ productSearch }] = useQueryStates(beltProductionParams)

  useEffect(() => {
    if (productSearch) {
      setData(
        products.filter((p) =>
          doesProductMatch(Product.getType(p.product), productSearch)
        )
      )
    } else {
      setData(products)
    }
  }, [productSearch, products])

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

  const onCsvExport = useCsvDownload('belt-inventory.csv', data, (row) => ({
    product: Product.getType(row.product).name,
    amount: row.amount,
    containingWarehouses: row.containingWarehouses,
    warehouseAverage: row.amount / row.containingWarehouses,
    floorPrice: row.floorPrice ? row.floorPrice : '',
    marketValue: row.floorPrice ? row.floorPrice * row.amount : '',
  }))

  return <DataTable table={table} onCsvExport={onCsvExport} />
}

const doesProductMatch = (product: ProductType, filter: string) =>
  [product.name, product.category, product.classification].some((s) =>
    s.toLowerCase().includes(filter.toLowerCase())
  )
