import type { CourseSummary } from '../../courses/api/courseTypes'
import { httpClient } from '../../../shared/api/httpClient'

export interface Conversation {
  conversationId: number
  title: string
  createdAt?: string
}

export interface Recommendation {
  content: string
  courses: CourseSummary[]
  sportOptions: { sportName: string; reason: string }[]
}

export interface ChatMessage {
  messageId: number
  role: 'USER' | 'ASSISTANT'
  content: string
  recommendation: Recommendation | null
  createdAt?: string
}

export async function getConversations(): Promise<Conversation[]> {
  const response = await httpClient.get<Conversation[]>('/api/chat/conversations')
  return response.data
}

export async function createConversation(): Promise<Conversation> {
  const response = await httpClient.post<Conversation>('/api/chat/conversations')
  return response.data
}

export async function getMessages(conversationId: number): Promise<ChatMessage[]> {
  const response = await httpClient.get<ChatMessage[]>(`/api/chat/conversations/${conversationId}/messages`)
  return response.data
}

export async function sendMessage(conversationId: number, content: string): Promise<ChatMessage> {
  const response = await httpClient.post<ChatMessage>(`/api/chat/conversations/${conversationId}/messages`, { content })
  return response.data
}
