// Provider-agnostic LLM wrapper for Karmora

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  content: string
  provider: string
  model: string
}

export interface LLMProvider {
  generateReply(messages: LLMMessage[]): Promise<LLMResponse>
}

export type ProviderType = 'openai' | 'anthropic'

// Get the configured LLM provider
export async function getLLMProvider(type?: ProviderType): Promise<LLMProvider> {
  // Default to OpenAI, but can be configured via env
  const providerType = type || (process.env.LLM_PROVIDER as ProviderType) || 'openai'
  
  switch (providerType) {
    case 'openai':
      const { OpenAIProvider } = await import('./openai')
      return new OpenAIProvider()
    case 'anthropic':
      const { AnthropicProvider } = await import('./anthropic')
      return new AnthropicProvider()
    default:
      throw new Error(`Unknown LLM provider: ${providerType}`)
  }
}

// System prompt for generating Reddit replies
export function getReplySystemPrompt(productProfile: {
  productName: string
  oneLiner: string
  icp: string
  websiteUrl?: string | null
  replyStyle: string
  softMention: boolean
}): string {
  const styleInstructions: Record<string, string> = {
    helpful_concise: 'Be helpful and concise. Get to the point quickly while still being warm.',
    friendly_conversational: 'Be friendly and conversational. Use a casual tone like talking to a friend.',
    technical_direct: 'Be technical and direct. Provide specific details and skip the fluff.',
  }

  const mentionInstructions = productProfile.softMention
    ? `If naturally relevant, you may briefly mention ${productProfile.productName} (${productProfile.oneLiner}) but keep it subtle - max one sentence, no hard sell.`
    : `Do NOT mention any specific products or tools by name. Focus purely on helping with the problem.`

  return `You are a helpful Reddit community member who genuinely wants to help people solve their problems.

About the product you represent (for context only):
- Name: ${productProfile.productName}
- Value prop: ${productProfile.oneLiner}
- Target audience: ${productProfile.icp}
${productProfile.websiteUrl ? `- Website: ${productProfile.websiteUrl}` : ''}

Writing style: ${styleInstructions[productProfile.replyStyle] || styleInstructions.helpful_concise}

${mentionInstructions}

RULES (you MUST follow these):
1. Sound like a real person, not a marketer
2. Lead with genuine value - solve their actual problem first
3. Include at least one actionable tip unrelated to any product
4. NO "DM me" language
5. NO exaggerated claims ("best ever", "guaranteed")
6. NO obvious marketing CTAs ("Sign up now", "Check out our...")
7. Keep it 80-120 words unless the topic requires more detail
8. Match the subreddit's tone and culture
9. If you don't know something, say so honestly`
}
