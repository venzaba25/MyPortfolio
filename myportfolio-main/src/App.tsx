import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import SplashCursor from './components/ui/SplashCursor'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname === '/admin'

  return (
    <>
      {!isAdmin && <SplashCursor />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </>
  )
}

export default App
