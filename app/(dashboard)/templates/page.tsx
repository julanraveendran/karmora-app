'use client'

import { useState } from 'react'
import { Copy, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Template {
  id: string
  title: string
  description: string
  category: string
  content: string
}

const TEMPLATES: Template[] = [
  {
    id: '1',
    title: 'The Helpful Expert',
    description: 'Position yourself as a knowledgeable helper, then softly mention your solution.',
    category: 'General',
    content: `Great question! I've actually dealt with this exact issue before.

Here's what worked for me:
1. [First actionable tip]
2. [Second actionable tip]
3. [Third actionable tip]

The key is [main insight].

[If soft mention enabled: I also found [Your Product] helpful for this - it [main benefit]. Might be worth checking out.]

Hope that helps!`,
  },
  {
    id: '2',
    title: 'The Personal Story',
    description: 'Share your experience to build trust before offering a solution.',
    category: 'Storytelling',
    content: `I was in the exact same boat about [timeframe] ago.

What I struggled with most was [pain point they mentioned].

After trying a few things, here's what finally clicked:
- [Key realization or tip]
- [Supporting point]

[If soft mention enabled: This is actually why I started using [Your Product] - it [specific benefit]. Changed the game for me.]

Feel free to DM if you want to chat more about it!`,
  },
  {
    id: '3',
    title: 'The Resource Curator',
    description: 'Provide value by curating helpful resources, including yours.',
    category: 'Resources',
    content: `Here are some resources that might help:

**Free:**
- [Resource 1] - great for [use case]
- [Resource 2] - useful for [use case]

**Tools:**
- [Tool 1] - [brief description]
- [Tool 2] - [brief description]
[If soft mention enabled: - [Your Product] - [brief description of what it does]]

**Content:**
- [Blog/Video 1]
- [Blog/Video 2]

I'd start with [recommendation] based on what you described.`,
  },
  {
    id: '4',
    title: 'The Diagnostic Question',
    description: 'Ask clarifying questions to better understand their situation.',
    category: 'Engagement',
    content: `Interesting problem! A few questions to help narrow this down:

1. What have you already tried?
2. What's your main goal - [option A] or [option B]?
3. Any specific constraints (budget/timeline/tools)?

The answer might be different depending on your situation.

[If context allows: I've seen this problem approached a few different ways - happy to share what's worked for others once I know more about your setup.]`,
  },
  {
    id: '5',
    title: 'The Contrarian Take',
    description: 'Offer a fresh perspective that stands out from generic advice.',
    category: 'Thought Leadership',
    content: `Hot take: [contrarian opinion on the topic].

Here's why:

Most people approach this by [common approach], but that often leads to [common problem].

What's worked better (at least in my experience):
- [Alternative approach]
- [Supporting point]

[If soft mention enabled: This is the philosophy behind [Your Product] - we focus on [differentiator].]

Curious what others think!`,
  },
  {
    id: '6',
    title: 'The Quick Win',
    description: 'Provide an immediate, actionable solution they can implement now.',
    category: 'Tactical',
    content: `Quick fix that might help:

1. Go to [specific location/setting]
2. Change [specific thing] to [specific value]
3. [Next step if needed]

This should [expected outcome].

If that doesn't work, the issue might be [alternative cause]. In that case, try [alternative solution].

[If soft mention enabled: For a more automated solution, [Your Product] can handle this - it [specific feature].]`,
  },
]

const CATEGORIES = ['All', ...new Set(TEMPLATES.map(t => t.category))]

function TemplateCard({ template }: { template: Template }) {
  const [copied, setCopied] = useState(false)
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.content)
    setCopied(true)
    toast.success('Template copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="p-5 flex flex-col h-full">
        {/* Category badge */}
        <Badge variant="secondary" className="self-start mb-3">
          {template.category}
        </Badge>
        
        {/* Title */}
        <h3 className="font-medium text-base mb-2 text-[#0A0A0A]">
          {template.title}
        </h3>
        
        {/* Description */}
        <p className="text-sm mb-4 text-[#6B6B6B]">
          {template.description}
        </p>
        
        {/* Preview */}
        <div className="flex-1 p-3 rounded-lg text-xs mb-4 overflow-hidden bg-[#F9F9F9] border border-[#EAEAEA]">
          <pre className="whitespace-pre-wrap font-sans line-clamp-6 text-[#6B6B6B]">
            {template.content}
          </pre>
        </div>
        
        {/* Copy button */}
        <Button
          onClick={handleCopy}
          className={`w-full rounded-full ${
            copied ? 'bg-green-500 hover:bg-green-600' : ''
          }`}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="ml-2">{copied ? 'Copied!' : 'Copy Template'}</span>
        </Button>
      </CardContent>
    </Card>
  )
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('All')
  
  const filteredTemplates = activeCategory === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(t => t.category === activeCategory)

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={24} className="text-[#0A0A0A]" />
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">
            Reply Templates
          </h1>
        </div>
        <p className="text-sm text-[#6B6B6B]">
          Proven templates to craft authentic, high-converting Reddit replies
        </p>
      </div>
      
      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CATEGORIES.map(category => (
          <Button
            key={category}
            variant={activeCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveCategory(category)}
            className="rounded-full"
          >
            {category}
          </Button>
        ))}
      </div>
      
      {/* Templates grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map(template => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}
