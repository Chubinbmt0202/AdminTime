import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast/Toast';
import AppRoutes from './routes';
import { AuthProvider } from './auth/AuthContext';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;