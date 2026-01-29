'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ArrowLeft, Check, Plus, X, Sparkles, MessageSquare, Copy, Radar, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { ReplyStyle } from '@/types'
import { REPLY_STYLE_LABELS } from '@/types'

const TOTAL_STEPS = 6

// Progress stages for step 5
const SETUP_STAGES = [
  'Collecting new posts...',
  'Broad filtering...',
  'Scoring intent...',
  'Finalizing your leads...',
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  // Product profile state
  const [productName, setProductName] = useState('')
  const [oneLiner, setOneLiner] = useState('')
  const [icp, setIcp] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [replyStyle, setReplyStyle] = useState<ReplyStyle>('helpful_concise')
  const [softMention, setSoftMention] = useState(false)
  
  // Subreddit state
  const [subredditSuggestions, setSubredditSuggestions] = useState<string[]>([])
  const [selectedSubreddits, setSelectedSubreddits] = useState<string[]>([])
  const [newSubreddit, setNewSubreddit] = useState('')
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  
  // Setup progress state (step 5)
  const [setupStageIndex, setSetupStageIndex] = useState(0)
  const [scrapingTriggered, setScrapingTriggered] = useState(false)
  
  // Load AI-powered subreddit suggestions when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && subredditSuggestions.length === 0 && productName) {
      loadSuggestions()
    }
  }, [currentStep])
  
  // Progress through setup stages (step 5)
  useEffect(() => {
    if (currentStep === 5) {
      const interval = setInterval(() => {
        setSetupStageIndex(prev => {
          if (prev >= SETUP_STAGES.length - 1) {
            clearInterval(interval)
            setTimeout(() => setCurrentStep(6), 500)
            return prev
          }
          return prev + 1
        })
      }, 1200)
      return () => clearInterval(interval)
    }
  }, [currentStep])
  
  async function loadSuggestions() {
    setLoadingSuggestions(true)
    try {
      // Call API to get AI-powered suggestions based on product info
      const response = await fetch('/api/subreddits/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Ensure cookies are sent
        body: JSON.stringify({
          productName,
          oneLiner,
          icp,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        console.error('API error:', data.error, data.debug)
        const debugInfo = data.debug ? ` (${data.debug.hint || data.debug.authError || ''})` : ''
        throw new Error((data.error || 'API request failed') + debugInfo)
      }
      
      if (data.subreddits && Array.isArray(data.subreddits)) {
        setSubredditSuggestions(data.subreddits)
        if (data.error) {
          // API returned fallback due to an error
          console.warn('API returned fallback suggestions:', data.error)
        }
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`Failed to load AI suggestions: ${errorMessage}`)
      // Fallback suggestions
      setSubredditSuggestions([
        'startups',
        'SaaS',
        'entrepreneur',
        'smallbusiness',
        'marketing',
        'growmybusiness',
      ])
    } finally {
      setLoadingSuggestions(false)
    }
  }
  
  function toggleSubreddit(sub: string) {
    if (selectedSubreddits.includes(sub)) {
      setSelectedSubreddits(prev => prev.filter(s => s !== sub))
    } else if (selectedSubreddits.length < 5) {
      setSelectedSubreddits(prev => [...prev, sub])
    } else {
      toast.error('Maximum 5 subreddits')
    }
  }
  
  function addCustomSubreddit() {
    const cleaned = newSubreddit.trim().toLowerCase().replace(/^r\//, '')
    if (!cleaned) return
    if (selectedSubreddits.includes(cleaned)) {
      toast.error('Already selected')
      return
    }
    if (selectedSubreddits.length >= 5) {
      toast.error('Maximum 5 subreddits')
      return
    }
    setSelectedSubreddits(prev => [...prev, cleaned])
    setNewSubreddit('')
  }
  
  async function handleNext() {
    // Validation for step 2
    if (currentStep === 2) {
      if (productName.length < 2 || productName.length > 40) {
        toast.error('Product name must be 2-40 characters')
        return
      }
      if (oneLiner.length < 20) {
        toast.error('One-liner must be at least 20 characters')
        return
      }
      if (icp.length < 20) {
        toast.error('ICP must be at least 20 characters')
        return
      }
    }
    
    // Validation for step 3
    if (currentStep === 3) {
      if (selectedSubreddits.length === 0) {
        toast.error('Select at least 1 subreddit')
        return
      }
    }
    
    // Save onboarding data after step 3 (before setup animation)
    if (currentStep === 4) {
      setLoading(true)
      try {
        const response = await fetch('/api/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product: {
              productName,
              oneLiner,
              icp,
              websiteUrl: websiteUrl || undefined,
              replyStyle,
              softMention,
            },
            subreddits: selectedSubreddits,
          }),
        })
        
        const data = await response.json()
        
        if (!data.ok) {
          throw new Error(data.error || 'Failed to save')
        }
        
        // Trigger lead scraping in the background after saving onboarding
        if (!scrapingTriggered) {
          setScrapingTriggered(true)
          fetch('/api/leads', { method: 'POST' }).catch(err => {
            console.error('Failed to trigger lead scraping:', err)
            // Don't show error to user, scraping can happen later
          })
        }
      } catch (error) {
        console.error('Failed to save onboarding:', error)
        toast.error('Failed to save onboarding data. Please try again.')
        setLoading(false)
        return
      }
      setLoading(false)
    }
    
    setCurrentStep(prev => Math.min(prev + 1, TOTAL_STEPS))
  }
  
  function handleBack() {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }
  
  async function handleComplete() {
    router.push('/leads')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FEFEFE]">
      {/* Dotted background */}
      <div 
        className="fixed inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #E5E5E5 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      
      {/* Modal */}
      <div className="w-full max-w-lg max-h-[90vh] rounded-2xl overflow-hidden flex flex-col bg-white shadow-lg border border-[#EAEAEA]">
        {/* Progress bar */}
        <div className="h-1 flex-shrink-0 bg-[#EAEAEA]">
          <div 
            className="h-full transition-all duration-500 bg-[#0A0A0A]"
            style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
          />
        </div>
        
        {/* Content */}
        <div className="p-8 flex-1 min-h-0 overflow-y-auto">
          {/* Step 1: How it works */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-[#0A0A0A]">
                <Radar size={32} className="text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2 text-[#0A0A0A]">
                Stop searching. Start{' '}
                <span className="italic">solving.</span>
              </h2>
              
              <p className="text-sm mb-8 text-[#6B6B6B]">
                Here&apos;s how Karmora works:
              </p>
              
              <div className="space-y-4 text-left">
                {[
                  { icon: Radar, text: 'We scan new posts in your chosen subreddits' },
                  { icon: Sparkles, text: 'We filter for people actively looking for help' },
                  { icon: MessageSquare, text: 'You generate a reply that sounds native—not spammy' },
                ].map(({ icon: Icon, text }, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl bg-[#F9F9F9]"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#0A0A0A]">
                      <Icon size={18} className="text-white" />
                    </div>
                    <p className="text-sm text-[#0A0A0A]">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 2: Product Profile */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0A0A0A]">
                Tell us about your product
              </h2>
              <p className="text-sm mb-6 text-[#6B6B6B]">
                This helps us generate relevant, personalized replies.
              </p>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Product Name *</Label>
                  <Input
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    placeholder="e.g., Karmora"
                    maxLength={40}
                  />
                  <p className="text-xs text-[#9A9A9A]">{productName.length}/40</p>
                </div>
                
                <div className="space-y-2">
                  <Label>One-liner Value Prop *</Label>
                  <Textarea
                    value={oneLiner}
                    onChange={(e) => setOneLiner(e.target.value)}
                    placeholder="What does your product do in one sentence?"
                    rows={2}
                  />
                  <p className="text-xs text-[#9A9A9A]">Min 20 chars · {oneLiner.length}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Who is it for? (ICP) *</Label>
                  <Textarea
                    value={icp}
                    onChange={(e) => setIcp(e.target.value)}
                    placeholder="Describe your ideal customer"
                    rows={2}
                  />
                  <p className="text-xs text-[#9A9A9A]">Min 20 chars · {icp.length}</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Website URL (optional)</Label>
                  <Input
                    type="url"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://your-product.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Reply Style</Label>
                  <Select value={replyStyle} onValueChange={(v) => setReplyStyle(v as ReplyStyle)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a style" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(REPLY_STYLE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={softMention}
                    onClick={() => setSoftMention(!softMention)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      softMention ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'
                    }`}
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                      style={{
                        transform: softMention ? 'translateX(24px)' : 'translateX(4px)',
                      }}
                    />
                  </button>
                  <Label className="text-sm cursor-pointer" onClick={() => setSoftMention(!softMention)}>
                    Include subtle product mention in replies
                  </Label>
                </div>
              </div>
            </div>
          )}
          
          {/* Step 3: Subreddit Selection */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0A0A0A]">
                Choose your subreddits
              </h2>
              <p className="text-sm mb-6 text-[#6B6B6B]">
                AI-suggested subreddits based on your product. Select up to 5.
              </p>
              
              {loadingSuggestions ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A]" />
                  <p className="mt-4 text-sm text-[#6B6B6B]">
                    Finding subreddits for {productName}...
                  </p>
                </div>
              ) : (
                <>
                  {/* Selected subreddits */}
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2 text-[#9A9A9A]">
                      Selected ({selectedSubreddits.length}/5)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedSubreddits.map(sub => (
                        <Badge
                          key={sub}
                          variant="default"
                          className="px-3 py-1.5 flex items-center gap-1.5"
                        >
                          r/{sub}
                          <button
                            onClick={() => toggleSubreddit(sub)}
                            className="hover:opacity-70"
                          >
                            <X size={14} />
                          </button>
                        </Badge>
                      ))}
                      {selectedSubreddits.length === 0 && (
                        <span className="text-sm text-[#9A9A9A]">
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* AI Suggestions */}
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2 text-[#9A9A9A]">
                      <Sparkles size={12} className="inline mr-1" />
                      AI Suggestions for &quot;{productName}&quot;
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subredditSuggestions
                        .filter(s => !selectedSubreddits.includes(s))
                        .map(sub => (
                          <Button
                            key={sub}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSubreddit(sub)}
                            className="rounded-full"
                          >
                            r/{sub}
                          </Button>
                        ))}
                    </div>
                  </div>
                  
                  {/* Manual add */}
                  <div className="flex gap-2">
                    <Input
                      value={newSubreddit}
                      onChange={(e) => setNewSubreddit(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addCustomSubreddit()}
                      placeholder="Add custom subreddit..."
                      className="flex-1"
                    />
                    <Button onClick={addCustomSubreddit} className="rounded-full">
                      <Plus size={16} />
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Step 4: Reply generator explanation */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-xl font-semibold mb-2 text-[#0A0A0A]">
                Generate replies in one click
              </h2>
              <p className="text-sm mb-6 text-[#6B6B6B]">
                Click 💬 on any lead to generate a personalized reply, then copy and paste.
              </p>
              
              {/* Example card */}
              <div className="p-4 rounded-xl mb-4 bg-[#F9F9F9] border border-[#EAEAEA]">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">r/startups</Badge>
                  <Badge variant="default" className="text-xs">NEW</Badge>
                </div>
                <p className="font-medium text-sm mb-3 text-[#0A0A0A]">
                  Looking for tools to find Reddit leads...
                </p>
                
                {/* Example reply */}
                <div className="p-3 rounded-lg mb-3 bg-white">
                  <p className="text-xs font-semibold mb-2 text-[#9A9A9A]">
                    Generated Reply
                  </p>
                  <p className="text-sm text-[#0A0A0A]">
                    Great question! I&apos;ve dealt with this exact challenge...
                  </p>
                </div>
                
                <Button size="sm" className="rounded-full">
                  <Copy size={14} />
                  <span className="ml-1">Copy</span>
                </Button>
              </div>
              
              <div className="p-4 rounded-xl bg-[#F9F9F9]">
                <p className="text-sm font-medium mb-1 text-[#0A0A0A]">
                  💡 Pro tip
                </p>
                <p className="text-sm text-[#6B6B6B]">
                  Change 1-2 lines before posting to sound more human and personal.
                </p>
              </div>
            </div>
          )}
          
          {/* Step 5: Setup progress */}
          {currentStep === 5 && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0A0A0A]" />
              <h2 className="text-xl font-semibold mt-6 mb-2 text-[#0A0A0A]">
                Setting up your lead engine...
              </h2>
              
              <div className="space-y-3 mt-8">
                {SETUP_STAGES.map((stage, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-3"
                  >
                    <div 
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                        i <= setupStageIndex ? 'bg-[#0A0A0A]' : 'bg-[#EAEAEA]'
                      }`}
                    >
                      {i < setupStageIndex ? (
                        <Check size={14} className="text-white" />
                      ) : i === setupStageIndex ? (
                        <Loader2 size={14} className="animate-spin text-white" />
                      ) : null}
                    </div>
                    <span 
                      className={`text-sm ${
                        i <= setupStageIndex ? 'text-[#0A0A0A]' : 'text-[#9A9A9A]'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 6: Done */}
          {currentStep === 6 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-500">
                <Check size={40} className="text-white" />
              </div>
              
              <h2 className="text-2xl font-semibold mb-2 text-[#0A0A0A]">
                Your lead engine is ready
              </h2>
              <p className="text-sm mb-8 text-[#6B6B6B]">
                We found leads in your selected subreddits. Time to start engaging!
              </p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-8 py-4 flex items-center justify-between flex-shrink-0 border-t border-[#EAEAEA]">
          {currentStep > 1 && currentStep < 5 ? (
            <Button variant="ghost" onClick={handleBack}>
              <ArrowLeft size={16} />
              <span className="ml-1">Back</span>
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < 5 && (
            <Button onClick={handleNext} disabled={loading} className="rounded-full">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <span>Next</span>
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </Button>
          )}
          
          {currentStep === 6 && (
            <Button onClick={handleComplete} className="ml-auto rounded-full">
              <span>Go to Leads</span>
              <ArrowRight size={16} className="ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
