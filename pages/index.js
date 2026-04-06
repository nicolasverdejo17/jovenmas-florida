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
    <span style={{ background: s.bg, color: s.color, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500 }}>
      {s.label}
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
  
  // Estado para la selección múltiple
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => { if (user) fetchCards() }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
    setSelectedIds([]) // Limpiar selección al recargar
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

  // Manejo de checkboxes
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map(c => c.id))
    }
  }

  // Acción masiva (Inhabilitar o Bloquear grupo)
  async function updateBulkStatus(nuevoEstado) {
    const confirmar = confirm(`¿Cambiar el estado de ${selectedIds.length} tarjetas a "${nuevoEstado}"?`)
    if (!confirmar) return

    const { error } = await supabase
      .from('tarjetas')
      .update({ estado: nuevoEstado })
      .in('id', selectedIds)

    if (error) {
      alert("Error en actualización masiva: " + error.message)
    } else {
      fetchCards()
    }
  }

  async function registrar() {
    if (!form.id || !form.nombre || !form.rut) {
      setFormMsg({ ok: false, text: 'ID, nombre y RUT son obligatorios.' })
      return
    }
    const { error } = await supabase.from('tarjetas').insert({
      id: form.id.trim(),
      nombre: form.nombre.trim(),
      rut: form.rut.trim(),
      direccion: form.direccion.trim(),
      contacto: form.contacto.trim(),
      estado: 'habilitada',
    })
    if (error) {
      setFormMsg({ ok: false, text: error.code === '23505' ? 'Ese ID ya existe.' : 'Error al registrar.' })
    } else {
      setFormMsg({ ok: true, text: 'Tarjeta registrada y habilitada correctamente.' })
      setForm({ id: '', nombre: '', rut: '', direccion: '', contacto: '' })
      fetchCards()
      setTimeout(() => setFormMsg(null), 2500)
    }
  }

  async function guardarEdicion() {
    const { error } = await supabase.from('tarjetas').update({
      nombre: editCard.nombre,
      rut: editCard.rut,
      direccion: editCard.direccion,
      contacto: editCard.contacto,
      estado: editCard.estado,
    }).eq('id', editCard.id)
    if (!error) { setEditCard(null); fetchCards() }
  }

  async function eliminarTarjeta() {
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la tarjeta de ${editCard.nombre}?`)
    if (confirmar) {
      const { error } = await supabase.from('tarjetas').delete().eq('id', editCard.id)
      if (error) alert("Error al eliminar: " + error.message)
      else { setEditCard(null); fetchCards() }
    }
  }

  const filtered = cards.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.rut.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const habilitadas = cards.filter(c => c.estado === 'habilitada').length
  const bloqueadas = cards.filter(c => c.estado === 'bloqueada').length

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      {/* Header simple para Login */}
      <div style={{ background: '#00B5AD', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Panel Municipal</div>
        </div>
      </div>
      <div style={{ maxWidth: 360, margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Iniciar sesión</div>
        <div style={{ width: 36, height: 3, background: '#D63D8F', borderRadius: 2, marginBottom: '1.5rem' }}></div>
        <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Usuario" style={{ marginBottom: 10 }} />
        <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Contraseña" style={{ marginBottom: 10 }} onKeyDown={e => e.key === 'Enter' && doLogin()} />
        {loginErr && <div style={{ fontSize: 12, color: '#A0005A', marginBottom: 8 }}>Datos incorrectos.</div>}
        <button className="btn-teal" style={{ width: '100%' }} onClick={doLogin}>Ingresar</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      {/* Header Principal */}
      <div style={{ background: '#00B5AD', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="20" r="3" fill="#D63D8F"/></svg>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Joven+ Florida</div>
        </div>
        <button className="btn-sm" onClick={() => setUser(null)} style={{ fontSize: 11 }}>Salir</button>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: 'white' }}>
        {['resumen', 'registro'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '12px', fontSize: 13, fontWeight: 500,
            color: tab === t ? '#00B5AD' : '#888', background: 'transparent',
            border: 'none', borderBottom: tab === t ? '2px solid #00B5AD' : '2px solid transparent'
          }}>{['Lista de Tarjetas', 'Nuevo Registro'][i]}</button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem' }}>
        {tab === 'resumen' && (
          <>
            {/* Estadísticas */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#444' }}>{cards.length}</div>
                <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase' }}>Total</div>
              </div>
              <div style={{ background: '#E0F7F6', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#007A75' }}>{habilitadas}</div>
                <div style={{ fontSize: 10, color: '#007A75', textTransform: 'uppercase' }}>Habilitadas</div>
              </div>
              <div style={{ background: '#FCE8F3', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#A0005A' }}>{bloqueadas}</div>
                <div style={{ fontSize: 10, color: '#A0005A', textTransform: 'uppercase' }}>Bloqueadas</div>
              </div>
            </div>

            {/* Buscador */}
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT o ID..." style={{ marginBottom: 12 }} />

            {/* Barra de Acciones Masivas (Solo aparece si hay seleccionados) */}
            {selectedIds.length > 0 && (
              <div style={{ background: '#333', color: 'white', padding: '10px 15px', borderRadius: 8, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10, animation: 'slideIn 0.3s' }}>
                <span style={{ fontSize: 13, flex: 1 }}>{selectedIds.length} seleccionados</span>
                <button className="btn-sm" onClick={() => updateBulkStatus('habilitada')} style={{ background: '#00B5AD', border: 'none' }}>Habilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('inhabilitada')} style={{ background: '#888', border: 'none' }}>Inhabilitar</button>
                <button className="btn-sm" onClick={() => updateBulkStatus('bloqueada')} style={{ background: '#D63D8F', border: 'none' }}>Bloquear</button>
                <button onClick={() => setSelectedIds([])} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 18, cursor: 'pointer' }}>×</button>
              </div>
            )}

            {/* Cabecera de Lista */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 8px', gap: 10 }}>
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} style={{ cursor: 'pointer' }} />
                <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>SELECCIONAR TODO</span>
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '2rem' }}>Cargando...</div>}
            
            {filtered.map(c => (
              <div key={c.id} style={{ 
                background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '10px 12px', marginBottom: 8, 
                display: 'flex', alignItems: 'center', gap: 10,
                opacity: c.estado === 'inhabilitada' ? 0.6 : 1 // Visualizador de inhabilitadas
              }}>
                <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelect(c.id)} />
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee', color: '#666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                  {initials(c.nombre)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{c.id} · {c.rut}</div>
                </div>
                <Badge estado={c.estado} />
                <button className="btn-magenta" onClick={() => setEditCard({ ...c })}>Editar</button>
              </div>
            ))}
          </>
        )}

        {tab === 'registro' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '1.5rem' }}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>ID Tarjeta Física</div>
              <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="Ej: JM-001" />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Nombre Completo</div>
              <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>RUT</div>
              <input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
            </div>
            <button className="btn-teal" style={{ width: '100%', marginTop: 10 }} onClick={registrar}>Registrar Beneficiario</button>
            {formMsg && <div style={{ fontSize: 12, marginTop: 10, textAlign: 'center', color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}
      </div>

      {/* Modal de Edición */}
      {editCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: '1rem' }}>Editar: {editCard.id}</div>
            <input value={editCard.nombre} onChange={e => setEditCard({...editCard, nombre: e.target.value})} style={{ marginBottom: 10 }} />
            <select value={editCard.estado} onChange={e => setEditCard({...editCard, estado: e.target.value})} style={{ marginBottom: 15 }}>
              <option value="habilitada">Habilitada</option>
              <option value="inhabilitada">Inhabilitada</option>
              <option value="bloqueada">Bloqueada</option>
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-teal" onClick={guardarEdicion}>Guardar</button>
              <button onClick={eliminarTarjeta} style={{ background: '#FCE8F3', color: '#A0005A', border: '1px solid #A0005A' }}>Eliminar</button>
              <button onClick={() => setEditCard(null)} style={{ background: '#eee' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
