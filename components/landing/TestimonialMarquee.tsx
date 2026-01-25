'use client'

import { ArrowUp } from 'lucide-react'

const testimonials = [
  {
    username: 'devfounder_jake',
    upvotes: 452,
    text: 'Finally a tool that understands Reddit culture. I got my first 10 customers in 2 days.',
  },
  {
    username: 'sarah_saas',
    upvotes: 287,
    text: "Karmora helped me find pain points I didn't know existed. Validated my pivot in a week.",
  },
  {
    username: 'indie_marcus',
    upvotes: 391,
    text: 'The anti-spam guard is genius. My replies actually get upvoted now.',
  },
  {
    username: 'bootstrapped_lisa',
    upvotes: 203,
    text: 'Went from 0 to 1000 karma in a month. Real engagement, not bot spam.',
  },
  {
    username: 'product_hunt_paul',
    upvotes: 518,
    text: 'This is what I wished existed when I launched my first product. Game changer.',
  },
  {
    username: 'remote_dev_anna',
    upvotes: 342,
    text: 'The subreddit culture matching is spot on. Every reply feels native.',
  },
]

const TestimonialMarquee = () => {
  return (
    <section className="py-20 md:py-28 bg-karmora-vapor overflow-hidden">
      <div className="container mx-auto px-6 lg:px-8 mb-12">
        <h2 className="text-section text-foreground text-center">What founders are saying</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-karmora-vapor to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-karmora-vapor to-transparent z-10" />

        <div className="flex marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-80 mx-3 bg-background rounded-lg border border-karmora-structure p-5"
            >
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-karmora-structure" />
                  <div className="w-0.5 flex-1 bg-karmora-structure mt-2" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-foreground">
                      u/{testimonial.username}
                    </span>
                    <div className="flex items-center gap-1 text-karmora-text-tertiary">
                      <ArrowUp className="w-3 h-3" />
                      <span className="text-xs">{testimonial.upvotes}</span>
                    </div>
                  </div>
                  <p className="text-sm text-karmora-text-secondary leading-relaxed">
                    &quot;{testimonial.text}&quot;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialMarquee
