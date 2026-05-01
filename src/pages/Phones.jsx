import { useState, useEffect, useRef } from 'react';
import { phonesApi } from '../api';
import { Plus, Search, Smartphone, Edit2, Trash2, X, Camera, ImageOff } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n || 0);

const MODELS = [
  'iPhone 6', 'iPhone 6S', 'iPhone 7', 'iPhone 7 Plus',
  'iPhone 8', 'iPhone 8 Plus', 'iPhone X', 'iPhone XR', 'iPhone XS', 'iPhone XS Max',
  'iPhone 11', 'iPhone 11 Pro', 'iPhone 11 Pro Max',
  'iPhone 12', 'iPhone 12 Mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max',
  'iPhone 13', 'iPhone 13 Mini', 'iPhone 13 Pro', 'iPhone 13 Pro Max',
  'iPhone 14', 'iPhone 14 Plus', 'iPhone 14 Pro', 'iPhone 14 Pro Max',
  'iPhone 15', 'iPhone 15 Plus', 'iPhone 15 Pro', 'iPhone 15 Pro Max',
  'iPhone 16', 'iPhone 16 Plus', 'iPhone 16 Pro', 'iPhone 16 Pro Max',
  'Otro',
];
const STORAGE = ['16GB','32GB','64GB','128GB','256GB','512GB','1TB'];
const CONDITIONS = ['Nuevo', 'Como nuevo', 'Excelente', 'Muy bueno', 'Bueno', 'Regular'];
const COLORS = ['Negro', 'Blanco', 'Rojo', 'Azul', 'Celeste', 'Verde', 'Amarillo', 'Rosa', 'Morado', 'Natural', 'Titanio', 'Otro'];

const EMPTY = {
  model: 'iPhone 13', storage: '128GB', color: 'Negro', condition: 'Excelente',
  imei: '', costPrice: '', salePrice: '', currency: 'ARS',
  batteryHealth: '', notes: '', status: 'disponible', photo: null,
};

function PhotoUploader({ value, onChange }) {
  const ref = useRef();
  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Máximo 3MB'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label className="form-label">Foto del equipo</label>
      <div onClick={() => ref.current.click()}
        style={{ height: 160, borderRadius: 10, border: '2px dashed var(--border2)', background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border2)'}>
        {value
          ? <img src={value} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
          : <div style={{ textAlign: 'center', color: 'var(--text3)' }}>
              <Camera size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
              <div style={{ fontSize: 13 }}>Clic para subir foto</div>
              <div style={{ fontSize: 11 }}>JPG, PNG · máx 3MB</div>
            </div>
        }
      </div>
      {value && (
        <button type="button" className="btn btn-sm btn-danger" style={{ alignSelf: 'flex-start' }} onClick={() => onChange(null)}>
          <ImageOff size={12} /> Quitar foto
        </button>
      )}
      <input ref={ref} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
    </div>
  );
}

