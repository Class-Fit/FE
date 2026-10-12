import { NavLink, Outlet } from 'react-router-dom'
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
            <a className={styles.kakaoLogin} href={kakaoLoginUrl}>카카오 로그인</a>
          </div>
        </div>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>

      <Navigation mobile />
    </div>
  )
}
