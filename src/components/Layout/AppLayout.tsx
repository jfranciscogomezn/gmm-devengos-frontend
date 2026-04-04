import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Sidebar/Sidebar';

export function AppLayout() {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <main className="flex-grow-1 bg-light" style={{ overflow: 'auto' }}>
        <div className="p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
