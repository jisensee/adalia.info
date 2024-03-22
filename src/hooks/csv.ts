import { stringify } from 'csv-stringify/sync'

export const useCsvDownload = <Input, Output>(
  filename: string,
  data: Input[],
  transform: (data: Input) => Output
) => {
  const download = () => {
    const csv = stringify(data.map(transform), { header: true })
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return download
}
