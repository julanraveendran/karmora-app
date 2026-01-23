import OpenAI from 'openai'
import type { LLMProvider, LLMMessage, LLMResponse } from './provider'

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  async generateReply(messages: LLMMessage[]): Promise<LLMResponse> {
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

    return {
      content,
      provider: 'openai',
      model: 'gpt-4o-mini',
    }
  }
}
