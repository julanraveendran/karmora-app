'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

const ProblemSolution = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  })

  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["hsl(0 0% 100%)", "hsl(0 0% 98%)", "hsl(0 0% 98%)"]
  )

  return (
    <motion.section
      ref={ref}
      style={{ backgroundColor }}
      className="py-32 md:py-40"
    >
      <div className="container mx-auto px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-[2rem] text-center text-foreground leading-relaxed max-w-3xl mx-auto"
        >
          Most Reddit marketing is <span className="text-karmora-text-tertiary line-through">spam</span>.{' '}
          <span className="font-medium">Yours won&apos;t be.</span>
        </motion.p>
      </div>
    </motion.section>
  )
}

export default ProblemSolution
