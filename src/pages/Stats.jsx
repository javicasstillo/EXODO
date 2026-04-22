import { useState, useEffect } from 'react';
import { salesApi, phonesApi, expensesApi } from '../api';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);

function Bar({ label, value, max, sub }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 12 }}>
        <span style={{ color: 'var(--text2)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontFamily: 'Bebas Neue', fontSize: 14 }}>{sub}</span>
      </div>
      <div style={{ height: 8, background: 'var(--bg3)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--text)', borderRadius: 20, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

export default function Stats() {
  const [sales, setSales] = useState([]);
  const [phones, setPhones] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const u1 = salesApi.subscribe(setSales);
    const u2 = phonesApi.subscribe(setPhones);
    const u3 = expensesApi.subscribe(setExpenses);
    return () => { u1(); u2(); u3(); };
  }, []);

  const completed = sales.filter(s => s.status === 'completada');
  const totalIngresos = completed.reduce((a, s) => a + Number(s.salePrice || 0), 0);
  const totalCostos = completed.reduce((a, s) => a + Number(s.costPrice || 0), 0);
  const totalGastos = expenses.reduce((a, e) => a + Number(e.amount || 0), 0);
  const gananciaBruta = totalIngresos - totalCostos;
  const gananciaNeta = gananciaBruta - totalGastos;
  const margenProm = totalIngresos > 0 ? ((gananciaBruta / totalIngresos) * 100).toFixed(1) : 0;

  const byModel = {};
  completed.forEach(s => {
    const phone = phones.find(p => p.id === s.phoneId);
    const model = phone?.model || 'Desconocido';
    if (!byModel[model]) byModel[model] = { count: 0, revenue: 0, profit: 0 };
    byModel[model].count++;
    byModel[model].revenue += Number(s.salePrice || 0);
    byModel[model].profit += Number(s.salePrice || 0) - Number(s.costPrice || 0);
  });
  const modelRanking = Object.entries(byModel).sort((a, b) => b[1].count - a[1].count).slice(0, 6);
  const maxCount = modelRanking[0]?.[1]?.count || 1;

  const byPayment = {};
  completed.forEach(s => {
    const m = s.paymentMethod || 'Otro';
    if (!byPayment[m]) byPayment[m] = 0;
    byPayment[m]++;
  });
  const paymentList = Object.entries(byPayment).sort((a, b) => b[1] - a[1]);

  const byMonth = {};
  completed.forEach(s => {
    if (!s.saleDate) return;
    const key = s.saleDate.slice(0, 7);
    if (!byMonth[key]) byMonth[key] = { count: 0, revenue: 0, profit: 0 };
    byMonth[key].count++;
    byMonth[key].revenue += Number(s.salePrice || 0);
    byMonth[key].profit += Number(s.salePrice || 0) - Number(s.costPrice || 0);
  });
  const monthList = Object.entries(byMonth).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  const maxRevMonth = Math.max(...monthList.map(([, v]) => v.revenue), 1);

  const ticketProm = completed.length > 0 ? totalIngresos / completed.length : 0;

  return (
    <>
      <div className="page-header">
        <div><h2>Estadísticas</h2><p>Análisis del negocio</p></div>
      </div>
      <div className="page-body fade-up">

        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
          <div className="stat-card">
            <div className="stat-label">Ingresos totales</div>
            <div className="stat-value" style={{ fontSize: 19 }}>{fmt(totalIngresos)}</div>
            <div className="stat-sub">{completed.length} ventas</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ganancia bruta</div>
            <div className="stat-value" style={{ fontSize: 19 }}>{fmt(gananciaBruta)}</div>
            <div className="stat-sub">Margen: {margenProm}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ganancia neta</div>
            <div className="stat-value" style={{ fontSize: 19 }}>{fmt(gananciaNeta)}</div>
            <div className="stat-sub">Gastos descontados</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Ticket promedio</div>
            <div className="stat-value" style={{ fontSize: 19 }}>{fmt(ticketProm)}</div>
            <div className="stat-sub">Por venta</div>
          </div>
        </div>

        <div className="stats-cols" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 4 }}>
          <div className="card">
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, marginBottom: 16 }}>Modelos más vendidos</h3>
            {modelRanking.length === 0
              ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin datos todavía</p>
              : modelRanking.map(([model, data]) => (
                <Bar key={model} label={model} value={data.count} max={maxCount} sub={`${data.count} un. · ${fmt(data.profit)} ganancia`} />
              ))
            }
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, marginBottom: 16 }}>Ingresos por mes</h3>
            {monthList.length === 0
              ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin datos todavía</p>
              : monthList.map(([month, data]) => (
                <Bar key={month} label={month} value={data.revenue} max={maxRevMonth} sub={`${fmt(data.revenue)} · ${data.count} ventas`} />
              ))
            }
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, marginBottom: 16 }}>Formas de pago</h3>
            {paymentList.length === 0
              ? <p style={{ color: 'var(--text3)', fontSize: 13 }}>Sin datos todavía</p>
              : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {paymentList.map(([method, count]) => (
                    <div key={method} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', background: 'var(--bg3)', borderRadius: 8 }}>
                      <span style={{ fontSize: 13 }}>{method}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--text3)' }}>{((count / completed.length) * 100).toFixed(0)}%</span>
                        <span style={{ fontFamily: 'Bebas Neue', fontSize: 16 }}>{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Bebas Neue', fontSize: 18, letterSpacing: 1, marginBottom: 16 }}>Resumen financiero</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Total ingresos (ventas)', value: fmt(totalIngresos) },
                { label: 'Total costos (equipos)', value: `− ${fmt(totalCostos)}` },
                { label: 'Ganancia bruta', value: fmt(gananciaBruta), bold: true },
                { label: 'Total gastos operativos', value: `− ${fmt(totalGastos)}` },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text2)' }}>{row.label}</span>
                  <span style={{ fontFamily: 'Bebas Neue', fontSize: 15, fontWeight: row.bold ? 700 : 400 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0 0', fontSize: 14 }}>
                <span style={{ fontWeight: 700 }}>GANANCIA NETA</span>
                <span style={{ fontFamily: 'Bebas Neue', fontSize: 20 }}>{fmt(gananciaNeta)}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}