function Modal({ phone, onClose, onSave, saving }) {
  const [form, setForm] = useState(phone || EMPTY);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const margen = form.salePrice && form.costPrice
    ? (((Number(form.salePrice) - Number(form.costPrice)) / Number(form.costPrice)) * 100).toFixed(1)
    : null;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3>{phone ? 'Editar Equipo' : 'Nuevo Equipo'}</h3>
          <button className="btn btn-sm btn-secondary" onClick={onClose}><X size={14} /></button>
        </div>
        <div className="modal-body">
          <PhotoUploader value={form.photo} onChange={v => set('photo', v)} />

          <div className="form-grid form-grid-2" style={{ marginTop: 14 }}>
            <div className="form-group">
              <label className="form-label">Modelo</label>
              <select className="form-input" value={form.model} onChange={e => set('model', e.target.value)}>
                {MODELS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado del equipo</label>
              <select className="form-input" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="disponible">Disponible</option>
                <option value="vendido">Vendido</option>
                <option value="reservado">Reservado</option>
                <option value="reparacion">En reparación</option>
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Almacenamiento</label>
              <select className="form-input" value={form.storage} onChange={e => set('storage', e.target.value)}>
                {STORAGE.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Color</label>
              <select className="form-input" value={form.color} onChange={e => set('color', e.target.value)}>
                {COLORS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condición</label>
              <select className="form-input" value={form.condition} onChange={e => set('condition', e.target.value)}>
                {CONDITIONS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid form-grid-2">
            <div className="form-group">
              <label className="form-label">IMEI</label>
              <input className="form-input" placeholder="352xxx..." value={form.imei} onChange={e => set('imei', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Batería (%)</label>
              <input className="form-input" type="number" min="0" max="100" placeholder="89" value={form.batteryHealth} onChange={e => set('batteryHealth', e.target.value)} />
            </div>
          </div>

          <div style={{ background: 'var(--bg3)', borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>Precios</div>
            <div className="form-grid form-grid-3">
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Costo (lo que pagaste)</label>
                <input className="form-input" type="number" placeholder="0" value={form.costPrice} onChange={e => set('costPrice', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Precio de venta</label>
                <input className="form-input" type="number" placeholder="0" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Moneda</label>
                <select className="form-input" value={form.currency} onChange={e => set('currency', e.target.value)}>
                  <option value="ARS">ARS – Pesos</option>
                  <option value="USD">USD – Dólares</option>
                </select>
              </div>
            </div>
            {margen !== null && (
              <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text2)' }}>
                Ganancia estimada: <strong>{fmt(Number(form.salePrice) - Number(form.costPrice))}</strong> · Margen: <strong>{margen}%</strong>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Notas / Accesorios incluidos</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Caja original, cargador, auriculares..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" disabled={saving} onClick={() => { if (form.model) onSave(form); }}>
            {saving ? 'Guardando...' : phone ? 'Guardar cambios' : 'Agregar equipo'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Phones() {
  const [phones, setPhones] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos');
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => phonesApi.subscribe(setPhones), []);

  const filtered = phones.filter(p => {
    const q = search.toLowerCase();
    const matchQ = p.model?.toLowerCase().includes(q) || p.imei?.includes(q) || p.color?.toLowerCase().includes(q) || p.storage?.includes(q);
    const matchF = filter === 'todos' || p.status === filter;
    return matchQ && matchF;
  });

  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (modal === 'new') await phonesApi.add(form);
      else await phonesApi.update(modal.id, form);
      setModal(null);
    } catch (e) { alert(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este equipo?')) return;
    try { await phonesApi.remove(id); } catch (e) { alert(e.message); }
  };

  const badgeStatus = (s) => s === 'disponible' ? 'badge-black' : 'badge-gray';
  const labelStatus = { disponible: 'Disponible', vendido: 'Vendido', reservado: 'Reservado', reparacion: 'Reparación' };

  return (
    <>
      <div className="page-header">
        <div><h2>Stock de Equipos</h2><p>{phones.filter(p => p.status === 'disponible').length} disponibles · {phones.length} en total</p></div>
        <button className="btn btn-primary" onClick={() => setModal('new')}><Plus size={15} /> Agregar equipo</button>
      </div>
      <div className="page-body fade-up">
        <div className="toolbar">
          <div className="search-box">
            <Search className="search-icon" />
            <input className="form-input" placeholder="Buscar por modelo, IMEI, color..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['todos', 'disponible', 'vendido', 'reservado', 'reparacion'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFilter(f)}>
              {f === 'todos' ? 'Todos' : labelStatus[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0
          ? <div className="empty-state"><Smartphone size={48} /><h4>No hay equipos</h4><p>Agregá tu primer iPhone</p></div>
          : (
            <div className="phone-grid">
              {filtered.map(p => (
                <div key={p.id} className="phone-card">
                 <div className="phone-card-img" style={{ position: 'relative', overflow: 'hidden' }}>
                    {p.photo
                      ? <img src={p.photo} alt={p.model} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Smartphone size={44} color="var(--text3)" />
                    }
                    <div style={{ position: 'absolute', top: 8, right: 8 }}>
                      <span className={`badge ${badgeStatus(p.status)}`}>{labelStatus[p.status] || p.status}</span>
                    </div>
                    {p.batteryHealth && (
                      <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: 10, padding: '2px 7px', borderRadius: 20 }}>
                        🔋 {p.batteryHealth}%
                      </div>
                    )}
                  </div>
                  <div className="phone-card-body">
                    <div className="phone-card-model">{p.model}</div>
                    <div className="phone-card-sub">{p.condition} · {p.storage}</div>
                    <div className="chip-row">
                      {p.color && <span className="chip">{p.color}</span>}
                      {p.imei && <span className="chip">IMEI: {p.imei.slice(-4)}</span>}
                    </div>
                    {p.costPrice && p.salePrice && (
                      <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 8 }}>
                        Costo: {fmt(p.costPrice)} · Ganancia: {fmt(Number(p.salePrice) - Number(p.costPrice))}
                      </div>
                    )}
                    <div className="phone-card-footer">
                      <div className="phone-price">{fmt(p.salePrice)}<span style={{ fontSize: 10, fontFamily: 'DM Sans', color: 'var(--text3)' }}> {p.currency}</span></div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setModal(p)}><Edit2 size={12} /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}><Trash2 size={12} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
      </div>
      {modal && <Modal phone={modal === 'new' ? null : modal} onClose={() => setModal(null)} onSave={handleSave} saving={saving} />}
    </>
  );
}
