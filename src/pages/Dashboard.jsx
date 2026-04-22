import { useState, useEffect } from 'react';
import { phonesApi, salesApi, expensesApi, buyersApi } from '../api';
import { Smartphone, ShoppingCart, TrendingUp, DollarSign, AlertTriangle } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);

export default function Dashboard() {
  const [phones, setPhones] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [buyers, setBuyers] = useState([]);

  useEffect(() => {
    const u1 = phonesApi.subscribe(setPhones);
    const u2 = salesApi.subscribe(setSales);
    const u3 = expensesApi.subscribe(setExpenses);
    const u4 = buyersApi.subscribe(setBuyers);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const stock = phones.filter(p => p.status === 'disponible').length;
  const vendidos = phones.filter(p => p.status === 'vendido').length;
  const totalIngresos = sales.reduce((a, s) => a + Number(s.salePrice || 0), 0);
  const totalCostos = sales.reduce((a, s) => a + Number(s.costPrice || 0), 0);
  const gananciaTotal = totalIngresos - totalCostos;
  const totalGastos = expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const gananciaNeta = gananciaTotal - totalGastos;

  const recentSales = sales.slice(0, 6);
  const getPhone = (id) => phones.find(p => p.id === id);
  const getBuyer = (id) => buyers.find(b => b.id === id);

  const sinCosto = phones.filter(p => p.status === 'disponible' && !p.costPrice);

  return (
    <>
      <div className="page-header">
        <div><h2>Panel Principal</h2><p>Resumen general de ÉXODO</p></div>
      </div>
      <div className="page-body fade-up">

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Smartphone size={18} /></div>
            <div className="stat-label">Stock disponible</div>
            <div className="stat-value">{stock}</div>
            <div className="stat-sub">{vendidos} vendidos en total</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><ShoppingCart size={18} /></div>
            <div className="stat-label">Ventas</div>
            <div className="stat-value">{sales.length}</div>
            <div className="stat-sub">{buyers.length} compradores registrados</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><DollarSign size={18} /></div>
            <div className="stat-label">Ingresos totales</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(totalIngresos)}</div>
            <div className="stat-sub">Costo: {fmt(totalCostos)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><TrendingUp size={18} /></div>
            <div className="stat-label">Ganancia neta</div>
            <div className="stat-value" style={{ fontSize: 20 }}>{fmt(gananciaNeta)}</div>
            <div className="stat-sub">Gastos descontados: {fmt(totalGastos)}</div>
          </div>
        </div>

        {sinCosto.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {sinCosto.map(p => (
              <div key={p.id} className="alert">
                <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                <span><strong>{p.model}</strong> ({p.storage}, {p.color}) — no tiene precio de costo cargado</span>
              </div>
            ))}
          </div>
        )}

        <div className="dashboard-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>Últimas Ventas</h3>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>Operaciones recientes</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentSales.length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin ventas registradas</p>}
              {recentSales.map(s => {
                const phone = getPhone(s.phoneId);
                const buyer = getBuyer(s.buyerId);
                const ganancia = Number(s.salePrice || 0) - Number(s.costPrice || 0);
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{phone?.model || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{buyer?.name || 'Sin comprador'} · {s.saleDate}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'Bebas Neue', fontSize: 15 }}>{fmt(s.salePrice)}</div>
                      <div style={{ fontSize: 10, color: 'var(--text3)' }}>+{fmt(ganancia)} ganancia</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1 }}>Stock Disponible</h3>
              <p style={{ fontSize: 11, color: 'var(--text3)' }}>Equipos listos para vender</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {phones.filter(p => p.status === 'disponible').length === 0 && <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin stock disponible</p>}
              {phones.filter(p => p.status === 'disponible').slice(0, 6).map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 7, background: 'var(--bg4)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.photo ? <img src={p.photo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : <Smartphone size={16} color="var(--text3)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--text3)' }}>{p.storage} · {p.color} · {p.condition}</div>
                  </div>
                  <div style={{ fontFamily: 'Bebas Neue', fontSize: 15 }}>{fmt(p.salePrice)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  );
}