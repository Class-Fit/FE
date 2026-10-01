import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppShell } from './AppShell'

function renderShell(child = <p>자식 화면</p>) {
  return render(
    <MemoryRouter initialEntries={['/courses']}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="courses" element={child} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe('AppShell', () => {
  it('renders_desktop_and_mobile_navigation', () => {
    renderShell()

    for (const label of ['홈', '강좌 찾기', 'AI 운동 추천', '인바디', '찜']) {
      expect(screen.getAllByText(label)).toHaveLength(2)
    }

    for (const link of document.querySelectorAll('a[href="/courses"]')) {
      expect(link).toHaveAttribute('href', '/courses')
    }
    expect(document.querySelectorAll('a[href="/courses"]')).toHaveLength(2)
  })

  it('renders_nested_route_content', () => {
    renderShell(<h1>강좌 검색 결과</h1>)

    expect(screen.getByRole('heading', { name: '강좌 검색 결과' })).toBeInTheDocument()
  })
})
