import { NavLink, Outlet } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { logout } from '../../features/auth/api/memberApi'
import { useCurrentMember } from '../../features/auth/hooks/useCurrentMember'
import { backendOrigin } from '../../shared/api/backendOrigin'
import { NAVIGATION_ITEMS } from '../navigation/navigationItems'
import styles from './AppShell.module.css'

const kakaoLoginUrl = `${backendOrigin || ''}/oauth2/authorization/kakao`

function Navigation({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav
      className={mobile ? styles.mobileNavigation : styles.desktopNavigation}
      aria-label={mobile ? '모바일 주 메뉴' : '주 메뉴'}
    >
      {NAVIGATION_ITEMS.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `${styles.navigationLink} ${isActive ? styles.active : ''}`}
        >
          <Icon aria-hidden="true" size={mobile ? 20 : 18} strokeWidth={2} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export function AppShell() {
  const queryClient = useQueryClient()
  const memberQuery = useCurrentMember()
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(['member'], null)
      queryClient.removeQueries({ queryKey: ['favorites'] })
      queryClient.removeQueries({ queryKey: ['chat'] })
      queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  return (
    <div className={styles.appShell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <NavLink className={styles.brand} to="/" aria-label="ClassFit 홈">
            <span className={styles.brandMark}>C</span>
            <span>ClassFit</span>
          </NavLink>
          <div className={styles.headerActions}>
            <Navigation />
            {memberQuery.isPending ? null : memberQuery.isError ? (
              <button type="button" className={styles.authAction} onClick={() => memberQuery.refetch()}>로그인 상태 다시 시도</button>
            ) : memberQuery.data ? (
              <button
                type="button"
                className={styles.authAction}
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
              >
                {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
              </button>
            ) : (
              <a className={styles.kakaoLogin} href={kakaoLoginUrl}>카카오 로그인</a>
            )}
          </div>
        </div>
      </header>

      {logoutMutation.isError && <p className={styles.authError} role="alert">로그아웃하지 못했습니다. 다시 시도해주세요.</p>}

      <main className={styles.content}>
        <Outlet />
      </main>

      <Navigation mobile />
    </div>
  )
}
