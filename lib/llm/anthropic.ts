import Anthropic from '@anthropic-ai/sdk'
import type { LLMProvider, LLMMessage, LLMResponse } from './provider'

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateReply(messages: LLMMessage[]): Promise<LLMResponse> {
    // Extract system message
    const systemMessage = messages.find(m => m.role === 'system')
    const chatMessages = messages.filter(m => m.role !== 'system')

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: systemMessage?.content || '',
      messages: chatMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const content = response.content[0]?.type === 'text' 
      ? response.content[0].text 
      : ''

    return {
      content,
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
    }
  }
}
