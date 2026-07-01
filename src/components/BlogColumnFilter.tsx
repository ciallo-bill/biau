import { blogColumnMeta, type BlogColumn } from '../data/blog'

interface BlogColumnFilterProps {
  columns: BlogColumn[]
  selectedColumn: BlogColumn | 'all'
  onSelect: (column: BlogColumn | 'all') => void
}

export function BlogColumnFilter({ columns, selectedColumn, onSelect }: BlogColumnFilterProps) {
  return (
    <div className="blog-column-filter">
      <button
        className={`filter-btn ${selectedColumn === 'all' ? 'active' : ''}`}
        onClick={() => onSelect('all')}
      >
        <span className="filter-btn-title">全部</span>
        <span className="filter-btn-subtitle">All Notes</span>
      </button>
      {columns.map((column) => {
        const meta = blogColumnMeta[column]
        return (
          <button
            key={column}
            className={`filter-btn ${selectedColumn === column ? 'active' : ''}`}
            onClick={() => onSelect(column)}
          >
            <span className="filter-btn-title">{meta.titleZh}</span>
            <span className="filter-btn-subtitle">{meta.titleEn}</span>
          </button>
        )
      })}
    </div>
  )
}
