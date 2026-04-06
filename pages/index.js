import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const USERS = {
  admin: { pass: 'admin123', label: 'Administrador' },
  equipo: { pass: 'equipo123', label: 'Equipo' },
}

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
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>
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
  const [form, setForm] = useState({ id: '', nombre: '', rut: '', direccion: '', contacto: '' })
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => { if (user) fetchCards() }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
    setSelectedIds([])
    setLoading(false)
  }

  function doLogin() {
    if (USERS[loginUser] && USERS[loginUser].pass === loginPass) {
      setUser({ name: loginUser, label: USERS[loginUser].label })
      setLoginErr(false)
    } else {
      setLoginErr(true)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([])
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
      setFormMsg({ ok: false, text: 'ID, nombre y RUT obligatorios.' })
      return
    }
    const { error } = await supabase.from('tarjetas').insert({ ...form, estado: 'habilitada' })
    if (error) setFormMsg({ ok: false, text: error.code === '23505' ? 'ID ya existe.' : 'Error.' })
    else {
      setFormMsg({ ok: true, text: 'Registrado con éxito.' })
      setForm({ id: '', nombre: '', rut: '', direccion: '', contacto: '' })
      fetchCards()
      setTimeout(() => setFormMsg(null), 2500)
    }
  }

  async function guardarEdicion() {
    const { error } = await supabase.from('tarjetas').update(editCard).eq('id', editCard.id)
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
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: cards.length,
    hab: cards.filter(c => c.estado === 'habilitada').length,
    inh: cards.filter(c => c.estado === 'inhabilitada').length,
    bloq: cards.filter(c => c.estado === 'bloqueada').length,
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', width: '100%', maxWidth: 350 }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ width: 50, height: 50, background: '#00B5AD', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#333' }}>Joven+ Florida</div>
            </div>
            <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Usuario" style={{ marginBottom: 12 }} />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Contraseña" style={{ marginBottom: 12 }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
            {loginErr && <div style={{ fontSize: 12, color: '#A0005A', marginBottom: 12, textAlign: 'center' }}>Credenciales incorrectas</div>}
            <button className="btn-teal" style={{ width: '100%' }} onClick={doLogin}>Entrar al Panel</button>
        </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div style={{ background: '#00B5AD', padding: '12px 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
            </div>
            <span style={{ color: 'white', fontWeight: 600, fontSize: 15 }}>Joven+ Florida</span>
        </div>
        <button className="btn-sm" onClick={() => setUser(null)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white' }}>Salir</button>
      </div>

      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #eee' }}>
        {['resumen', 'registro'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '14px', fontSize: 13, fontWeight: 600, border: 'none', background: 'none',
            color: tab === t ? '#00B5AD' : '#888', borderBottom: tab === t ? '3px solid #00B5AD' : '3px solid transparent'
          }}>{['LISTA DE TARJETAS', 'NUEVO REGISTRO'][i]}</button>
        ))}
      </div>

      <div style={{ maxWidth: 750, margin: '0 auto', padding: '1rem' }}>
        {tab === 'resumen' && (
          <>
            {/* Estadísticas de 4 columnas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: '1.5rem' }}>
              {[
                { label: 'TOTAL', val: stats.total, color: '#444', bg: 'white' },
                { label: 'HAB.', val: stats.hab, color: '#007A75', bg: '#E0F7F6' },
                { label: 'INH.', val: stats.inh, color: '#6B8500', bg: '#F2F9D6' },
                { label: 'BLOQ.', val: stats.bloq, color: '#A0005A', bg: '#FCE8F3' }
              ].map(s => (
                <div key={s.label} style={{ background: s.bg, border: '1px solid rgba(0,0,0,0.05)', borderRadius: 10, padding: '10px 5px', textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: s.color, opacity: 0.8 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ position: 'relative', marginBottom: 15 }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT o ID..." style={{ paddingLeft: 35 }} />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#999' }}>🔍</span>
            </div>

            {selectedIds.length > 0 && (
              <div style={{ background: '#333', color: 'white', padding: '12px', borderRadius: 12, marginBottom: 15, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                <span style={{ fontSize: 12, fontWeight: 600, flex: 1 }}>{selectedIds.length} seleccionados</span>
                <button className="btn-sm" onClick={() => updateBulkStatus('habilitada')} style={{ background: '#007A75', fontSize: 10 }}>Habilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('inhabilitada')} style={{ background: '#6B8500', fontSize: 10 }}>Inhabilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('bloqueada')} style={{ background: '#A0005A', fontSize: 10 }}>Bloquear</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'none', border: 'none', color: 'white', fontSize: 20, marginLeft: 5 }}>×</button>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', padding: '0 10px 10px', gap: 10 }}>
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 11, color: '#888', fontWeight: 700 }}>SELECCIONAR TODOS LOS RESULTADOS</span>
            </div>

            {loading ? <div style={{ textAlign: 'center', padding: '3rem', color: '#888' }}>Cargando datos...</div> : 
              filtered.map(c => (
                <div key={c.id} style={{ 
                  background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '12px', marginBottom: 8, 
                  display: 'flex', alignItems: 'center', gap: 12, transition: '0.2s',
                  opacity: c.estado === 'inhabilitada' ? 0.5 : 1
                }}>
                  <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} style={{ width: 18, height: 18, flexShrink: 0 }} />
                  
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f0f2f5', color: '#555', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {initials(c.nombre)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.id} • {c.rut}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <Badge estado={c.estado} />
                    <button className="btn-magenta" onClick={() => setEditCard({ ...c })} style={{ padding: '6px 12px', fontSize: 11 }}>Editar</button>
                  </div>
                </div>
              ))
            }
          </>
        )}

        {tab === 'registro' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 16, padding: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
            <h3 style={{ marginTop: 0, marginBottom: 20, fontSize: 18 }}>Nuevo Beneficiario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>ID TARJETA</label>
                    <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value.toUpperCase() })} placeholder="JM-000" />
                </div>
                <div style={{ marginBottom: 15 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>RUT</label>
                    <input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
                </div>
            </div>
            <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: '#666' }}>NOMBRE COMPLETO</label>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y Apellidos" />
            </div>
            <button className="btn-teal" style={{ width: '100%', padding: '14px', fontSize: 14, marginTop: 10 }} onClick={registrar}>Registrar y Habilitar</button>
            {formMsg && <div style={{ fontSize: 13, marginTop: 15, textAlign: 'center', fontWeight: 600, color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}
      </div>

      {editCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', borderRadius: 16, padding: '2rem', width: '100%', maxWidth: 400, boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Editar Beneficiario</div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#999' }}>NOMBRE</label>
            <input value={editCard.nombre} onChange={e => setEditCard({...editCard, nombre: e.target.value})} style={{ marginBottom: 15 }} />
            
            <label style={{ fontSize: 11, fontWeight: 700, color: '#999' }}>ESTADO DE TARJETA</label>
            <select value={editCard.estado} onChange={e => setEditCard({...editCard, estado: e.target.value})} style={{ marginBottom: 20, padding: '10px', width: '100%', borderRadius: 8, border: '1px solid #ddd' }}>
              <option value="habilitada">HABILITADA</option>
              <option value="inhabilitada">INHABILITADA</option>
              <option value="bloqueada">BLOQUEADA</option>
            </select>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn-teal" onClick={guardarEdicion}>Guardar Cambios</button>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={eliminarTarjeta} style={{ flex: 1, background: '#fff', color: '#A0005A', border: '1px solid #A0005A' }}>Eliminar</button>
                <button onClick={() => setEditCard(null)} style={{ flex: 1, background: '#eee', border: 'none' }}>Cancelar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
