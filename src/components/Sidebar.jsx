import { LayoutDashboard, Smartphone, Users, ShoppingCart, TrendingUp, LogOut, DollarSign } from 'lucide-react';

const NAV = [
  { id: 'dashboard', label: 'Panel', icon: LayoutDashboard },
  { id: 'phones', label: 'Stock', icon: Smartphone },
  { id: 'buyers', label: 'Compradores', icon: Users },
  { id: 'sales', label: 'Ventas', icon: ShoppingCart },
  { id: 'expenses', label: 'Gastos', icon: DollarSign },
  { id: 'stats', label: 'Estadísticas', icon: TrendingUp },
];

export default function Sidebar({ page, onNavigate, onLogout, className = '' }) {
  return (
    <div className={`sidebar ${className}`}>
      <div className="sidebar-logo">
        <div className="logo-mark">É</div>
        <div> 
          <h1>ÉXODO</h1>
          <span>Gestión de iPhones</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menú</div>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`nav-item ${page === id ? 'active' : ''}`}
            onClick={() => onNavigate(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item" onClick={onLogout} style={{ width: '100%' }}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
