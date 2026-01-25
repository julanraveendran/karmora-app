'use client'

import { motion } from 'framer-motion'
import { Swords, Rocket, Link2, Shield } from 'lucide-react'

const useCases = [
  {
    id: 'competitor',
    title: 'Competitor Poaching',
    description: "Monitor your competitors' brand names. Offer a better alternative when users complain.",
    icon: Swords,
    size: 'large',
  },
  {
    id: 'validation',
    title: 'Pre-Launch Validation',
    description: 'Find pain points before you write a line of code.',
    icon: Rocket,
    size: 'tall',
  },
  {
    id: 'backlink',
    title: 'Backlink Building',
    description: 'Drop value-add comments that drive SEO juice.',
    icon: Link2,
    size: 'standard',
  },
  {
    id: 'crisis',
    title: 'Crisis Management',
    description: 'Alerts for negative mentions of your brand.',
    icon: Shield,
    size: 'standard',
  },
]

const BentoGrid = () => {
  return (
    <section id="features" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom block mb-4">
            Use Cases
          </span>
          <h2 className="text-section text-foreground">What can you build with Karmora?</h2>
        </motion.div>

        {/* Desktop Bento Grid */}
        <div className="hidden md:grid grid-cols-3 grid-rows-2 gap-5 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ borderColor: 'hsl(0 0% 60%)' }}
            className="col-span-2 row-span-2 bg-karmora-vapor rounded-bento border border-karmora-structure p-8 flex flex-col justify-between transition-colors duration-300"
          >
            <div className="flex items-center gap-6 mb-8">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-16 h-16 rounded-xl bg-foreground flex items-center justify-center"
              >
                <Swords className="w-8 h-8 text-background" />
              </motion.div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-karmora-structure flex items-center justify-center text-sm font-semibold">A</div>
                <span className="text-karmora-text-tertiary text-lg">vs</span>
                <div className="w-12 h-12 rounded-lg bg-foreground text-background flex items-center justify-center text-sm font-semibold">B</div>
              </div>
            </div>
            <div>
              <h3 className="text-feature text-foreground mb-3">Competitor Poaching</h3>
              <p className="text-body text-karmora-text-secondary">
                Monitor your competitors&apos; brand names. Offer a better alternative when users complain.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ borderColor: 'hsl(0 0% 60%)' }}
            className="row-span-2 bg-karmora-vapor rounded-bento border border-karmora-structure p-6 flex flex-col justify-between transition-colors duration-300"
          >
            <div className="flex-1 flex flex-col items-center justify-center mb-6">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-full max-w-[200px]"
              >
                <div className="h-4 bg-karmora-structure rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 2, delay: 0.5 }}
                    className="h-full bg-foreground rounded-full"
                  />
                </div>
                <p className="text-center text-sm text-karmora-text-tertiary mt-2">100% validated</p>
              </motion.div>
            </div>
            <div>
              <Rocket className="w-8 h-8 text-foreground mb-3" />
              <h3 className="text-feature text-foreground mb-2">Pre-Launch Validation</h3>
              <p className="text-sm text-karmora-text-secondary">
                Find pain points before you write a line of code.
              </p>
            </div>
          </motion.div>
        </div>

        <div className="hidden md:grid grid-cols-2 gap-5 max-w-5xl mx-auto mt-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ borderColor: 'hsl(0 0% 60%)' }}
            className="bg-karmora-vapor rounded-bento border border-karmora-structure p-6 transition-colors duration-300"
          >
            <div className="flex items-center gap-4 mb-4">
              <Link2 className="w-8 h-8 text-foreground" />
              <motion.svg
                className="w-24 h-12"
                viewBox="0 0 80 40"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                <motion.path
                  d="M0 35 Q20 30 40 20 T80 5"
                  fill="none"
                  stroke="hsl(0 0% 0%)"
                  strokeWidth="2"
                  variants={{
                    hidden: { pathLength: 0 },
                    visible: { pathLength: 1 },
                  }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
              </motion.svg>
            </div>
            <h3 className="text-feature text-foreground mb-2">Backlink Building</h3>
            <p className="text-sm text-karmora-text-secondary">
              Drop value-add comments that drive SEO juice.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ borderColor: 'hsl(0 0% 60%)' }}
            className="bg-karmora-vapor rounded-bento border border-karmora-structure p-6 transition-colors duration-300"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block mb-4"
            >
              <Shield className="w-8 h-8 text-foreground" />
            </motion.div>
            <h3 className="text-feature text-foreground mb-2">Crisis Management</h3>
            <p className="text-sm text-karmora-text-secondary">
              Alerts for negative mentions of your brand.
            </p>
          </motion.div>
        </div>

        {/* Mobile Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto snap-x snap-mandatory -mx-6 px-6">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {useCases.map((useCase, index) => (
              <motion.div
                key={useCase.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-72 flex-shrink-0 snap-start bg-karmora-vapor rounded-bento border border-karmora-structure p-6"
              >
                <useCase.icon className="w-8 h-8 text-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">{useCase.title}</h3>
                <p className="text-sm text-karmora-text-secondary">{useCase.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default BentoGrid
