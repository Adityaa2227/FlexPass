import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { CDPWalletProvider } from './providers/CDPWalletProvider'
import { ThemeProvider } from './providers/ThemeProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Dashboard } from './components/Dashboard'
import { Header } from './components/Header'
import { WalletConnect } from './components/WalletConnect'
import { BuyFlow } from './components/BuyFlow'
import { PassDetail } from './components/PassDetail'
import { AdminRoute } from './components/AdminRoute'
import { SpotifyClone } from './components/services/SpotifyClone'
import { ChatGPTClone } from './components/services/ChatGPTClone'
import { useCDPWallet } from './hooks/useCDPWallet'
import { initializeAccessibility } from './utils/accessibility'

function AppContent() {
  const { isConnected } = useCDPWallet()

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <WalletConnect />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/buy" element={<BuyFlow />} />
          <Route path="/pass/:tokenId" element={<PassDetail />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/service/spotify" element={<SpotifyClone />} />
          <Route path="/service/chatgpt" element={<ChatGPTClone />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  useEffect(() => {
    initializeAccessibility()
  }, [])

  return (
    <ErrorBoundary>
      <Router>
        <ThemeProvider>
          <CDPWalletProvider>
            <AppContent />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-gray-800 dark:text-white',
              }}
            />
          </CDPWalletProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
