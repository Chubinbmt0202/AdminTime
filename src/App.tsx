import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/common/Toast/Toast';
import AppRoutes from './routes';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;