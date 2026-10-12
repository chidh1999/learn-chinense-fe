import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/library', label: 'Thư viện' },
  { to: '/items/new', label: 'Thêm mục' },
  { to: '/review', label: 'Ôn tập' },
  { to: '/statistics', label: 'Thống kê' },
  { to: '/settings', label: 'Cài đặt' },
];

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">中</span>
          <div>
            <strong>Chinese Learning</strong>
            <p>Ghi lại và ôn những gì bạn tự học</p>
          </div>
        </div>
        <nav className="nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
