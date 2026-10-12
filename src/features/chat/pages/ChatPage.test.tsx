import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ChatPage } from './ChatPage'

let conversationCreated = false
let messages: { messageId: number; role: string; content: string; recommendation: unknown }[] = []
const server = setupServer(
  http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' }, errorCode: null, message: null })),
  http.get('*/api/chat/conversations', () => HttpResponse.json(conversationCreated ? [{ conversationId: 7, title: '새로운 대화', createdAt: '2026-10-12T10:00:00' }] : [])),
  http.post('*/api/chat/conversations', () => { conversationCreated = true; return HttpResponse.json({ conversationId: 7, title: '새로운 대화' }) }),
  http.get('*/api/chat/conversations/7/messages', () => HttpResponse.json(messages)),
  http.post('*/api/chat/conversations/7/messages', async ({ request }) => {
    const body = await request.json() as { content: string }
    if (body.content !== '수영 추천해줘') return new HttpResponse(null, { status: 400 })
    const reply = { messageId: 10, role: 'ASSISTANT', content: '수영을 추천해요.', recommendation: { content: '수영을 추천해요.', courses: [{ courseId: 1, courseName: '초급 수영', sportCode: '01', sportName: '수영', facilityName: '체육관', address: '원주시', startTime: '09:00', endTime: '10:00', weekdays: '월', fee: 10000 }], sportOptions: [] } }
    messages = [{ messageId: 9, role: 'USER', content: body.content, recommendation: null }, reply]
    return HttpResponse.json(reply)
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('ChatPage', () => {
  it('creates_a_conversation_and_shows_reply_and_recommended_course', async () => {
    conversationCreated = false
    messages = []
    const user = userEvent.setup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><ChatPage /></MemoryRouter></QueryClientProvider>)

    await user.click(await screen.findByRole('button', { name: '새 대화' }))
    await user.type(await screen.findByRole('textbox', { name: '메시지' }), '수영 추천해줘')
    await user.click(screen.getByRole('button', { name: '전송' }))

    expect(await screen.findByText('수영을 추천해요.')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: '초급 수영' })).toHaveAttribute('href', '/courses/1')
  })
})
