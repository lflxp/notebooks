import { Header } from '@/components/layout/header'
// import { Footer } from '@/components/layout/footer'
import { Main } from '@/components/layout/main'
import { TopNav } from '@/components/layout/top-nav'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { ConfigDrawer } from '@/components/config-drawer'
import { VSCodeStyleFooter } from '@/components/layout/footer2'

type TopNavItem = {
  title: string
  href: string
  isActive: boolean
  disabled: boolean
}


export default function Layout({
  children,
  topNav,
  height = 56,
  footers = 36,
}: {
  children: React.ReactNode
  topNav: TopNavItem[]
  height?: number
  footers?: number
}) {
  // 定义头部和底部高度
  const headerHeight = height; // px，按你的Header实际高度调整
  const footerHeight = footers; // px，对应VSCodeStyleFooter的h-9
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header>
        <TopNav links={topNav} />
        <div className='ml-auto flex items-center space-x-4'>
          <Search />
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      {/* ===== Main ===== */}
      <Main
        className="relative"
        style={{
          paddingTop: `${headerHeight}px`,
          paddingBottom: `${footerHeight}px`,
          minHeight: `calc(100vh - ${headerHeight + footerHeight}px)`,
        }}
      >
        {children}
      </Main>

      {/* <Footer>
        <div className='ml-auto flex items-center space-x-4'>
          {usage}
        </div>
      </Footer> */}
      <VSCodeStyleFooter />
    </>
  )
}
