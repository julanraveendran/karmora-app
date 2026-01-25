'use client'

import { motion } from 'framer-motion'
import { Search, MessageSquare, TrendingUp } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Laser-Focused Intent Monitoring',
    description: 'Stop scrolling r/entrepreneur. Karmora scans 24/7. Define keywords like "alternative to [competitor]" or "struggling with [problem]", and we alert you the second a prospect asks for help.',
    tags: ['SENTIMENT ANALYSIS', 'KEYWORD TRACKING'],
    icon: Search,
    visual: 'discovery',
  },
  {
    number: '02',
    title: 'Context-Aware Reply Drafting',
    description: "Don't sound like a bot. Karmora reads the entire thread context, analyzes the subreddit's culture, and drafts a helpful, native-sounding reply that subtly positions your product as the solution.",
    tags: ['ANTI-SPAM GUARD', 'TONE MATCHING'],
    icon: MessageSquare,
    visual: 'typing',
  },
  {
    number: '03',
    title: 'One-Click Execution',
    description: 'Review, edit, and post directly from the dashboard. Track click-throughs and upvotes to see which narratives resonate.',
    tags: ['ANALYTICS', 'DIRECT POSTING'],
    icon: TrendingUp,
    visual: 'graph',
  },
]

const WorkflowSection = () => {
  return (
    <section id="methodology" className="py-24 md:py-32 bg-karmora-vapor">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom block mb-4">
            The Process
          </span>
          <h2 className="text-section text-foreground">3 Steps to Relevance</h2>
        </motion.div>

        <div className="space-y-24 md:space-y-32">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className={`grid md:grid-cols-2 gap-12 md:gap-16 items-center ${
                index % 2 === 1 ? 'md:direction-rtl' : ''
              }`}
            >
              <div className={`${index % 2 === 1 ? 'md:order-2' : ''}`}>
                <span className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom block mb-4">
                  Step {step.number}
                </span>
                <h3 className="text-feature text-foreground mb-4">{step.title}</h3>
                <p className="text-body text-karmora-text-secondary mb-6 leading-relaxed">
                  {step.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-background border border-karmora-structure rounded-full text-micro uppercase text-karmora-text-tertiary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`${index % 2 === 1 ? 'md:order-1' : ''}`}>
                <StepVisual type={step.visual} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

const StepVisual = ({ type }: { type: string }) => {
  if (type === 'discovery') {
    return (
      <div className="bg-background rounded-hero border border-karmora-structure shadow-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 bg-karmora-vapor border-b border-karmora-structure">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-karmora-structure" />
            <div className="w-3 h-3 rounded-full bg-karmora-structure" />
            <div className="w-3 h-3 rounded-full bg-karmora-structure" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 bg-karmora-structure rounded-md max-w-md mx-auto" />
          </div>
        </div>
        <div className="p-6 space-y-3">
          {[
            { intent: true, title: 'Hate using Salesforce, need simpler CRM' },
            { intent: false, title: 'Best practices for cold outreach?' },
            { intent: true, title: 'Looking for a Notion alternative that...' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
              className="flex items-center gap-3 p-3 bg-karmora-vapor rounded-lg border border-karmora-structure"
            >
              <div className="w-8 h-8 rounded-full bg-karmora-structure" />
              <div className="flex-1">
                <p className="text-sm text-foreground">{item.title}</p>
              </div>
              {item.intent && (
                <span className="px-2 py-1 bg-foreground text-background text-[10px] font-semibold rounded">
                  High Intent
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'typing') {
    return (
      <div className="bg-background rounded-hero border border-karmora-structure shadow-xl p-6">
        <div className="space-y-4">
          <div className="p-4 bg-karmora-vapor rounded-lg border border-karmora-structure">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-karmora-structure flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">u/frustrated_founder</p>
                <p className="text-sm text-karmora-text-secondary">
                  Any recommendations for a tool that helps with Reddit outreach without looking spammy?
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-karmora-vapor rounded-lg border-2 border-foreground">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-foreground flex-shrink-0 flex items-center justify-center">
                <span className="text-background text-xs font-bold">AI</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-1">Draft Reply</p>
                <p className="text-sm text-karmora-text-secondary">
                  <span className="text-karmora-text-tertiary line-through">You should check out my tool...</span>
                </p>
                <motion.p
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="text-sm text-foreground mt-2"
                >
                  I ran into this last year. We actually built a workflow for this at Karmora, happy to send a link if it helps.
                </motion.p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'graph') {
    return (
      <div className="bg-background rounded-hero border border-karmora-structure shadow-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom mb-1">
              Traffic Source
            </p>
            <p className="text-2xl font-semibold text-foreground">Reddit</p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="px-3 py-1 bg-foreground text-background text-sm font-medium rounded-full"
          >
            +45 Leads
          </motion.div>
        </div>
        
        <svg className="w-full h-32" viewBox="0 0 200 60">
          <motion.path
            d="M0 50 Q20 45 40 40 T80 30 T120 20 T160 15 T200 5"
            fill="none"
            stroke="hsl(0 0% 0%)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          <motion.circle
            cx="200"
            cy="5"
            r="4"
            fill="hsl(0 0% 0%)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.5 }}
          />
        </svg>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-karmora-structure">
          <p className="text-sm text-karmora-text-secondary">Karma Growth</p>
          <p className="text-sm font-semibold text-foreground">+2,340</p>
        </div>
      </div>
    )
  }

  return null
}

export default WorkflowSection
