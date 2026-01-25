import Link from 'next/link'

const Footer = () => {
  const footerLinks = {
    product: [
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' },
      { label: 'Login', href: '/login' },
    ],
    legal: [
      { label: 'Terms', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Reddit API Compliant', href: '#' },
    ],
    social: [
      { label: 'X (Twitter)', href: '#' },
      { label: 'Reddit', href: '#' },
    ],
  }

  return (
    <footer className="py-16 border-t border-karmora-structure bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-foreground">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1" opacity="0.6" />
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Karmora</span>
            </div>
            <p className="text-sm text-karmora-text-tertiary">
              Made with ♥ in the UK
            </p>
          </div>

          <div>
            <h4 className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-karmora-text-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-karmora-text-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-micro uppercase text-karmora-text-tertiary tracking-wide-custom mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.social.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-karmora-text-secondary hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-karmora-structure">
          <p className="text-sm text-karmora-text-tertiary text-center">
            © {new Date().getFullYear()} Karmora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
