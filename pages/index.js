import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const USERS = {
  admin: { pass: 'admin123', label: 'Administrador' },
  equipo: { pass: 'equipo123', label: 'Equipo' },
  nverdejo: { pass: 'Joven+', label: 'Nicolás Verdejo' },
  jparra: { pass: 'Joven+', label: 'Javiera Parra' }
}

const AVATAR_COLORS = ['#00B5AD', '#6B8500', '#D63D8F']

function initials(name) {
  const parts = (name || '').trim().split(' ')
  return ((parts[0] || '')[0] || '').toUpperCase() + ((parts[1] || '')[0] || '').toUpperCase()
}

function Badge({ estado }) {
  const map = {
    habilitada: { bg: '#E0F7F6', color: '#007A75', label: 'Habilitada' },
    inhabilitada: { bg: '#F2F9D6', color: '#6B8500', label: 'Inhabilitada' },
    bloqueada: { bg: '#FCE8F3', color: '#A0005A', label: 'Bloqueada' },
  }
  const s = map[estado] || map.inhabilitada
  return (
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, whiteSpace: 'nowrap' }}>
      {s.label.toUpperCase()}
    </span>
  )
}

export default function Home() {
  const [user, setUser] = useState(null)
  const [loginUser, setLoginUser] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [loginErr, setLoginErr] = useState(false)
  const [tab, setTab] = useState('beneficiarios')
  const [cards, setCards] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [formMsg, setFormMsg] = useState(null)
  const [form, setForm] = useState({ id: '', nombre: '', rut: '', direccion: '', sector: '', contacto: '' })
  const [selectedIds, setSelectedIds] = useState([])

  const [comercios, setComercios] = useState([])
  const [searchComercio, setSearchComercio] = useState('')
  const [selectedComercios, setSelectedComercios] = useState([])
  const [editComercio, setEditComercio] = useState(null)
  const [formComercio, setFormComercio] = useState({ nombre: '', categoria: '', descuento: '', direccion: '', sector: '', maps_url: '' })
  const [formMsgComercio, setFormMsgComercio] = useState(null)
  const [loadingComercios, setLoadingComercios] = useState(false)

  useEffect(() => { if (user) { fetchCards(); fetchComercios() } }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
    setSelectedIds([])
    setLoading(false)
  }

  async function fetchComercios() {
    setLoadingComercios(true)
    const { data } = await supabase.from('comercios').select('*').order('nombre', { ascending: true })
    setComercios(data || [])
    setSelectedComercios([])
    setLoadingComercios(false)
  }

  function doLogin() {
    const u = loginUser.toLowerCase()
    if (USERS[u] && USERS[u].pass === loginPass) {
      setUser({ name: u, label: USERS[u].label })
      setLoginErr(false)
    } else {
      setLoginErr(true)
    }
  }

  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) setSelectedIds([])
    else setSelectedIds(filtered.map(c => c.id))
  }

  const toggleSelectComercio = (id) => setSelectedComercios(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  const toggleSelectAllComercios = () => {
    if (selectedComercios.length === filteredComercios.length && filteredComercios.length > 0) setSelectedComercios([])
    else setSelectedComercios(filteredComercios.map(c => c.id))
  }

  async function updateBulkStatus(nuevoEstado) {
    const confirmar = confirm(`¿Cambiar estado a "${nuevoEstado}" para ${selectedIds.length} tarjetas?`)
    if (!confirmar) return
    const { error } = await supabase.from('tarjetas').update({ estado: nuevoEstado }).in('id', selectedIds)
    if (error) alert("Error: " + error.message)
    else fetchCards()
  }

  async function registrar() {
    if (!form.id || !form.nombre || !form.rut) {
      setFormMsg({ ok: false, text: 'ID, nombre y RUT son obligatorios.' })
      return
    }
    const { error } = await supabase.from('tarjetas').insert({ ...form, estado: 'habilitada' })
    if (error) setFormMsg({ ok: false, text: 'Error al registrar. Verifique si el ID ya existe.' })
    else {
      setFormMsg({ ok: true, text: 'Beneficiario registrado correctamente.' })
      setForm({ id: '', nombre: '', rut: '', direccion: '', sector: '', contacto: '' })
      fetchCards()
      setTimeout(() => setFormMsg(null), 2500)
    }
  }

  async function guardarEdicion() {
    const { error } = await supabase.from('tarjetas').update({
      nombre: editCard.nombre, rut: editCard.rut, direccion: editCard.direccion,
      sector: editCard.sector, contacto: editCard.contacto, estado: editCard.estado,
      observaciones: editCard.observaciones
    }).eq('id', editCard.id)
    if (!error) { setEditCard(null); fetchCards() }
  }

  async function eliminarTarjeta() {
    if (confirm(`¿Eliminar permanentemente a ${editCard.nombre}?`)) {
      const { error } = await supabase.from('tarjetas').delete().eq('id', editCard.id)
      if (!error) { setEditCard(null); fetchCards() }
    }
  }

  async function registrarComercio() {
    if (!formComercio.nombre || !formComercio.descuento) {
      setFormMsgComercio({ ok: false, text: 'Nombre y descuento son obligatorios.' })
      return
    }
    const { error } = await supabase.from('comercios').insert({ ...formComercio, estado: 'activo' })
    if (error) setFormMsgComercio({ ok: false, text: 'Error al registrar comercio.' })
    else {
      setFormMsgComercio({ ok: true, text: 'Comercio registrado correctamente.' })
      setFormComercio({ nombre: '', categoria: '', descuento: '', direccion: '', sector: '', maps_url: '' })
      fetchComercios()
      setTimeout(() => setFormMsgComercio(null), 2500)
    }
  }

  async function guardarEdicionComercio() {
    const { error } = await supabase.from('comercios').update({
      nombre: editComercio.nombre, categoria: editComercio.categoria,
      descuento: editComercio.descuento, estado: editComercio.estado,
      direccion: editComercio.direccion, sector: editComercio.sector,
      maps_url: editComercio.maps_url
    }).eq('id', editComercio.id)
    if (!error) { setEditComercio(null); fetchComercios() }
  }

  async function eliminarComercio() {
    if (confirm(`¿Eliminar permanentemente a ${editComercio.nombre}?`)) {
      const { error } = await supabase.from('comercios').delete().eq('id', editComercio.id)
      if (!error) { setEditComercio(null); fetchComercios() }
    }
  }

  async function eliminarComercioBulk() {
    const confirmar = confirm(`¿Eliminar ${selectedComercios.length} comercios seleccionados?`)
    if (!confirmar) return
    const { error } = await supabase.from('comercios').delete().in('id', selectedComercios)
    if (!error) fetchComercios()
  }

  const filtered = cards.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.rut.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    (c.sector || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredComercios = comercios.filter(c =>
    c.nombre.toLowerCase().includes(searchComercio.toLowerCase()) ||
    (c.categoria || '').toLowerCase().includes(searchComercio.toLowerCase()) ||
    (c.sector || '').toLowerCase().includes(searchComercio.toLowerCase())
  )

  const stats = {
    total: cards.length,
    hab: cards.filter(c => c.estado === 'habilitada').length,
    inh: cards.filter(c => c.estado === 'inhabilitada').length,
    bloq: cards.filter(c => c.estado === 'bloqueada').length,
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(-45deg, #00B5AD, #6B8500, #008a84, #4e6100)', backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <style>{`
        @keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
        * { box-sizing: border-box; }
        input, select, textarea { display: block; width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: #00B5AD; }
        .btn-teal { background: #00B5AD; color: white; border: none; border-radius: 12px; cursor: pointer; font-family: inherit; }
        .btn-magenta { background: #D63D8F; color: white; border: none; border-radius: 10px; cursor: pointer; font-family: inherit; }
        .btn-sm { border: none; border-radius: 8px; cursor: pointer; padding: 6px 12px; font-size: 11px; font-weight: 700; color: white; font-family: inherit; }
        @media (max-width: 600px) {
          .tabs-bar button { font-size: 9px !important; padding: 12px 4px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .card-row .card-actions { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .card-row { flex-wrap: wrap; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .bulk-bar { flex-wrap: wrap; gap: 8px !important; padding: 10px !important; }
          .bulk-bar span { width: 100%; }
          .comercio-row { flex-wrap: wrap; }
          .comercio-row .desc-badge { order: -1; margin-left: auto; }
          .header-bar span { display: none; }
        }
      `}</style>
      <div style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', padding: '3rem 2rem', borderRadius: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ width: 70, height: 70, background: '#00B5AD', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', boxShadow: '0 8px 15px rgba(0,181,173,0.3)', transform: 'rotate(-5deg)' }}>
            <svg width="35" height="35" viewBox="0 0 24 24" fill="none">
              <path d="M3 4 L12 20 L21 4" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
            </svg>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#333', letterSpacing: '-1px' }}>Joven+ Florida</div>
          <div style={{ width: '40px', height: '4px', background: '#6B8500', margin: '10px auto', borderRadius: '2px' }}></div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: '#999', marginLeft: 5, display: 'block', marginBottom: 5 }}>USUARIO</label>
          <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ingresa tu usuario" style={{ marginBottom: 18 }} />
          <label style={{ fontSize: 11, fontWeight: 800, color: '#999', marginLeft: 5, display: 'block', marginBottom: 5 }}>CONTRASEÑA</label>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" style={{ marginBottom: 20 }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        {loginErr && <div style={{ fontSize: 12, color: '#A0005A', marginBottom: 20, textAlign: 'center', fontWeight: 700, background: '#FCE8F3', padding: '8px', borderRadius: '8px' }}>Credenciales incorrectas</div>}
        <button className="btn-teal" style={{ width: '100%', padding: '16px', fontSize: 15, fontWeight: 800 }} onClick={doLogin}>ACCEDER AL PANEL</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <style>{`
        * { box-sizing: border-box; }
        input, select, textarea { display: block; width: 100%; padding: 12px; border: 1px solid #eee; border-radius: 10px; font-size: 14px; font-family: inherit; outline: none; }
        input:focus, select:focus, textarea:focus { border-color: #00B5AD; }
        .btn-teal { background: #00B5AD; color: white; border: none; border-radius: 12px; cursor: pointer; font-family: inherit; }
        .btn-magenta { background: #D63D8F; color: white; border: none; border-radius: 10px; cursor: pointer; font-family: inherit; }
        .btn-sm { border: none; border-radius: 8px; cursor: pointer; padding: 6px 12px; font-size: 11px; font-weight: 700; color: white; font-family: inherit; }
        @media (max-width: 600px) {
          .tabs-bar button { font-size: 9px !important; padding: 12px 4px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .card-row .card-actions { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
          .card-row { flex-wrap: wrap; }
          .form-grid-2 { grid-template-columns: 1fr !important; }
          .bulk-bar { flex-wrap: wrap; gap: 8px !important; padding: 10px !important; }
          .bulk-bar span { width: 100%; }
          .comercio-row { flex-wrap: wrap; }
          .comercio-row .desc-badge { order: -1; margin-left: auto; }
          .header-bar span { display: none; }
        }
      `}</style>

      <div className="header-bar" style={{ background: '#00B5AD', padding: '12px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Joven+ Florida</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{user.label}</span>
          <button className="btn-sm" onClick={() => setUser(null)} style={{ background: 'rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>Cerrar Sesión</button>
        </div>
      </div>

      <div className="tabs-bar" style={{ display: 'flex', background: 'white', borderBottom: '1px solid #eee' }}>
        {['beneficiarios', 'registro', 'comercios', 'nuevo_local'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '14px 4px', fontSize: 11, fontWeight: 800, border: 'none', background: 'none', color: tab === t ? '#00B5AD' : '#bbb', borderBottom: tab === t ? '4px solid #00B5AD' : '4px solid transparent', transition: '0.3s', cursor: 'pointer' }}>
            {['BENEFICIARIOS', 'NUEVO REG.', 'COMERCIOS', 'NUEVO LOCAL'][i]}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1rem' }}>

        {/* ── BENEFICIARIOS ── */}
        {tab === 'beneficiarios' && (
          <>
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[{ label: 'TOTAL', val: stats.total, color: '#444', bg: 'white' }, { label: 'HABILIT.', val: stats.hab, color: '#007A75', bg: '#E0F7F6' }, { label: 'INHABILIT.', val: stats.inh, color: '#6B8500', bg: '#F2F9D6' }, { label: 'BLOQ.', val: stats.bloq, color: '#A0005A', bg: '#FCE8F3' }].map(s => (
                <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(0,0,0,0.03)', borderRadius: 12, padding: '12px 5px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT, ID o sector..." style={{ paddingLeft: 40 }} />
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            </div>
            {selectedIds.length > 0 && (
              <div className="bulk-bar" style={{ background: '#222', color: 'white', padding: '12px 16px', borderRadius: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{selectedIds.length} seleccionados</span>
                <button className="btn-sm" onClick={() => updateBulkStatus('habilitada')} style={{ background: '#00B5AD' }}>Habilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('inhabilitada')} style={{ background: '#6B8500' }}>Inhabilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('bloqueada')} style={{ background: '#D63D8F' }}>Bloquear</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }}>×</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 12px', gap: 12 }}>
              <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ width: 20, height: 20, display: 'inline', padding: 0 }} />
              <span style={{ fontSize: 11, color: '#999', fontWeight: 800 }}>SELECCIONAR TODOS</span>
            </div>
            {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa', fontWeight: 600 }}>Cargando datos...</div> :
              filtered.map((c, idx) => (
                <div key={c.id} className="card-row" style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12, opacity: c.estado === 'inhabilitada' ? 0.6 : 1 }}>
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 20, height: 20, flexShrink: 0, display: 'inline', padding: 0 }} />
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{initials(c.nombre)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>ID: <b>{c.id}</b> • {c.sector || 'Sin sector'}</div>
                  </div>
                  <div className="card-actions" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <Badge estado={c.estado} />
                    <button className="btn-magenta" onClick={() => setEditCard({ ...c })} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap' }}>VER / EDITAR</button>
                  </div>
                </div>
              ))
            }
          </>
        )}

        {/* ── NUEVO REGISTRO ── */}
        {tab === 'registro' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 800 }}>Nuevo Beneficiario</h3>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>ID TARJETA</label><input value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })} placeholder="JM-000" /></div>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>RUT</label><input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" /></div>
            </div>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>NOMBRE COMPLETO</label><input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y Apellidos" /></div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>DIRECCIÓN</label><input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle / Pasaje" /></div>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>SECTOR / VILLA</label><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="Ej: Villa El Prado" /></div>
            </div>
            <div style={{ marginBottom: 20 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>CONTACTO</label><input value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} placeholder="+569 / email" /></div>
            <button className="btn-teal" style={{ width: '100%', padding: '16px', fontWeight: 700 }} onClick={registrar}>REGISTRAR BENEFICIARIO</button>
            {formMsg && <div style={{ fontSize: 13, marginTop: 16, textAlign: 'center', fontWeight: 700, color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}

        {/* ── COMERCIOS ── */}
        {tab === 'comercios' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: '1.5rem' }}>
              {[{ label: 'TOTAL LOCALES', val: comercios.length, color: '#444', bg: 'white' }, { label: 'ACTIVOS', val: comercios.filter(c => c.estado === 'activo').length, color: '#007A75', bg: '#E0F7F6' }].map(s => (
                <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(0,0,0,0.03)', borderRadius: 12, padding: '12px 5px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <input value={searchComercio} onChange={e => setSearchComercio(e.target.value)} placeholder="Buscar por nombre, categoría o sector..." style={{ paddingLeft: 40 }} />
              <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 16 }}>🔍</span>
            </div>
            {selectedComercios.length > 0 && (
              <div className="bulk-bar" style={{ background: '#222', color: 'white', padding: '12px 16px', borderRadius: 14, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{selectedComercios.length} seleccionados</span>
                <button className="btn-sm" onClick={eliminarComercioBulk} style={{ background: '#D63D8F' }}>Eliminar</button>
                <button onClick={() => setSelectedComercios([])} style={{ background: 'none', border: 'none', color: 'white', fontSize: 22, cursor: 'pointer' }}>×</button>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 12px', gap: 12 }}>
              <input type="checkbox" checked={selectedComercios.length === filteredComercios.length && filteredComercios.length > 0} onChange={toggleSelectAllComercios} style={{ width: 20, height: 20, display: 'inline', padding: 0 }} />
              <span style={{ fontSize: 11, color: '#999', fontWeight: 800 }}>SELECCIONAR TODOS</span>
            </div>
            {loadingComercios ? <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa', fontWeight: 600 }}>Cargando comercios...</div> :
              filteredComercios.map((c, idx) => (
                <div key={c.id} className="comercio-row" style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '14px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <input type="checkbox" checked={selectedComercios.includes(c.id)} onChange={() => toggleSelectComercio(c.id)} style={{ width: 20, height: 20, flexShrink: 0, display: 'inline', padding: 0 }} />
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: AVATAR_COLORS[idx % AVATAR_COLORS.length], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0 }}>{initials(c.nombre)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.categoria || 'Sin categoría'} • {c.sector || 'Sin sector'}</div>
                  </div>
                  <div className="desc-badge" style={{ background: '#FCE8F3', borderRadius: 10, padding: '6px 10px', textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#D63D8F', lineHeight: 1 }}>{c.descuento}%</div>
                    <div style={{ fontSize: 8, fontWeight: 800, color: '#D63D8F' }}>DESC.</div>
                  </div>
                  <button className="btn-magenta" onClick={() => setEditComercio({ ...c })} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>VER / EDITAR</button>
                </div>
              ))
            }
          </>
        )}

        {/* ── NUEVO LOCAL ── */}
        {tab === 'nuevo_local' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '1.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 800 }}>Nuevo Local Colaborador</h3>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>NOMBRE DEL LOCAL</label><input value={formComercio.nombre} onChange={e => setFormComercio({ ...formComercio, nombre: e.target.value })} placeholder="Ej: Gimnasio FitZone" /></div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>CATEGORÍA</label><input value={formComercio.categoria} onChange={e => setFormComercio({ ...formComercio, categoria: e.target.value })} placeholder="Ej: Gym, Panadería..." /></div>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>% DESCUENTO</label><input type="number" value={formComercio.descuento} onChange={e => setFormComercio({ ...formComercio, descuento: e.target.value })} placeholder="Ej: 15" /></div>
            </div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>DIRECCIÓN</label><input value={formComercio.direccion} onChange={e => setFormComercio({ ...formComercio, direccion: e.target.value })} placeholder="Ej: Calle Los Pinos 123" /></div>
              <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>SECTOR / VILLA</label><input value={formComercio.sector} onChange={e => setFormComercio({ ...formComercio, sector: e.target.value })} placeholder="Ej: Centro, Villa El Prado" /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 11, fontWeight: 800, color: '#666', display: 'block', marginBottom: 5 }}>📍 LINK MAPS / WAZE</label>
              <input value={formComercio.maps_url} onChange={e => setFormComercio({ ...formComercio, maps_url: e.target.value })} placeholder="Pega aquí el link de Google Maps o Waze" />
              <div style={{ fontSize: 11, color: '#aaa', marginTop: 5 }}>En Google Maps: compartir → copiar enlace. En Waze: compartir ubicación.</div>
            </div>
            <button className="btn-teal" style={{ width: '100%', padding: '16px', fontWeight: 700 }} onClick={registrarComercio}>REGISTRAR LOCAL</button>
            {formMsgComercio && <div style={{ fontSize: 13, marginTop: 16, textAlign: 'center', fontWeight: 700, color: formMsgComercio.ok ? '#007A75' : '#A0005A' }}>{formMsgComercio.text}</div>}
          </div>
        )}
      </div>

      {/* ── MODAL EDITAR BENEFICIARIO ── */}
      {editCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 15 }}>Ficha del Beneficiario</div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>RUT</label><input value={editCard.rut} onChange={e => setEditCard({ ...editCard, rut: e.target.value })} /></div>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>ESTADO</label>
                <select value={editCard.estado} onChange={e => setEditCard({ ...editCard, estado: e.target.value })}>
                  <option value="habilitada">HABILITADA</option>
                  <option value="inhabilitada">INHABILITADA</option>
                  <option value="bloqueada">BLOQUEADA</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>NOMBRE</label><input value={editCard.nombre} onChange={e => setEditCard({ ...editCard, nombre: e.target.value })} /></div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>DIRECCIÓN</label><input value={editCard.direccion || ''} onChange={e => setEditCard({ ...editCard, direccion: e.target.value })} /></div>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>SECTOR</label><input value={editCard.sector || ''} onChange={e => setEditCard({ ...editCard, sector: e.target.value })} /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>OBSERVACIONES</label>
              <textarea value={editCard.observaciones || ''} onChange={e => setEditCard({ ...editCard, observaciones: e.target.value })} style={{ height: 80 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-teal" onClick={guardarEdicion} style={{ padding: '14px', fontWeight: 700 }}>GUARDAR CAMBIOS</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={eliminarTarjeta} style={{ flex: 1, background: '#fff', color: '#A0005A', border: '1px solid #A0005A', fontWeight: 700, borderRadius: 10, padding: '12px', cursor: 'pointer' }}>ELIMINAR</button>
                <button onClick={() => setEditCard(null)} style={{ flex: 1, background: '#f0f0f0', border: 'none', fontWeight: 700, borderRadius: 10, padding: '12px', cursor: 'pointer' }}>CERRAR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL EDITAR COMERCIO ── */}
      {editComercio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '1.5rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 20, borderBottom: '2px solid #f0f0f0', paddingBottom: 15 }}>Ficha del Comercio</div>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>NOMBRE</label><input value={editComercio.nombre} onChange={e => setEditComercio({ ...editComercio, nombre: e.target.value })} /></div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>CATEGORÍA</label><input value={editComercio.categoria || ''} onChange={e => setEditComercio({ ...editComercio, categoria: e.target.value })} /></div>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>% DESCUENTO</label><input type="number" value={editComercio.descuento || ''} onChange={e => setEditComercio({ ...editComercio, descuento: e.target.value })} /></div>
            </div>
            <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>DIRECCIÓN</label><input value={editComercio.direccion || ''} onChange={e => setEditComercio({ ...editComercio, direccion: e.target.value })} /></div>
              <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>SECTOR</label><input value={editComercio.sector || ''} onChange={e => setEditComercio({ ...editComercio, sector: e.target.value })} /></div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 10, fontWeight: 800, color: '#999', display: 'block', marginBottom: 5 }}>📍 LINK MAPS / WAZE</label>
              <input value={editComercio.maps_url || ''} onChange={e => setEditComercio({ ...editComercio, maps_url: e.target.value })} placeholder="Pega aquí el link de Google Maps o Waze" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-teal" onClick={guardarEdicionComercio} style={{ padding: '14px', fontWeight: 700 }}>GUARDAR CAMBIOS</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={eliminarComercio} style={{ flex: 1, background: '#fff', color: '#A0005A', border: '1px solid #A0005A', fontWeight: 700, borderRadius: 10, padding: '12px', cursor: 'pointer' }}>ELIMINAR</button>
                <button onClick={() => setEditComercio(null)} style={{ flex: 1, background: '#f0f0f0', border: 'none', fontWeight: 700, borderRadius: 10, padding: '12px', cursor: 'pointer' }}>CERRAR</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
