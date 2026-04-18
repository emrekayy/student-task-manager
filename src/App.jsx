import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastProvider } from './components/ToastStack.jsx'
import { getIsLoggedIn } from './interfaces/auth.js'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'

function RootRedirect() {
  return <Navigate to={getIsLoggedIn() ? '/home' : '/login'} replace />
}

function CatchAll() {
  return <Navigate to={getIsLoggedIn() ? '/home' : '/login'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<CatchAll />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
