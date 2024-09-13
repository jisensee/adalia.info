import { ToolList } from '@/components/tool-list'

export default function ToolsPage() {
  return (
    <div className='space-y-3 p-3'>
      <h1>Tools</h1>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <ToolList />
      </div>
    </div>
  )
}
