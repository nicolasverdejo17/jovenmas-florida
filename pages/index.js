import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Usuarios actualizados
const USERS = {
  admin: { pass: 'admin123', label: 'Administrador' },
  equipo: { pass: 'equipo123', label: 'Equipo' },
  nverdejo: { pass: 'Joven+', label: 'Nicolás Verdejo' },
  jparra: { pass: 'Joven+', label: 'Javiera Parra' }
}

const AVATAR_COLORS = ['#00B5AD', '#6B8500', '#D63D8F', '#F2711C', '#B5CC18']

function initials(name) {
  const parts = name.trim().split(' ')
  return ((parts[0] || '')[0] || '').toUpperCase() + ((parts[1] || '')[0] || '').toUpperCase()
}

function Badge({ estado }) {
  const map = {
    habilitada: { bg: '#E0F7F6', color: '#007A75', label: 'Habilitada' },
    inhabilitada: { bg: '#F2F9D6', color: '#6B8500', label: 'Inhabilitada' },
    bloqueada: { bg: '#FCE8F3', color: '#A0005A', label: 'Bloqueada' },
    activo: { bg: '#E0F7F6', color: '#007A75', label: 'Activo' },
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
  const [comercios, setComercios] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Estados para Beneficiarios
  const [editCard, setEditCard] = useState(null)
  const [form, setForm] = useState({ id: '', nombre: '', rut: '', direccion: '', sector: '', contacto: '' })
  
  // Estados para Comercios
  const [editComercio, setEditComercio] = useState(null)
  const [formComercio, setFormComercio] = useState({ nombre: '', categoria: 'Minimarket', descuento: '' })
  
  const [formMsg, setFormMsg] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

  useEffect(() => { 
    if (user) {
        fetchCards()
        fetchComercios()
    } 
  }, [user])

  async function fetchCards() {
    setLoading(true)
    const { data } = await supabase.from('tarjetas').select('*').order('creado_en', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  async function fetchComercios() {
    const { data } = await supabase.from('comercios').select('*').order('nombre', { ascending: true })
    setComercios(data || [])
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

  // --- LÓGICA DE COMERCIOS ---
  async function registrarComercio() {
    if (!formComercio.nombre || !formComercio.descuento) {
        setFormMsg({ ok: false, text: 'Nombre y descuento son obligatorios.' })
        return
    }
    const { error } = await supabase.from('comercios').insert([{ ...formComercio, estado: 'activo' }])
    if (error) setFormMsg({ ok: false, text: 'Error al registrar comercio.' })
    else {
        setFormMsg({ ok: true, text: 'Comercio agregado con éxito.' })
        setFormComercio({ nombre: '', categoria: 'Minimarket', descuento: '' })
        fetchComercios()
        setTimeout(() => setFormMsg(null), 2500)
    }
  }

  async function guardarEdicionComercio() {
    const { error } = await supabase.from('comercios').update(editComercio).eq('id', editComercio.id)
    if (!error) { setEditComercio(null); fetchComercios() }
  }

  async function eliminarComercio(id) {
    if (confirm("¿Eliminar este comercio del sistema?")) {
        const { error } = await supabase.from('comercios').delete().eq('id', id)
        if (!error) { setEditComercio(null); fetchComercios() }
    }
  }

  // --- RENDERIZADO ---
  if (!user) return (
    /* Mismo bloque de Login que ya tienes */
    <div style={{ minHeight: '100vh', background: 'linear-gradient(-45deg, #00B5AD, #6B8500, #008a84, #4e6100)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', padding: '3rem 2.5rem', borderRadius: 28, width: '100%', maxWidth: 380, textAlign: 'center' }}>
            <h2>Joven+ Florida</h2>
            <input value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="Usuario" style={{marginBottom: 10}} />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Contraseña" onKeyDown={e => e.key === 'Enter' && doLogin()} />
            {loginErr && <p style={{color: 'red'}}>Error de acceso</p>}
            <button onClick={doLogin} style={{width: '100%', padding: 15, background: '#00B5AD', color: 'white', borderRadius: 10, border: 'none', fontWeight: 800, marginTop: 10}}>ACCEDER</button>
        </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      {/* Header */}
      <div style={{ background: '#00B5AD', padding: '12px 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: 'white', fontWeight: 700 }}>Joven+ Florida</span>
        <button onClick={() => setUser(null)} style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: 8 }}>Salir</button>
      </div>

      {/* Tabs dinámicas */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid #eee' }}>
        {['resumen', 'registro', 'comercios', 'nuevo-comercio'].map((t, i) => (
          <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '16px', fontSize: 10, fontWeight: 800, border: 'none', background: 'none', color: tab === t ? '#00B5AD' : '#bbb', borderBottom: tab === t ? '4px solid #00B5AD' : '4px solid transparent' }}>
            {['LISTA JOVEN+', 'NUEVO JOVEN+', 'COMERCIOS', 'NUEVO LOCAL'][i]}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '1.5rem' }}>
        
        {/* VISTA COMERCIOS */}
        {tab === 'comercios' && (
            <>
                <h2 style={{fontWeight: 900}}>Comercios en Red</h2>
                <div style={{display: 'grid', gap: 12}}>
                    {comercios.map((com, idx) => (
                        <div key={com.id} style={{background: 'white', padding: 20, borderRadius: 15, display: 'flex', alignItems: 'center', border: '1px solid #eee'}}>
                            <div style={{flex: 1}}>
                                <div style={{fontSize: 10, color: '#00B5AD', fontWeight: 800}}>{com.categoria.toUpperCase()}</div>
                                <div style={{fontSize: 18, fontWeight: 800, color: '#333'}}>{com.nombre}</div>
                            </div>
                            <div style={{textAlign: 'center', marginRight: 20}}>
                                <div style={{fontSize: 24, fontWeight: 900, color: '#D63D8F'}}>{com.descuento}%</div>
                                <div style={{fontSize: 9, fontWeight: 700}}>DESC.</div>
                            </div>
                            <button className="btn-sm" onClick={() => setEditComercio(com)} style={{background: '#f0f0f0', color: '#666'}}>EDITAR</button>
                        </div>
                    ))}
                </div>
            </>
        )}

        {/* REGISTRO COMERCIO */}
        {tab === 'nuevo-comercio' && (
            <div style={{ background: 'white', border: '1px solid #eee', borderRadius: 20, padding: '2rem' }}>
                <h3 style={{fontWeight: 800}}>Sumar Nuevo Comercio</h3>
                <label style={{fontSize: 11, fontWeight: 800}}>NOMBRE DEL LOCAL</label>
                <input value={formComercio.nombre} onChange={e => setFormComercio({...formComercio, nombre: e.target.value})} placeholder="Ej: Sushi Florida" />
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15, marginTop: 15}}>
                    <div>
                        <label style={{fontSize: 11, fontWeight: 800}}>CATEGORÍA</label>
                        <select value={formComercio.categoria} onChange={e => setFormComercio({...formComercio, categoria: e.target.value})} style={{width: '100%', padding: 12, borderRadius: 10, border: '1px solid #ddd'}}>
                            <option>Minimarket</option>
                            <option>Gym</option>
                            <option>Panadería</option>
                            <option>Sushi</option>
                            <option>Farmacia</option>
                            <option>Otro</option>
                        </select>
                    </div>
                    <div>
                        <label style={{fontSize: 11, fontWeight: 800}}>% DESCUENTO</label>
                        <input type="number" value={formComercio.descuento} onChange={e => setFormComercio({...formComercio, descuento: e.target.value})} placeholder="Ej: 15" />
                    </div>
                </div>
                <button className="btn-teal" style={{width: '100%', marginTop: 20, padding: 15}} onClick={registrarComercio}>GUARDAR COMERCIO</button>
                {formMsg && <div style={{textAlign: 'center', marginTop: 10, color: formMsg.ok ? 'green' : 'red'}}>{formMsg.text}</div>}
            </div>
        )}

        {/* MANTENEMOS EL TAB DE RESUMEN Y REGISTRO DE JOVEN+ IGUAL QUE ANTES */}
        {tab === 'resumen' && (
            /* Aquí va tu código original de la lista de beneficiarios */
            <div>... (Código de lista de beneficiarios) ...</div>
        )}

      </div>

      {/* MODAL EDICIÓN COMERCIO */}
      {editComercio && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
            <div style={{ background: 'white', padding: 30, borderRadius: 20, width: 400 }}>
                <h3>Editar Comercio</h3>
                <input value={editComercio.nombre} onChange={e => setEditComercio({...editComercio, nombre: e.target.value})} style={{marginBottom: 10}} />
                <input type="number" value={editComercio.descuento} onChange={e => setEditComercio({...editComercio, descuento: e.target.value})} />
                <div style={{display: 'flex', gap: 10, marginTop: 20}}>
                    <button onClick={guardarEdicionComercio} style={{flex: 1, background: '#00B5AD', color: 'white', border: 'none', padding: 10, borderRadius: 8}}>GUARDAR</button>
                    <button onClick={() => eliminarComercio(editComercio.id)} style={{background: 'white', color: 'red', border: '1px solid red', padding: 10, borderRadius: 8}}>BORRAR</button>
                    <button onClick={() => setEditComercio(null)} style={{background: '#eee', border: 'none', padding: 10, borderRadius: 8}}>CERRAR</button>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
