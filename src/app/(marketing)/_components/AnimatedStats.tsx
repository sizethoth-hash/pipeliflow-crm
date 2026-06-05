'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  prefix: string
  value: number
  decimals: number
  suffix: string
  label: string
}

const stats: Stat[] = [
  { prefix: '+', value: 47, decimals: 0, suffix: '%', label: 'em taxa de conversão' },
  { prefix: '',  value: 3.2, decimals: 1, suffix: 'x', label: 'leads qualificados' },
  { prefix: '-', value: 62, decimals: 0, suffix: '%', label: 'no ciclo de venda' },
  { prefix: '',  value: 1200, decimals: 0, suffix: '+', label: 'times usando hoje' },
]

// easeOutExpo — arranca rápido e desacelera no final (efeito de dial)
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

function useCountUp(target: number, decimals: number, duration: number, active: boolean) {
  const [display, setDisplay] = useState(0)
  const raf = useRef<number>(0)

  useEffect(() => {
    if (!active) return
    const start = performance.now()

    function tick(now: number) {
      const elapsed = Math.min((now - start) / duration, 1)
      const eased = easeOutExpo(elapsed)
      setDisplay(eased * target)
      if (elapsed < 1) {
        raf.current = requestAnimationFrame(tick)
      } else {
        setDisplay(target)
      }
    }

    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [active, target, duration])

  return decimals > 0 ? display.toFixed(decimals) : Math.round(display).toString()
}

function StatItem({ stat, active }: { stat: Stat; active: boolean }) {
  // Último número é maior (1200) — animação um pouco mais longa para dar peso
  const duration = stat.value >= 100 ? 1600 : 1200
  const count = useCountUp(stat.value, stat.decimals, duration, active)

  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <span
        className="text-3xl font-extrabold tabular-nums text-white sm:text-4xl"
        aria-label={`${stat.prefix}${stat.value}${stat.suffix} ${stat.label}`}
      >
        {stat.prefix}{count}{stat.suffix}
      </span>
      <span className="text-sm text-slate-500" aria-hidden="true">{stat.label}</span>
    </div>
  )
}

export function AnimatedStats() {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="mt-20 grid grid-cols-2 gap-6 sm:grid-cols-4">
      {stats.map((stat) => (
        <StatItem key={stat.label} stat={stat} active={active} />
      ))}
    </div>
  )
}
