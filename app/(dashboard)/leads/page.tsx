'use client'

import { useState, useEffect, useCallback } from 'react'
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
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [generatingReplyFor, setGeneratingReplyFor] = useState<string | null>(null)
  const [generatedReplies, setGeneratedReplies] = useState<Record<string, string>>({})
  const [hasAutoRefreshed, setHasAutoRefreshed] = useState(false)
  
  // Filters
  const [subredditFilter, setSubredditFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Fetch leads from API
  const fetchLeads = useCallback(async () => {
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      
      if (data.leads) {
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [])
  
  // Load leads on mount
  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])
  
  // Get unique subreddits from leads
  const subreddits = [...new Set(leads.map(l => l.subreddit))]
  
  // Filter leads
  const filteredLeads = leads.filter(lead => {
    if (subredditFilter !== 'all' && lead.subreddit !== subredditFilter) return false
    if (statusFilter !== 'all' && lead.status !== statusFilter) return false
    if (statusFilter === 'all' && lead.status === 'dismissed') return false
    return true
  })
  
  const handleRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const response = await fetch('/api/leads', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to refresh')
      }
      
      toast.success(data.message || `Added ${data.added} new leads`)
      
      // Reload leads after refresh
      await fetchLeads()
    } catch (error) {
      console.error('Failed to refresh leads:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to refresh leads')
    } finally {
      setRefreshing(false)
    }
  }, [fetchLeads])
  
  // Auto-trigger scraping if no leads found on first load (after onboarding)
  useEffect(() => {
    if (!loading && leads.length === 0 && !hasAutoRefreshed && !refreshing) {
      setHasAutoRefreshed(true)
      handleRefresh()
    }
  }, [loading, leads.length, hasAutoRefreshed, refreshing, handleRefresh])
  
  async function handleGenerateReply(leadId: string) {
    setGeneratingReplyFor(leadId)
    try {
      const response = await fetch(`/api/leads/${leadId}/generate`, { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate reply')
      }
      
      setGeneratedReplies(prev => ({ ...prev, [leadId]: data.replyText }))
      
      // Update lead status locally
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, status: 'viewed' as LeadStatus } : l
      ))
    } catch (error) {
      console.error('Failed to generate reply:', error)
      toast.error('Failed to generate reply')
    } finally {
      setGeneratingReplyFor(null)
    }
  }
  
  async function handleDismiss(leadId: string) {
    try {
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'dismissed' }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to dismiss lead')
      }
      
      setLeads(prev => prev.map(l => 
        l.id === leadId ? { ...l, status: 'dismissed' as LeadStatus } : l
      ))
      toast.success('Lead dismissed')
    } catch (error) {
      console.error('Failed to dismiss lead:', error)
      toast.error('Failed to dismiss lead')
    }
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
              <span className="ml-2">Scraping Reddit...</span>
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
