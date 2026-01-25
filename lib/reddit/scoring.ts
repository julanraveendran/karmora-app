// Intent scoring for Reddit posts
// Based on the PRD heuristics for identifying high-intent leads

import type { RedditPost } from './apify'

// High-intent phrases that indicate someone is looking for solutions
const HIGH_INTENT_PHRASES = [
  'any recommendations',
  'looking for',
  'alternative to',
  'tool for',
  'how do i',
  'what\'s the best',
  'whats the best',
  'need help',
  'struggling with',
  'can anyone recommend',
  'does anyone know',
  'suggestions for',
  'best way to',
  'how can i',
  'is there a',
  'are there any',
  'recommend a',
  'recommend me',
  'help me find',
  'advice on',
  'tips for',
]

// Phrases that indicate the post is likely not a good lead
const EXCLUDE_PHRASES = [
  'survey',
  'research study',
  'academic research',
  'i\'m conducting',
  'im conducting',
  'please fill out',
  'fill out this',
  'ama ',
  ' ama',
  'ask me anything',
]

export interface ScoredPost extends RedditPost {
  intentScore: number
  scoreReasons: string[]
}

/**
 * Calculate intent score for a Reddit post
 * Higher score = more likely to be a valuable lead
 * 
 * Scoring rules from PRD:
 * +2 if question mark in title
 * +2 if contains "looking for" / "alternative to"
 * +1 if contains "recommendations"
 * -2 if contains "survey"
 * -1 if post body < 40 chars
 */
export function calculateIntentScore(post: RedditPost): ScoredPost {
  let score = 0
  const reasons: string[] = []
  
  const titleLower = post.title.toLowerCase()
  const bodyLower = (post.body || '').toLowerCase()
  const combined = `${titleLower} ${bodyLower}`
  
  // +2 if question mark in title
  if (post.title.includes('?')) {
    score += 2
    reasons.push('Question in title (+2)')
  }
  
  // Check for high-intent phrases
  for (const phrase of HIGH_INTENT_PHRASES) {
    if (combined.includes(phrase)) {
      if (phrase.includes('looking for') || phrase.includes('alternative to')) {
        score += 2
        reasons.push(`High-intent phrase: "${phrase}" (+2)`)
      } else if (phrase.includes('recommend')) {
        score += 1
        reasons.push(`Recommendation request: "${phrase}" (+1)`)
      } else {
        score += 1
        reasons.push(`Intent phrase: "${phrase}" (+1)`)
      }
      break // Only count one phrase match
    }
  }
  
  // Check for exclude phrases
  for (const phrase of EXCLUDE_PHRASES) {
    if (combined.includes(phrase)) {
      score -= 2
      reasons.push(`Exclude phrase: "${phrase}" (-2)`)
      break
    }
  }
  
  // -1 if post body is too short (likely just a link or low effort)
  if (post.body && post.body.length < 40) {
    score -= 1
    reasons.push('Short body (<40 chars) (-1)')
  }
  
  // Bonus for engagement (some discussion happening)
  if (post.numberOfComments >= 5) {
    score += 1
    reasons.push('Good engagement (5+ comments) (+1)')
  }
  
  return {
    ...post,
    intentScore: score,
    scoreReasons: reasons,
  }
}

/**
 * Filter and score posts, returning only those that meet the threshold
 */
export function filterHighIntentPosts(
  posts: RedditPost[],
  minScore: number = 2
): ScoredPost[] {
  return posts
    .map(calculateIntentScore)
    .filter(post => post.intentScore >= minScore)
    .sort((a, b) => b.intentScore - a.intentScore) // Highest score first
}

/**
 * Check if a post is within the time window (default: 7 days)
 */
export function isWithinTimeWindow(
  post: RedditPost,
  windowDays: number = 7
): boolean {
  const postDate = new Date(post.createdAt)
  const now = new Date()
  const diffMs = now.getTime() - postDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays <= windowDays
}

/**
 * Full processing pipeline: filter by time, score, and return qualified leads
 */
export function processRedditPosts(
  posts: RedditPost[],
  options: {
    windowDays?: number
    minScore?: number
  } = {}
): ScoredPost[] {
  const { windowDays = 7, minScore = 2 } = options
  
  // Filter by time window first
  const recentPosts = posts.filter(post => isWithinTimeWindow(post, windowDays))
  
  // Score and filter by intent
  const qualifiedLeads = filterHighIntentPosts(recentPosts, minScore)
  
  console.log(`Processed ${posts.length} posts -> ${recentPosts.length} recent -> ${qualifiedLeads.length} qualified leads`)
  
  return qualifiedLeads
}
