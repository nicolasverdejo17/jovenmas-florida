import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Usuarios actualizados
const USERS = {
  admin: { pass: 'admin123', label: 'Administrador' },
  equipo: { pass: 'equipo123', label: 'Equipo' },
  nverdejo: { pass: 'Joven+', label: 'Nicolás Verdejo' },
  jparra: { pass: 'Joven+', label: 'Javiera Parra' }
}

const AVATAR_COLORS = ['#00B5AD', '#6B8500', '#D63D8F'] 

function initials(name) {
  const parts = name.trim().split(' ')
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
  const [tab, setTab] = useState('resumen')
  const [cards, setCards] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [formMsg, setFormMsg] = useState(null)
  const [form, setForm] = useState({ id: '', nombre: '', rut: '', direccion: '', sector: '', contacto: '' })
  const [selectedIds, setSelectedIds] = useState([])

  // --- NUEVOS ESTADOS PARA COMERCIOS (AGREGADOS SIN TOCAR LO ANTERIOR) ---
  const [comercios, setComercios] = useState([])
  const [editComercio, setEditComercio] = useState(null)
  const [formComercio, setFormComercio] = useState({ nombre: '', categoria: 'Gym', descuento: '' })

  useEffect(() => { 
    if (user) {
      fetchCards()
      fetchComercios() // Nueva llamada
    } 
  }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
    setSelectedIds([])
    setLoading(false)
  }

  // --- NUEVAS FUNCIONES DE COMERCIOS ---
  async function fetchComercios() {
    const { data } = await supabase.from('comercios').select('*').order('nombre', { ascending: true })
    setComercios(data || [])
  }

  async function registrarComercio() {
    if (!formComercio.nombre || !formComercio.descuento) {
      setFormMsg({ ok: false, text: 'Nombre y % son obligatorios.' })
      return
    }
    const { error } = await supabase.from('comercios').insert({ ...formComercio, estado: 'activo' })
    if (error) setFormMsg({ ok: false, text: 'Error al registrar comercio.' })
    else {
      setFormMsg({ ok: true, text: 'Comercio agregado correctamente.' })
      setFormComercio({ nombre: '', categoria: 'Gym', descuento: '' })
      fetchComercios()
      setTimeout(() => setFormMsg(null), 2500)
    }
  }

  async function guardarEdicionComercio() {
    const { error } = await supabase.from('comercios').update(editComercio).eq('id', editComercio.id)
    if (!error) { setEditComercio(null); fetchComercios() }
  }

  async function eliminarComercio() {
    if (confirm(`¿Eliminar permanentemente a ${editComercio.nombre}?`)) {
      const { error } = await supabase.from('comercios').delete().eq('id', editComercio.id)
      if (!error) { setEditComercio(null); fetchComercios() }
    }
  }

  // --- TODA TU LÓGICA ORIGINAL INTACTA ---
  function doLogin() {
    const u = loginUser.toLowerCase()
    if (USERS[u] && USERS[u].pass === loginPass) {
      setUser({ name: u, label: USERS[u].label })
      setLoginErr(false)
    } else {
      setLoginErr(true)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length && filtered.length > 0) setSelectedIds([])
    else setSelectedIds(filtered.map(c => c.id))
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
        nombre: editCard.nombre,
        rut: editCard.rut,
        direccion: editCard.direccion,
        sector: editCard.sector,
        contacto: editCard.contacto,
        estado: editCard.estado,
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

  const filtered = cards.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.rut.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase()) ||
    (c.sector || '').toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: cards.length,
    hab: cards.filter(c => c.estado === 'habilitada').length,
    inh: cards.filter(c => c.estado === 'inhabilitada').length,
    bloq: cards.filter(c => c.estado === 'bloqueada').length,
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(-45deg, #00B5AD, #6B8500, #008a84, #4e6100)', backgroundSize: '400% 400%', animation: 'gradientBG 15s ease infinite', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <style>{`@keyframes gradientBG { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`}</style>
        <div style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)', padding: '3rem 2.5rem', borderRadius: 28, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
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
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', marginLeft: 5 }}>USUARIO</label>
              <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Ingresa tu usuario" style={{ marginBottom: 18, marginTop: 5, borderRadius: 12, border: '1px solid #eee', background: '#f8f9fa' }} />
              <label style={{ fontSize: 11, fontWeight: 800, color: '#999', marginLeft: 5 }}>CONTRASEÑA</label>
              <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••••" style={{ marginBottom: 20, marginTop: 5, borderRadius: 12, border: '1px solid #eee', background: '#f8f9fa' }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
            </div>
            {loginErr && <div style={{ fontSize: 12, color: '#A0005A', marginBottom: 20, textAlign: 'center', fontWeight: 700, background: '#FCE8F3', padding: '8px', borderRadius: '8px' }}>Credenciales incorrectas</div>}
            <button className="btn-teal" style={{ width: '100%', padding: '16px', borderRadius: 14, fontSize: 15, fontWeight: 800 }} onClick={doLogin}>ACCEDER AL PANEL</button>
        </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ background: '#00B5AD', padding: '12px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Joven+ Florida</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'white', fontSize: 11, fontWeight: 600 }}>{user.label}</span>
          <button className="btn-sm" onClick={() => setUser(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 15px' }}>Cerrar Sesión</button>
        </div>
      </div>

      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #eee' }}>
        {['resumen', 'registro', 'comercios', 'nuevo_local'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '16px', fontSize: 11, fontWeight: 800, border: 'none', background: 'none', color: tab === t ? '#00B5AD' : '#bbb', borderBottom: tab === t ? '4px solid #00B5AD' : '4px solid transparent', transition: '0.3s' }}>
            {['BENEFICIARIOS', 'NUEVO REGISTRO', 'COMERCIOS', 'NUEVO NEGOCIO'][i]}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
        {tab === 'resumen' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: '2rem' }}>
              {[{ label: 'TOTAL', val: stats.total, color: '#444', bg: 'white' }, { label: 'HABILIT.', val: stats.hab, color: '#007A75', bg: '#E0F7F6' }, { label: 'INHABILIT.', val: stats.inh, color: '#6B8500', bg: '#F2F9D6' }, { label: 'BLOQ.', val: stats.bloq, color: '#A0005A', bg: '#FCE8F3' }].map(s => (
                <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(0,0,0,0.03)', borderRadius: 12, padding: '12px 5px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 900, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 800, color: s.color, opacity: 0.7 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', marginBottom: 20 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT, ID o sector..." style={{ paddingLeft: 40, borderRadius: 12, height: 45 }} />
                <span style={{ position: 'absolute', left: 15, top: '52%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
            </div>

            {selectedIds.length > 0 && (
              <div style={{ background: '#222', color: 'white', padding: '14px 20px', borderRadius: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, flex: 1 }}>{selectedIds.length} seleccionados</span>
                <button className="btn-sm" onClick={() => updateBulkStatus('habilitada')} style={{ background: '#00B5AD' }}>Habilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('inhabilitada')} style={{ background: '#6B8500' }}>Inhabilitar</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: 'white', fontSize: 24, marginLeft: 5 }}>×</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 12px', gap: 12 }}>
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ width: 20, height: 20 }} />
                <span style={{ fontSize: 11, color: '#999', fontWeight: 800 }}>SELECCIONAR TODOS</span>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: '#aaa', fontWeight: 600 }}>Cargando datos...</div> : 
              filtered.map((c, idx) => (
                <div key={c.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 14, padding: '15px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 15 }}>
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 20, height: 20 }} />
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: AVATAR_COLORS[idx % 3], color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800 }}>{initials(c.nombre)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#333' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>ID: <b>{c.id}</b> • {c.sector || 'Sin sector'}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Badge estado={c.estado} />
                    <button className="btn-magenta" onClick={() => setEditCard({ ...c })} style={{ padding: '8px 15px', fontSize: 11, fontWeight: 700 }}>VER / EDITAR</button>
                  </div>
                </div>
              ))
            }
          </>
        )}

        {tab === 'registro' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '2.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: 25, fontSize: 20, fontWeight: 800 }}>Nuevo Beneficiario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>ID TARJETA</label><input value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })} placeholder="JM-000" /></div>
                <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>RUT</label><input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" /></div>
            </div>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>NOMBRE COMPLETO</label><input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y Apellidos" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>DIRECCIÓN</label><input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle / Pasaje" /></div>
                <div style={{ marginBottom: 15 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>SECTOR / VILLA</label><input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} placeholder="Ej: Villa El Prado" /></div>
            </div>
            <div style={{ marginBottom: 20 }}><label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>CONTACTO</label><input value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} placeholder="+569 / email" /></div>
            <button className="btn-teal" style={{ width: '100%', padding: '16px', fontWeight: 700 }} onClick={registrar}>REGISTRAR BENEFICIARIO</button>
            {formMsg && <div style={{ fontSize: 13, marginTop: 20, textAlign: 'center', fontWeight: 700, color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}

        {/* --- NUEVA VISTA COMERCIOS (ADICIONAL) --- */}
        {tab === 'comercios' && (
          <div style={{ display: 'grid', gap: 15 }}>
            {comercios.map((com) => (
              <div key={com.id} style={{ background: 'white', padding: 25, borderRadius: 15, display: 'flex', alignItems: 'center', border: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: '#00B5AD', fontWeight: 800 }}>{com.categoria.toUpperCase()}</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{com.nombre}</div>
                </div>
                <div style={{ textAlign: 'center', marginRight: 30 }}>
                  <div style={{ fontSize: 36, fontWeight: 900, color: '#D63D8F' }}>{com.descuento}%</div>
                  <div style={{ fontSize: 10, fontWeight: 800 }}>DESC.</div>
                </div>
                <button className="btn-magenta" onClick={() => setEditComercio(com)} style={{ padding: '10px 20px' }}>EDITAR</button>
              </div>
            ))}
          </div>
        )}

        {/* --- NUEVO REGISTRO LOCAL (ADICIONAL) --- */}
        {tab === 'nuevo_local' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '2.5rem' }}>
            <h3 style={{ marginTop: 0, marginBottom: 25, fontWeight: 800 }}>Nuevo Negocio Colaborador</h3>
            <label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>NOMBRE DEL LOCAL</label>
            <input value={formComercio.nombre} onChange={e => setFormComercio({...formComercio, nombre: e.target.value})} placeholder="Sushi, Gym, etc..." style={{marginBottom: 20}} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>CATEGORÍA</label>
                <select value={formComercio.categoria} onChange={e => setFormComercio({...formComercio, categoria: e.target.value})} style={{width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd'}}>
                  <option>Gym</option><option>Minimarket</option><option>Panadería</option><option>Sushi</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 800, color: '#666' }}>% DESCUENTO</label>
                <input type="number" value={formComercio.descuento} onChange={e => setFormComercio({...formComercio, descuento: e.target.value})} placeholder="Ej: 15" />
              </div>
            </div>
            <button className="btn-teal" style={{ width: '100%', marginTop: 30, padding: 16 }} onClick={registrarComercio}>GUARDAR LOCAL</button>
            {formMsg && <div style={{ fontSize: 13, marginTop: 20, textAlign: 'center', fontWeight: 700, color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}
      </div>

      {/* --- MODAL ORIGINAL DE EDICIÓN BENEFICIARIO (INTACTO) --- */}
      {editCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 25, borderBottom: '2px solid #f0f0f0', paddingBottom: 15 }}>Ficha del Beneficiario</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>RUT</label><input value={editCard.rut} onChange={e => setEditCard({...editCard, rut: e.target.value})} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>ESTADO</label><select value={editCard.estado} onChange={e => setEditCard({...editCard, estado: e.target.value})} style={{ padding: '10px', width: '100%', borderRadius: 10, border: '1px solid #ddd' }}><option value="habilitada">HABILITADA</option><option value="inhabilitada">INHABILITADA</option><option value="bloqueada">BLOQUEADA</option></select></div>
            </div>
            <div style={{ marginBottom: 15 }}><label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>NOMBRE</label><input value={editCard.nombre} onChange={e => setEditCard({...editCard, nombre: e.target.value})} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginBottom: 15 }}>
                <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>DIRECCIÓN</label><input value={editCard.direccion || ''} onChange={e => setEditCard({...editCard, direccion: e.target.value})} /></div>
                <div><label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>SECTOR</label><input value={editCard.sector || ''} onChange={e => setEditCard({...editCard, sector: e.target.value})} /></div>
            </div>
            <div style={{ marginBottom: 25 }}>
                <label style={{ fontSize: 10, fontWeight: 800, color: '#999' }}>OBSERVACIONES</label>
                <textarea value={editCard.observaciones || ''} onChange={e => setEditCard({...editCard, observaciones: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #ddd', height: 80, fontSize: 13, fontFamily: 'inherit' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-teal" onClick={guardarEdicion} style={{ padding: '14px' }}>GUARDAR CAMBIOS</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={eliminarTarjeta} style={{ flex: 1, background: '#fff', color: '#A0005A', border: '1px solid #A0005A', fontWeight: 700, borderRadius: 10 }}>ELIMINAR</button>
                <button onClick={() => setEditCard(null)} style={{ flex: 1, background: '#f0f0f0', border: 'none', fontWeight: 700, borderRadius: 10 }}>CERRAR</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NUEVO MODAL EDITAR COMERCIO (ADICIONAL) --- */}
      {editComercio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 20, padding: '2.5rem', width: '100%', maxWidth: 450 }}>
            <h3>Editar Comercio</h3>
            <input value={editComercio.nombre} onChange={e => setEditComercio({...editComercio, nombre: e.target.value})} />
            <input type="number" value={editComercio.descuento} onChange={e => setEditComercio({...editComercio, descuento: e.target.value})} style={{marginTop: 15}} />
            <div style={{ display: 'flex', gap: 10, marginTop: 25 }}>
              <button className="btn-teal" onClick={guardarEdicionComercio} style={{flex: 1}}>GUARDAR</button>
              <button onClick={eliminarComercio} style={{flex: 1, color: 'red', border: '1px solid red', borderRadius: 10, background: 'white'}}>ELIMINAR</button>
              <button onClick={() => setEditComercio(null)} style={{flex: 1, background: '#eee', border: 'none', borderRadius: 10}}>CERRAR</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
