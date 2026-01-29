// Apify Reddit Scraper integration
// Uses the trudax/reddit-scraper-lite actor

export interface RedditPost {
  id: string
  parsedId: string
  url: string
  username: string
  title: string
  communityName: string
  parsedCommunityName: string
  body: string
  numberOfComments: number
  upVotes: number
  createdAt: string
  scrapedAt: string
  dataType: 'post' | 'comment'
}

export interface ApifyRunResponse {
  data: {
    id: string
    status: string
    defaultDatasetId: string
  }
}

const APIFY_BASE_URL = 'https://api.apify.com/v2'
const ACTOR_ID = 'trudax~reddit-scraper-lite'

function getApiToken(): string {
  const token = process.env.APIFY_API_TOKEN
  if (!token) {
    throw new Error('APIFY_API_TOKEN environment variable is not set')
  }
  return token
}

/**
 * Start a Reddit scraping run for the given subreddits
 */
export async function startRedditScrape(
  subreddits: string[],
  maxItemsPerSubreddit: number = 30
): Promise<string> {
  const token = getApiToken()
  
  // Build URLs for each subreddit (sorted by new)
  const startUrls = subreddits.map(sub => ({
    url: `https://www.reddit.com/r/${sub}/new/`
  }))
  
  const response = await fetch(
    `${APIFY_BASE_URL}/acts/${ACTOR_ID}/runs?token=${token}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        startUrls,
        maxItems: maxItemsPerSubreddit * subreddits.length,
        skipComments: true,
        skipUserPosts: true,
        skipCommunity: true,
      }),
    }
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    let errorMessage = `Apify API error (${response.status}): ${errorText}`
    
    // Try to parse as JSON for better error message
    try {
      const errorJson = JSON.parse(errorText)
      if (errorJson.error?.message) {
        errorMessage = `Apify API error: ${errorJson.error.message}`
      }
    } catch {
      // Keep the text error if not JSON
    }
    
    console.error('Apify startRedditScrape error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    })
    
    throw new Error(errorMessage)
  }
  
  const result: ApifyRunResponse = await response.json()
  return result.data.id
}

/**
 * Check the status of a scraping run
 */
export async function getRunStatus(runId: string): Promise<{
  status: string
  datasetId: string
}> {
  const token = getApiToken()
  
  const response = await fetch(
    `${APIFY_BASE_URL}/actor-runs/${runId}?token=${token}`
  )
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('Apify getRunStatus error:', {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
      runId,
    })
    throw new Error(`Failed to get run status (${response.status}): ${errorText}`)
  }
  
  const result = await response.json()
  return {
    status: result.data.status,
    datasetId: result.data.defaultDatasetId,
  }
}

/**
 * Wait for a run to complete (with timeout)
 */
export async function waitForRun(
  runId: string,
  timeoutMs: number = 120000,
  pollIntervalMs: number = 3000
): Promise<string> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeoutMs) {
    const { status, datasetId } = await getRunStatus(runId)
    
    if (status === 'SUCCEEDED') {
      return datasetId
    }
    
    if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
      throw new Error(`Apify run failed with status: ${status}`)
    }
    
    // Still running, wait and poll again
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs))
  }
  
  throw new Error('Apify run timed out')
}

/**
 * Fetch results from a completed run's dataset
 */
export async function getDatasetItems(datasetId: string): Promise<RedditPost[]> {
  const token = getApiToken()
  
  const response = await fetch(
    `${APIFY_BASE_URL}/datasets/${datasetId}/items?token=${token}`
  )
  
  if (!response.ok) {
    throw new Error(`Failed to fetch dataset items: ${response.statusText}`)
  }
  
  const items: RedditPost[] = await response.json()
  
  // Filter to only posts (not comments or other types)
  return items.filter(item => item.dataType === 'post')
}

/**
 * High-level function: Scrape subreddits and return posts
 * This handles the full flow: start run -> wait -> get results
 */
export async function scrapeSubreddits(
  subreddits: string[],
  maxItemsPerSubreddit: number = 30
): Promise<RedditPost[]> {
  try {
    console.log(`Starting Reddit scrape for subreddits: ${subreddits.join(', ')}`)
    
    // Start the scraping run
    const runId = await startRedditScrape(subreddits, maxItemsPerSubreddit)
    console.log(`Apify run started: ${runId}`)
    
    // Wait for completion
    const datasetId = await waitForRun(runId)
    console.log(`Apify run completed, dataset: ${datasetId}`)
    
    // Fetch and return results
    const posts = await getDatasetItems(datasetId)
    console.log(`Fetched ${posts.length} posts from Reddit`)
    
    return posts
  } catch (error) {
    console.error('scrapeSubreddits error:', error)
    // Re-throw with more context
    if (error instanceof Error) {
      throw new Error(`Reddit scraping failed: ${error.message}`)
    }
    throw error
  }
}
