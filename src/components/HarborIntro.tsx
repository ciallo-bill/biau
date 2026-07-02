import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BiauPortMark } from './BiauPortMark'

const INTRO_STORAGE_KEY = 'biau-port-harbor-intro:v1'
let introTriggeredThisRuntime = false

function canShowIntro() {
  if (typeof window === 'undefined') return false

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) return false

  try {
    if (window.sessionStorage.getItem(INTRO_STORAGE_KEY) === '1') return false
  } catch {
    return true
  }

  return true
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, '1')
  } catch {
    // Ignore storage failures; the intro can still play for the current visit.
  }
}

export function HarborIntro() {
  const [visible, setVisible] = useState(() => !introTriggeredThisRuntime && canShowIntro())
  const [leaving, setLeaving] = useState(false)
  const completionRef = useRef({ vessel: false, mark: false, leaving: false })

  useLayoutEffect(() => {
    if (!visible) return
    introTriggeredThisRuntime = true
    markIntroSeen()
    document.documentElement.classList.add('harbor-intro-active')

    return () => {
      document.documentElement.classList.remove('harbor-intro-active')
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    completionRef.current = { vessel: false, mark: false, leaving: false }
  }, [visible])

  if (!visible) return null

  return (
    <div
      className={`harbor-intro ${leaving ? 'is-harbor-intro-leaving' : ''}`}
      aria-hidden="true"
      onAnimationEnd={(event) => {
        if (event.currentTarget === event.target && event.animationName === 'harborIntroVeil') {
          setVisible(false)
          return
        }
        if (event.animationName === 'harborMarkLand') {
          completionRef.current.mark = true
        }
        if (event.animationName === 'harborVesselDock') {
          completionRef.current.vessel = true
        }
        if (completionRef.current.mark && completionRef.current.vessel && !completionRef.current.leaving) {
          completionRef.current.leaving = true
          event.currentTarget.classList.add('is-harbor-intro-leaving')
          setLeaving(true)
          return
        }
      }}
    >
      <div className="harbor-intro__sky" />
      <div className="harbor-intro__beacon" />
      <div className="harbor-intro__current" />
      <div className="harbor-intro__dock-light" />
      <div className="harbor-intro__wake harbor-intro__wake--a" />
      <div className="harbor-intro__wake harbor-intro__wake--b" />
      <div className="harbor-intro__vessel">
        <BiauPortMark className="harbor-intro__boat" animated />
      </div>
      <div className="harbor-intro__mark">
        <span className="harbor-intro__mark-title">BIAU PORT</span>
        <span className="harbor-intro__mark-subtitle">泊岸</span>
      </div>
    </div>
  )
}
