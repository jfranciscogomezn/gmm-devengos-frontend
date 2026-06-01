import { useCallback, useState } from 'react';
import { List } from 'react-bootstrap-icons';
import { Outlet } from 'react-router-dom';
import { AppFooter } from './AppFooter';
import { Sidebar } from '../Sidebar/Sidebar';
import { loadSidebarVisible, saveSidebarVisible } from '../../utils/sidebarNavState';
import layoutStyles from './AppLayout.module.css';

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => loadSidebarVisible());

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      saveSidebarVisible(next);
      return next;
    });
  }, []);

  return (
    <div className={layoutStyles.shell}>
      <div className={layoutStyles.body}>
        <Sidebar open={sidebarOpen} onToggle={toggleSidebar} />
        <div className={layoutStyles.mainColumn}>
          {!sidebarOpen && (
            <div className={layoutStyles.topBar}>
              <button
                type="button"
                className={layoutStyles.menuToggle}
                onClick={toggleSidebar}
                aria-label="Show navigation menu"
              >
                <List size={20} />
              </button>
            </div>
          )}
          <main className={layoutStyles.content}>
            <Outlet />
          </main>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
