import { Navigate, Route, Routes } from 'react-router';
import { AppLayout } from './components/AppLayout.jsx';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage.jsx';
import { ApplicationListPage } from './pages/ApplicationListPage.jsx';

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<ApplicationListPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
