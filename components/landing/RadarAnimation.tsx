'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const RadarAnimation = () => {
  const [activeDots, setActiveDots] = useState<number[]>([])

  const dots = [
    { x: 20, y: 30 }, { x: 45, y: 15 }, { x: 70, y: 25 },
    { x: 15, y: 60 }, { x: 35, y: 50 }, { x: 55, y: 45 },
    { x: 80, y: 55 }, { x: 25, y: 80 }, { x: 60, y: 75 },
    { x: 85, y: 35 }, { x: 40, y: 70 }, { x: 75, y: 80 },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      const randomDots = dots
        .map((_, i) => i)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3 + Math.floor(Math.random() * 3))
      setActiveDots(randomDots)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="15" fill="none" stroke="hsl(0 0% 85%)" strokeWidth="0.3" />
        <circle cx="50" cy="50" r="3" fill="hsl(0 0% 10%)" />
        
        <motion.line
          x1="50"
          y1="50"
          x2="50"
          y2="5"
          stroke="hsl(0 0% 40%)"
          strokeWidth="0.5"
          style={{ originX: '50%', originY: '50%' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />

        {dots.map((dot, i) => (
          <g key={i}>
            {activeDots.includes(i) && (
              <motion.line
                x1="50"
                y1="50"
                x2={dot.x}
                y2={dot.y}
                stroke="hsl(0 0% 30%)"
                strokeWidth="0.3"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}
            
            <motion.circle
              cx={dot.x}
              cy={dot.y}
              r={activeDots.includes(i) ? 2 : 1}
              fill={activeDots.includes(i) ? 'hsl(0 0% 20%)' : 'hsl(0 0% 60%)'}
              animate={activeDots.includes(i) ? {
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              } : {}}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </g>
        ))}
      </svg>

      <div className="absolute inset-0 pointer-events-none">
        {dots.map((dot, i) => (
          activeDots.includes(i) && (
            <motion.div
              key={`label-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{
                left: `${dot.x}%`,
                top: `${dot.y}%`,
                transform: 'translate(-50%, -150%)',
              }}
            >
              <span className="px-2 py-1 bg-foreground text-background text-[10px] rounded whitespace-nowrap">
                High Intent
              </span>
            </motion.div>
          )
        ))}
      </div>
    </div>
  )
}

export default RadarAnimation
