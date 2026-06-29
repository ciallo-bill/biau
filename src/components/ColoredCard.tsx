import type { HeroProject } from '../data/hero'
import { IconExternalOpen } from '@douyinfe/semi-icons'

interface ColoredCardProps {
  project: HeroProject
  index: number
  onClick: () => void
}

export function ColoredCard({ project, index, onClick }: ColoredCardProps) {
  const number = String((index % 5) + 1).padStart(2, '0')

  return (
    <button
      type="button"
      className={`carousel-card ${project.accent}`}
      data-port-index={number}
      aria-label={`${project.title}：${project.description}${project.external ? '，外部打开' : ''}`}
      onClick={() => {
        onClick()
      }}
    >
      <div>
        <strong>{project.title}</strong>
        <p className="desc">
          {project.description}
          <span className="literary-title"> ——{project.poetry}</span>
        </p>
      </div>
      <em className="carousel-action">
        <span>{project.action}</span>
        {project.external && <IconExternalOpen aria-hidden />}
      </em>
    </button>
  )
}
