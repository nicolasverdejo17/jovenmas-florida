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

  useEffect(() => { if (user) fetchCards() }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
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
    const confirmar = confirm(`¿Estás seguro de que deseas eliminar la tarjeta de ${editCard.nombre}? Esta acción no se puede deshacer.`)
    if (confirmar) {
      const { error } = await supabase
        .from('tarjetas')
        .delete()
        .eq('id', editCard.id)

      if (error) {
        alert("Error al eliminar: " + error.message)
      } else {
        setEditCard(null)
        fetchCards()
      }
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
      <div style={{ background: '#00B5AD', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Sistema de tarjetas</div>
        </div>
      </div>
      <div style={{ maxWidth: 360, margin: '3rem auto', padding: '0 1rem' }}>
        <div style={{ fontSize: 22, fontWeight: 500, marginBottom: 4 }}>Iniciar sesión</div>
        <div style={{ width: 36, height: 3, background: '#D63D8F', borderRadius: 2, marginBottom: '1.5rem' }}></div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Usuario</div>
          <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Tu usuario" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Contraseña</div>
          <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="••••••" onKeyDown={e => e.key === 'Enter' && doLogin()} />
        </div>
        {loginErr && <div style={{ fontSize: 12, color: '#A0005A', marginBottom: 8 }}>Usuario o contraseña incorrectos.</div>}
        <button className="btn-teal" style={{ width: '100%' }} onClick={doLogin}>Ingresar</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f9' }}>
      <div style={{ background: '#00B5AD', padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Sistema de tarjetas</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)' }}>{user.label}</span>
          <button className="btn-sm" onClick={() => setUser(null)} style={{ fontSize: 11, padding: '3px 8px' }}>Salir</button>
        </div>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid #eee', background: 'white' }}>
        {['resumen', 'registro'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 4px', fontSize: 13, fontWeight: 500, textAlign: 'center',
            color: tab === t ? '#00B5AD' : '#888', background: 'transparent',
            border: 'none', borderBottom: tab === t ? '2px solid #00B5AD' : '2px solid transparent'
          }}>{['Resumen', 'Registro'][i]}</button>
        ))}
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '1rem' }}>
        {tab === 'resumen' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: '1rem' }}>
              <div style={{ background: '#E0F7F6', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#007A75' }}>{cards.length}</div>
                <div style={{ fontSize: 11, color: '#007A75' }}>Total</div>
              </div>
              <div style={{ background: '#F2F9D6', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#6B8500' }}>{habilitadas}</div>
                <div style={{ fontSize: 11, color: '#6B8500' }}>Habilitadas</div>
              </div>
              <div style={{ background: '#FCE8F3', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 500, color: '#A0005A' }}>{bloqueadas}</div>
                <div style={{ fontSize: 11, color: '#A0005A' }}>Bloqueadas</div>
              </div>
            </div>
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, RUT o ID..." style={{ paddingLeft: 28 }} />
              <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#aaa', fontSize: 13 }}>⌕</span>
            </div>
            {loading && <div style={{ textAlign: 'center', color: '#888', padding: '2rem', fontSize: 13 }}>Cargando...</div>}
            {filtered.map(c => (
              <div key={c.id} style={{ background: 'white', border: '1px solid #eee', borderRadius: 8, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E0F7F6', color: '#007A75', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500, flexShrink: 0 }}>
                  {initials(c.nombre)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.nombre}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{c.rut} · {c.id}</div>
                </div>
                <Badge estado={c.estado} />
                <button className="btn-magenta" onClick={() => setEditCard({ ...c })}>Editar</button>
              </div>
            ))}
            {!loading && filtered.length === 0 && <div style={{ textAlign: 'center', color: '#888', padding: '2rem', fontSize: 13 }}>No hay tarjetas registradas aún.</div>}
          </>
        )}

        {tab === 'registro' && (
          <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '1rem 1.25rem' }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>ID de la tarjeta física</div>
              <input value={form.id} onChange={e => setForm({ ...form, id: e.target.value })} placeholder="Ej: JM-00142" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Nombre completo</div>
                <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre y apellidos" />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>RUT</div>
                <input value={form.rut} onChange={e => setForm({ ...form, rut: e.target.value })} placeholder="12.345.678-9" />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Dirección</div>
                <input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} placeholder="Calle, número" />
              </div>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Teléfono / Email</div>
                <input value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} placeholder="+56 9 ... o correo" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn-teal" onClick={registrar}>Registrar y habilitar</button>
              <button onClick={() => setForm({ id: '', nombre: '', rut: '', direccion: '', contacto: '' })}>Limpiar</button>
            </div>
            {formMsg && <div style={{ fontSize: 12, marginTop: 8, color: formMsg.ok ? '#007A75' : '#A0005A' }}>{formMsg.text}</div>}
          </div>
        )}
      </div>

      {editCard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: '1.5rem', width: '100%', maxWidth: 400 }}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: '1rem' }}>Editar tarjeta — {editCard.id}</div>
            {[['nombre','Nombre'],['rut','RUT'],['direccion','Dirección'],['contacto','Contacto']].map(([k,l]) => (
              <div key={k} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>{l}</div>
                <input value={editCard[k] || ''} onChange={e => setEditCard({ ...editCard, [k]: e.target.value })} />
              </div>
            ))}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Estado</div>
              <select value={editCard.estado} onChange={e => setEditCard({ ...editCard, estado: e.target.value })}>
                <option value="habilitada">Habilitada</option>
                <option value="inhabilitada">Inhabilitada</option>
                <option value="bloqueada">Bloqueada</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-teal" onClick={guardarEdicion}>Guardar cambios</button>
              <button 
                onClick={eliminarTarjeta} 
                style={{ 
                  background: '#FCE8F3', 
                  color: '#A0005A', 
                  border: '1px solid #A0005A',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Eliminar
              </button>
              <button onClick={() => setEditCard(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
