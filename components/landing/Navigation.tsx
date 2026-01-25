'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Methodology', href: '#methodology' },
    { label: 'Pricing', href: '#pricing' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass-nav border-b border-karmora-structure' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-foreground">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                <line x1="12" y1="1" x2="12" y2="5" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.5" />
              </svg>
              <span className="text-lg font-semibold tracking-tight">Karmora</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-karmora-text-secondary hover:text-foreground transition-colors duration-200 text-sm font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <motion.div whileHover={{ backgroundColor: 'hsl(0 0% 20%)' }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full transition-colors duration-200"
                >
                  Start Growing
                </Link>
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2"
            >
              <div className="w-5 h-4 flex flex-col justify-between">
                <span className={`block h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                <span className={`block h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={false}
        animate={isMobileMenuOpen ? { opacity: 1, pointerEvents: 'auto' as const } : { opacity: 0, pointerEvents: 'none' as const }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-40 bg-background md:hidden"
      >
        <div className="flex flex-col items-center justify-center h-full gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-medium text-foreground hover:text-karmora-text-secondary transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/signup"
            onClick={() => setIsMobileMenuOpen(false)}
            className="mt-4 inline-flex items-center px-8 py-3 bg-primary text-primary-foreground text-lg font-medium rounded-full"
          >
            Start Growing
          </Link>
        </div>
      </motion.div>
    </>
  )
}

export default Navigation
