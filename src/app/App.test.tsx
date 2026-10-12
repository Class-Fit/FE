import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { App } from './App'

const server = setupServer(
  http.get('*/api/members/me', () => HttpResponse.json({ success: false, data: null, errorCode: 'UNAUTHORIZED', message: '로그인이 필요합니다.' }, { status: 401 })),
)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

describe('App', () => {
  it('renders_classfit_application_root', () => {
    render(
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <MemoryRouter>
          <App />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'ClassFit' })).toBeInTheDocument()
  })
})
