import OpenAI from 'openai'
import type { LLMProvider, LLMMessage, LLMResponse } from './provider'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }
    this.client = new OpenAI({
      apiKey,
    })
  }

  async generateReply(messages: LLMMessage[]): Promise<LLMResponse> {
    try {
      console.log('OpenAI: Sending request...')
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 500,
        temperature: 0.7,
      })

      const content = response.choices[0]?.message?.content || ''
      console.log('OpenAI: Response received, length:', content.length)

      return {
        content,
        provider: 'openai',
        model: 'gpt-4o-mini',
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      throw error
    }
  }
}
