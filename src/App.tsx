import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import AdminDashboard from './pages/AdminDashboard'
import AdminInquiries from './pages/AdminInquiries'
import SplashCursor from './components/ui/SplashCursor'
import AdminInquiriesBadge from './components/AdminInquiriesBadge'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <>
      {!isAdmin && <SplashCursor />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/inquiries" element={<AdminInquiries />} />
      </Routes>
      <AdminInquiriesBadge />
    </>
  )
}

export default App
