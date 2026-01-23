'use client'

import { useState, useEffect } from 'react'
import { Save, Plus, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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

export default function SettingsPage() {
  const [saving, setSaving] = useState(false)
  
  // Product profile state
  const [productName, setProductName] = useState('Karmora')
  const [oneLiner, setOneLiner] = useState('Turn Reddit into your consistent lead engine')
  const [icp, setIcp] = useState('SaaS founders and indie hackers looking to grow through Reddit')
  const [websiteUrl, setWebsiteUrl] = useState('https://karmora.com')
  const [replyStyle, setReplyStyle] = useState<ReplyStyle>('helpful_concise')
  const [softMention, setSoftMention] = useState(false)
  
  // Subreddits state
  const [subreddits, setSubreddits] = useState<string[]>(['startups', 'entrepreneur', 'SaaS'])
  const [newSubreddit, setNewSubreddit] = useState('')
  
  async function handleSaveProfile() {
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
    
    setSaving(true)
    try {
      // TODO: Call API to save profile
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Product profile saved')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }
  
  function handleAddSubreddit() {
    const cleaned = newSubreddit.trim().toLowerCase().replace(/^r\//, '')
    if (!cleaned) return
    if (subreddits.includes(cleaned)) {
      toast.error('Subreddit already added')
      return
    }
    if (subreddits.length >= 5) {
      toast.error('Maximum 5 subreddits allowed')
      return
    }
    
    setSubreddits([...subreddits, cleaned])
    setNewSubreddit('')
    toast.success(`Added r/${cleaned}`)
  }
  
  function handleRemoveSubreddit(sub: string) {
    setSubreddits(subreddits.filter(s => s !== sub))
    toast.success(`Removed r/${sub}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight mb-8 text-[#0A0A0A]">
        Settings
      </h1>
      
      {/* Product Profile Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Profile</CardTitle>
          <CardDescription>
            This information is used to generate personalized replies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="productName">Product Name *</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Karmora"
              maxLength={40}
            />
            <p className="text-xs text-[#9A9A9A]">{productName.length}/40 characters</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="oneLiner">One-liner Value Prop *</Label>
            <Textarea
              id="oneLiner"
              value={oneLiner}
              onChange={(e) => setOneLiner(e.target.value)}
              placeholder="What does your product do in one sentence?"
              rows={2}
            />
            <p className="text-xs text-[#9A9A9A]">Min 20 characters · {oneLiner.length} entered</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="icp">Who is it for? (ICP) *</Label>
            <Textarea
              id="icp"
              value={icp}
              onChange={(e) => setIcp(e.target.value)}
              placeholder="Describe your ideal customer"
              rows={2}
            />
            <p className="text-xs text-[#9A9A9A]">Min 20 characters · {icp.length} entered</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="websiteUrl">Website URL</Label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://your-product.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="replyStyle">Reply Style</Label>
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
            <Label className="cursor-pointer" onClick={() => setSoftMention(!softMention)}>
              Include subtle product mention in replies
            </Label>
          </div>
          
          <Button
            onClick={handleSaveProfile}
            disabled={saving}
            className="rounded-full"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span className="ml-2">Save Profile</span>
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Subreddit Targets Section */}
      <Card>
        <CardHeader>
          <CardTitle>Subreddit Targets</CardTitle>
          <CardDescription>
            Select up to 5 subreddits to monitor for leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Current subreddits */}
          <div className="flex flex-wrap gap-2 mb-4">
            {subreddits.map(sub => (
              <Badge
                key={sub}
                variant="default"
                className="px-3 py-1.5 text-sm flex items-center gap-1.5"
              >
                r/{sub}
                <button
                  onClick={() => handleRemoveSubreddit(sub)}
                  className="hover:opacity-70 transition-opacity"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
            {subreddits.length === 0 && (
              <span className="text-sm text-[#9A9A9A]">
                No subreddits selected
              </span>
            )}
          </div>
          
          {/* Add subreddit */}
          {subreddits.length < 5 && (
            <div className="flex gap-2">
              <Input
                value={newSubreddit}
                onChange={(e) => setNewSubreddit(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSubreddit()}
                placeholder="Enter subreddit name..."
                className="flex-1"
              />
              <Button onClick={handleAddSubreddit} className="rounded-full">
                <Plus size={16} />
                <span className="ml-1">Add</span>
              </Button>
            </div>
          )}
          
          <p className="text-xs mt-3 text-[#9A9A9A]">
            {subreddits.length}/5 subreddits selected
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
