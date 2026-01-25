'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import RadarAnimation from './RadarAnimation'

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 dot-grid fade-mask-bottom opacity-50" />
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 bg-background border border-karmora-structure rounded-full"
          >
            <span className="text-micro uppercase text-karmora-text-tertiary">
              AI-Native Reddit Growth ✦
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-hero-mobile md:text-hero text-foreground mb-6"
          >
            Stop Searching. Start Solving.{' '}
            <span className="font-serif-accent text-foreground">Sell.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg md:text-xl text-karmora-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Karmora turns Reddit into your consistent lead engine. We find the threads, 
            you drop the perfect, non-spammy solution.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex items-center justify-center mb-8"
          >
            <motion.div
              whileHover={{ scale: 1.02, backgroundColor: 'hsl(0 0% 15%)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/signup"
                className="px-8 py-4 bg-primary text-primary-foreground font-medium text-lg rounded-full transition-colors inline-block"
              >
                Try now
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-karmora-structure border-2 border-background"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(0 0% ${70 + i * 5}%) 0%, hsl(0 0% ${50 + i * 5}%) 100%)` 
                  }}
                />
              ))}
            </div>
            <span className="text-sm text-karmora-text-secondary">
              Trusted by <span className="text-foreground font-medium">400+</span> SaaS Founders
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 md:mt-24"
        >
          <RadarAnimation />
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection
