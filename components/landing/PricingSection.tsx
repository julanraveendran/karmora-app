'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'
import Link from 'next/link'

const features = [
  'Unlimited Keyword Monitors',
  '50 AI-Drafted Replies / day',
  'Sentiment Analysis',
  'Subreddit Culture Match',
  'Direct Posting',
  'Analytics Dashboard',
]

const PricingSection = () => {
  const [isQuarterly, setIsQuarterly] = useState(false)
  const monthlyPrice = 29
  const quarterlyPrice = 23

  return (
    <section id="pricing" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom block mb-4">
            Simple Pricing
          </span>
          <h2 className="text-section text-foreground">One plan. Everything included.</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => setIsQuarterly(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !isQuarterly 
                ? 'bg-foreground text-background' 
                : 'bg-karmora-vapor text-karmora-text-secondary hover:text-foreground'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setIsQuarterly(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              isQuarterly 
                ? 'bg-foreground text-background' 
                : 'bg-karmora-vapor text-karmora-text-secondary hover:text-foreground'
            }`}
          >
            Quarterly
            <span className="ml-2 text-xs opacity-75">(Save 20%)</span>
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-background border-2 border-foreground rounded-bento p-8 hard-shadow">
            <h3 className="text-xl font-semibold text-foreground mb-2">Growth Engine</h3>
            
            <div className="mb-6 overflow-hidden h-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isQuarterly ? 'quarterly' : 'monthly'}
                  initial={{ rotateX: 90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  exit={{ rotateX: -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-baseline gap-1"
                >
                  <span className="text-5xl font-bold text-foreground">
                    ${isQuarterly ? quarterlyPrice : monthlyPrice}
                  </span>
                  <span className="text-karmora-text-secondary">/ mo</span>
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="text-sm text-karmora-text-secondary mb-8">
              Cancel anytime. No karma limits.
            </p>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-foreground flex-shrink-0" />
                  <span className="text-sm text-karmora-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.div whileHover={{ backgroundColor: 'hsl(0 0% 20%)' }}>
              <Link
                href="/signup"
                className="block w-full py-4 bg-primary text-primary-foreground font-medium rounded-lg transition-colors text-center"
              >
                Start Free Trial
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default PricingSection
