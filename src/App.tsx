// src/App.tsx
import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { ToastManager } from './core/components/Toast/Toast';
import './core/styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <ToastManager>
        <AppRoutes />
      </ToastManager>
    </BrowserRouter>
  );
}

export default App;