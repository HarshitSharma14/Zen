import './index.css'
import React, { Suspense } from 'react'
import useAppStore from './store/useAppStore'
import PageLoader from './components/PageLoader'

// Lazy load components
const pages = {
    menu: React.lazy(() => import('./pages/MenuPage')),
    home: React.lazy(() => import('./pages/HomePage')),
    'session-setup': React.lazy(() => import('./pages/SessionSetup')),
    // session: React.lazy(() => import('./pages/ActiveSession')),
    // settings: React.lazy(() => import('./pages/Settings'))
}

// Custom hook for page routing
const usePage = () => {
    const { currentPage } = useAppStore()
    return pages[currentPage] || pages.landing
}

function App() {
    const PageComponent = usePage()

    return (
        <Suspense fallback={<PageLoader />}>
            <PageComponent />
        </Suspense>
    )
}

export default App