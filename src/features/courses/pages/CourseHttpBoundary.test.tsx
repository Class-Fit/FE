import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { CourseDetailPage } from './CourseDetailPage'

const server = setupServer(
  http.get('*/api/courses/:id', () => HttpResponse.json({
    success: false, data: null, errorCode: 'RESOURCE_NOT_FOUND', message: '요청한 리소스를 찾을 수 없습니다.',
  }, { status: 404 })),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('course HTTP boundaries', () => {
  it('shows_not_found_for_the_backend_404_contract', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/courses/123']}>
          <Routes><Route path="/courses/:courseId" element={<CourseDetailPage />} /></Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )
    expect(await screen.findByRole('heading', { name: '강좌를 찾을 수 없습니다.' })).toBeInTheDocument()
  })
})
