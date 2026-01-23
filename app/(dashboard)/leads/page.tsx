'use client'

import { useState, useEffect } from 'react'
import { RefreshCw, ExternalLink, MessageSquare, X, Copy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import type { Lead, LeadStatus } from '@/types'

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return '1 day ago'
  return `${diffDays} days ago`
}

// Mock data for development (will be replaced with API calls)
const MOCK_LEADS: Lead[] = [
  {
    id: '1',
    user_id: 'mock-user',
    subreddit: 'startups',
    reddit_post_id: 'abc123',
    title: 'Looking for a tool to help me find leads on Reddit - any recommendations?',
    author: 'startup_founder_2024',
    url: 'https://reddit.com/r/startups/comments/abc123',
    created_utc: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    snippet: "I've been manually searching Reddit for potential customers but it's taking forever. Does anyone know of a tool that can help automate finding relevant threads?",
    status: 'new',
    score: 6,
    fetched_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: 'mock-user',
    subreddit: 'entrepreneur',
    reddit_post_id: 'def456',
    title: "What's the best way to do outreach without being spammy?",
    author: 'indie_maker',
    url: 'https://reddit.com/r/entrepreneur/comments/def456',
    created_utc: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    snippet: "I have a B2B SaaS and want to reach out to potential customers on Reddit but I don't want to come across as spammy.",
    status: 'new',
    score: 5,
    fetched_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: 'mock-user',
    subreddit: 'SaaS',
    reddit_post_id: 'ghi789',
    title: 'Alternative to [competitor] for Reddit marketing?',
    author: 'saas_growth_guy',
    url: 'https://reddit.com/r/SaaS/comments/ghi789',
    created_utc: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    snippet: "Been using [competitor] but it's getting expensive. Looking for alternatives that can help me find relevant discussions.",
    status: 'viewed',
    score: 7,
    fetched_at: new Date().toISOString(),
  },
]

interface LeadCardProps {
  lead: Lead
  onDismiss: (id: string) => void
  onGenerateReply: (id: string) => void
  generatingReplyFor: string | null
  generatedReplies: Record<string, string>
}

