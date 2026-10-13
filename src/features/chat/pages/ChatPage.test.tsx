import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ChatPage } from './ChatPage'

let conversationCreated = false
let messages: { messageId: number; role: string; content: string; recommendation: unknown }[] = []
let savedWeight: number | null = null
const server = setupServer(
  http.get('*/api/members/me', () => HttpResponse.json({ success: true, data: { id: 1, name: '테스터', email: 'test@example.com', gender: 'UNKNOWN', role: 'USER' }, errorCode: null, message: null })),
  http.get('*/api/chat/conversations', () => HttpResponse.json(conversationCreated ? [{ conversationId: 7, title: '새로운 대화', createdAt: '2026-10-12T10:00:00' }] : [])),
  http.post('*/api/chat/conversations', () => { conversationCreated = true; return HttpResponse.json({ conversationId: 7, title: '새로운 대화' }) }),
  http.get('*/api/chat/conversations/7/messages', () => HttpResponse.json(messages)),
  http.post('*/api/chat/conversations/7/messages', async ({ request }) => {
    const body = await request.json() as { content: string }
    if (body.content !== '수영 추천해줘' && !body.content.includes('인바디')) return new HttpResponse(null, { status: 400 })
    const reply = { messageId: 10, role: 'ASSISTANT', content: '수영을 추천해요.', recommendation: { content: '수영을 추천해요.', courses: [{ courseId: 1, courseName: '초급 수영', sportCode: '01', sportName: '수영', facilityName: '체육관', address: '원주시', startTime: '09:00', endTime: '10:00', weekdays: '월', fee: 10000 }], sportOptions: [] } }
    messages = [{ messageId: 9, role: 'USER', content: body.content, recommendation: null }, reply]
    return HttpResponse.json(reply)
  }),
  http.post('*/api/inbodies/analyze', async ({ request }) => {
    if (!request.headers.get('content-type')?.startsWith('multipart/form-data')) return new HttpResponse(null, { status: 400 })
    return HttpResponse.json({ heightCm: 170, weightKg: 65, bodyFatPercentage: 20, skeletalMuscleMassKg: 28, bodyFatMassKg: 13, bmi: 22.5 })
  }),
  http.post('*/api/inbodies', async ({ request }) => {
    const body = await request.json() as { weightKg: number }
    savedWeight = body.weightKg
    return HttpResponse.json({ inBodyId: 1, ...body, createdAt: '2026-10-13T10:00:00' })
  }),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => { conversationCreated = false; messages = []; savedWeight = null })
afterAll(() => server.close())

describe('ChatPage', () => {
  it('creates_a_conversation_and_shows_reply_and_recommended_course', async () => {
    const user = userEvent.setup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><ChatPage /></MemoryRouter></QueryClientProvider>)

    await user.click(await screen.findByRole('button', { name: '새 대화' }))
    await user.type(await screen.findByRole('textbox', { name: '메시지' }), '수영 추천해줘')
    await user.click(screen.getByRole('button', { name: '전송' }))

    expect(await screen.findByText('수영을 추천해요.')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: '초급 수영' })).toHaveAttribute('href', '/courses/1')
  })

  it('reviews_extracted_inbody_values_before_saving_and_recommending', async () => {
    const user = userEvent.setup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><ChatPage /></MemoryRouter></QueryClientProvider>)

    await user.upload(await screen.findByLabelText('인바디 사진'), new File(['image'], 'test.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: '사진 분석하기' }))
    const weight = await screen.findByRole('spinbutton', { name: '체중 (kg)' })
    await user.clear(weight)
    await user.type(weight, '66')
    await user.click(screen.getByRole('button', { name: '저장하고 추천받기' }))

    expect(await screen.findByText('수영을 추천해요.')).toBeInTheDocument()
    expect(savedWeight).toBe(66)
  })

  it('allows_retry_after_image_analysis_fails', async () => {
    let attempts = 0
    server.use(http.post('*/api/inbodies/analyze', () => {
      attempts += 1
      return attempts === 1
        ? HttpResponse.json({ success: false, errorCode: 'INBODY_IMAGE_ANALYSIS_FAILED', message: '분석 실패' }, { status: 500 })
        : HttpResponse.json({ heightCm: 170, weightKg: 65, bodyFatPercentage: 20, skeletalMuscleMassKg: 28, bodyFatMassKg: 13, bmi: 22.5 })
    }))
    const user = userEvent.setup()
    render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><ChatPage /></MemoryRouter></QueryClientProvider>)

    await user.upload(await screen.findByLabelText('인바디 사진'), new File(['image'], 'test.png', { type: 'image/png' }))
    await user.click(screen.getByRole('button', { name: '사진 분석하기' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('사진을 분석하지 못했습니다.')
    await user.click(screen.getByRole('button', { name: '사진 분석하기' }))

    expect(await screen.findByRole('spinbutton', { name: '체중 (kg)' })).toHaveValue(65)
  })
})
