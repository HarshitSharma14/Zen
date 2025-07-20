import './index.css'
import React, { Suspense, useEffect } from 'react'
import useAppStore from './store/useAppStore'
import PageLoader from './components/PageLoader'

// Lazy load components
const pages = {
    'menu': React.lazy(() => import('./pages/MenuPage')),
    'home': React.lazy(() => import('./pages/HomePage')),
    'session-setup': React.lazy(() => import('./pages/SessionSetup')),
    'session': React.lazy(() => import('./pages/ActiveSessionPage')),
    // settings: React.lazy(() => import('./pages/Settings'))
}

// Custom hook for page routing
const usePage = () => {
    const { currentPage } = useAppStore()
    return pages[currentPage] || pages.landing
}

function App() {
    const { initializeApp } = useAppStore()
    const PageComponent = usePage()

    // Initialize app and check for existing session on mount
    useEffect(() => {
        // Small delay to ensure store is hydrated from localStorage
        const timer = setTimeout(() => {
            initializeApp()
        }, 100)

        return () => clearTimeout(timer)
    }, [initializeApp])

    return (
        <Suspense fallback={<PageLoader />}>
            <PageComponent />
        </Suspense>
    )
}

export default App