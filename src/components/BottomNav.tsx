import type { SVGProps, ReactElement } from 'react'

type TabKey = 'home' | 'location' | 'gallery'
type IconComponent = (props: SVGProps<SVGSVGElement>) => ReactElement

type BottomNavProps = {
  activeTab: TabKey
  onTabChange: (tab: TabKey) => void
}

function HomeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <path d="M3 10.5L12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 9.8V20h11V9.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LocationIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <path
        d="M12 21s6.2-5.73 6.2-11A6.2 6.2 0 0 0 5.8 10c0 5.27 6.2 11 6.2 11Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  )
}

function GalleryIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" {...props}>
      <rect x="3.2" y="4" width="17.6" height="16" rx="2.4" />
      <circle cx="9" cy="10" r="1.4" />
      <path d="M20.8 16.2l-4.7-4.5-4.6 4-2.6-2.3-5.6 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs: Array<{ key: TabKey; label: string; icon: IconComponent }> = [
    { key: 'home', label: 'Home', icon: HomeIcon },
    { key: 'location', label: 'Location', icon: LocationIcon },
    { key: 'gallery', label: 'Gallery', icon: GalleryIcon },
  ]

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <div className="bottom-nav-container">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key

          return (
            <button
              key={tab.key}
              type="button"
              className={`nav-icon-btn ${isActive ? 'active' : ''}`}
              onClick={() => onTabChange(tab.key)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="nav-icon" aria-hidden="true" />
              <span className="nav-icon-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