function LeadCard({ 
  lead, 
  onDismiss, 
  onGenerateReply, 
  generatingReplyFor,
  generatedReplies,
}: LeadCardProps) {
  const [copied, setCopied] = useState(false)
  const isGenerating = generatingReplyFor === lead.id
  const reply = generatedReplies[lead.id]
  
  const handleCopy = async () => {
    if (reply) {
      await navigator.clipboard.writeText(reply)
      setCopied(true)
      toast.success('Reply copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    }
  }
  
  const handleOpenPost = () => {
    window.open(lead.url, '_blank')
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              r/{lead.subreddit}
            </Badge>
            <Badge 
              variant={lead.status === 'new' ? 'default' : 'secondary'}
              className="text-xs uppercase"
            >
              {lead.status}
            </Badge>
          </div>
        </div>
        
        {/* Title */}
        <h3 className="font-medium text-base leading-snug mb-2 line-clamp-2 text-[#0A0A0A]">
          {lead.title}
        </h3>
        
        {/* Meta */}
        <p className="text-sm mb-3 text-[#9A9A9A]">
          u/{lead.author} · {formatRelativeTime(lead.created_utc)}
        </p>
        
        {/* Snippet */}
        {lead.snippet && (
          <p className="text-sm mb-4 line-clamp-3 text-[#6B6B6B]">
            {lead.snippet}
          </p>
        )}
        
        {/* Generated Reply */}
        {reply && (
          <div className="mb-4 p-4 rounded-lg bg-[#F9F9F9] border border-[#EAEAEA]">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2 text-[#9A9A9A]">
              Generated Reply
            </p>
            <p className="text-sm whitespace-pre-wrap text-[#0A0A0A]">
              {reply}
            </p>
            <Button
              onClick={handleCopy}
              size="sm"
              className={`mt-3 rounded-full ${
                copied ? 'bg-green-500 hover:bg-green-600' : ''
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="ml-1">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        )}
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenPost}
            className="rounded-full"
          >
            <ExternalLink size={14} />
            <span className="ml-1">Open</span>
          </Button>
          
          <Button
            size="sm"
            onClick={() => onGenerateReply(lead.id)}
            disabled={isGenerating || !!reply}
            className="rounded-full"
          >
            {isGenerating ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span className="ml-1">Drafting...</span>
              </>
            ) : reply ? (
              <>
                <Check size={14} />
                <span className="ml-1">Generated</span>
              </>
            ) : (
              <>
                <MessageSquare size={14} />
                <span className="ml-1">Generate Reply</span>
              </>
            )}
          </Button>
          
          {lead.status !== 'dismissed' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDismiss(lead.id)}
              className="rounded-full text-[#9A9A9A] hover:text-[#0A0A0A]"
            >
              <X size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [generatingReplyFor, setGeneratingReplyFor] = useState<string | null>(null)
  const [generatedReplies, setGeneratedReplies] = useState<Record<string, string>>({})
  
  // Filters
  const [subredditFilter, setSubredditFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Get unique subreddits from leads
  const subreddits = [...new Set(leads.map(l => l.subreddit))]
  
  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (subredditFilter !== 'all' && lead.subreddit !== subredditFilter) return false
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    if (statusFilter === 'all' && lead.status === 'dismissed') return false
    return true
  })
  
  async function handleRefresh() {
    setRefreshing(true)
    try {
      // TODO: Call API to refresh leads
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Added 3 new leads')
    } catch {
      toast.error('Failed to refresh leads')
    } finally {
      setRefreshing(false)
    }
  }
  
  async function handleGenerateReply(leadId: string) {
    setGeneratingReplyFor(leadId)
    try {
      // TODO: Call API to generate reply
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock reply
      const mockReply = `Great question! I've dealt with this exact challenge before.

Here's what worked for me:
1. Focus on threads where people are actively asking for help
2. Always lead with value before mentioning any tools
3. Be genuine - Reddit users can spot marketing a mile away

One thing that helped me was setting up alerts for specific keywords in relevant subreddits.

Hope that helps!`
      
      setGeneratedReplies(prev => ({ ...prev, [leadId]: mockReply }))
      
      // Update lead status
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, status: 'viewed' as LeadStatus } : l
      ))
    } catch {
      toast.error('Failed to generate reply')
    } finally {
      setGeneratingReplyFor(null)
    }
  }
  
  function handleDismiss(leadId: string) {
    setLeads(prev => prev.map(l => 
      l.id === leadId ? { ...l, status: 'dismissed' as LeadStatus } : l
    ))
    toast.success('Lead dismissed')
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#0A0A0A]">
            Leads
          </h1>
          <p className="text-sm mt-1 text-[#6B6B6B]">
            High-intent Reddit posts ready for your response
          </p>
        </div>
        
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-full"
        >
          {refreshing ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="ml-2">Refreshing...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span className="ml-2">Refresh Leads</span>
            </>
          )}
        </Button>
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-white border border-[#EAEAEA]">
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9A9A]">
            Subreddit
          </label>
          <Select value={subredditFilter} onValueChange={setSubredditFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All subreddits" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All subreddits</SelectItem>
              {subreddits.map(sub => (
                <SelectItem key={sub} value={sub}>r/{sub}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-[#9A9A9A]">
            Status
          </label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="dismissed">Dismissed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Leads grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A]" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-20 rounded-xl bg-white border border-[#EAEAEA]">
          <p className="text-lg font-medium mb-2 text-[#0A0A0A]">
            No leads found
          </p>
          <p className="text-sm mb-6 text-[#6B6B6B]">
            {statusFilter !== 'all' 
              ? 'No leads match these filters.'
              : 'Try refreshing or broadening your subreddit targets.'}
          </p>
          <Button onClick={handleRefresh} className="rounded-full">
            <RefreshCw size={16} />
            <span className="ml-2">Refresh Leads</span>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredLeads.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onDismiss={handleDismiss}
              onGenerateReply={handleGenerateReply}
              generatingReplyFor={generatingReplyFor}
              generatedReplies={generatedReplies}
            />
          ))}
        </div>
      )}
    </div>
  )
}
