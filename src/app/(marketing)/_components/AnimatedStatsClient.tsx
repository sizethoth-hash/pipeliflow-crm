'use client'

import dynamic from 'next/dynamic'

const AnimatedStatsInner = dynamic(() => import('./AnimatedStats').then((m) => m.AnimatedStats), {
  ssr: false,
})

export function AnimatedStatsClient() {
  return <AnimatedStatsInner />
}
