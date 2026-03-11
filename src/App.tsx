import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import EmployeesPage from './pages/EmployeesPage'
import { ToastProvider } from './components/Toast'

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ color: '#1e293b', fontFamily: 'inherit' }}>{title}</h1>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Sidebar />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<PlaceholderPage title="Dashboard" />} />
              <Route path="/employees" element={<EmployeesPage />} />
              <Route path="/logs" element={<PlaceholderPage title="Logs" />} />
              <Route path="/leave-requests" element={<PlaceholderPage title="Leave Requests" />} />
              <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
              <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
