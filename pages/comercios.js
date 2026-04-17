import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function Footer() {
  return (
    <div style={{ background: 'linear-gradient(135deg, #00B5AD, #6B8500)', padding: '1rem 1rem 0.8rem' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 10 }}>
        <a href="https://instagram.com/joven_mas_florida" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: 600 }}>@joven_mas_florida</span>
        </a>
        <a href="https://facebook.com/jovenmasflorida" target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.75)', fontSize: 9, fontWeight: 600 }}>Joven+ Florida</span>
        </a>
      </div>
      <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9 }}>
          © {new Date().getFullYear()} Joven+ Florida — Todos los derechos reservados
        </span>
      </div>
    </div>
  )
}

function SplashScreen({ onEnter }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(-45deg, #00B5AD, #007A75, #00968f, #AACC00)',
      backgroundSize: '400% 400%',
      animation: 'gradientBG 12s ease infinite',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <style>{`
        @keyframes gradientBG {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-5deg); }
          50%       { transform: translateY(-10px) rotate(-5deg); }
        }
        .splash-card  { animation: fadeUp 0.65s ease forwards; }
        .splash-logo  { animation: float 4s ease-in-out infinite; }
        .splash-btn   { transition: transform 0.15s, box-shadow 0.15s; }
        .splash-btn:hover  { transform: scale(1.02); box-shadow: 0 12px 28px rgba(0,181,173,0.5) !important; }
        .splash-btn:active { transform: scale(0.97); }
      `}</style>

      {/* Círculos decorativos de fondo */}
      <div style={{ position: 'absolute', top: -70, right: -70, width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />
      <div style={{ position: 'absolute', bottom: -90, left: -90, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
      <div style={{ position: 'absolute', top: '30%', left: -50, width: 130, height: 130, borderRadius: '50%', background: 'rgba(214,61,143,0.18)' }} />
      <div style={{ position: 'absolute', bottom: '22%', right: -35, width: 110, height: 110, borderRadius: '50%', background: 'rgba(170,204,0,0.18)' }} />

      {/* Tarjeta principal */}
      <div className="splash-card" style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 32,
        padding: '2.5rem 2rem 2rem',
        width: '100%',
        maxWidth: 360,
        textAlign: 'center',
        boxShadow: '0 32px 64px rgba(0,0,0,0.22)',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Logo */}
        <div className="splash-logo" style={{
          width: 80, height: 80,
          background: 'linear-gradient(135deg, #00B5AD, #007A75)',
          borderRadius: 24,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
          boxShadow: '0 12px 28px rgba(0,181,173,0.4)',
        }}>
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3.2" fill="#D63D8F"/>
          </svg>
        </div>

        {/* Título */}
        <div style={{ fontSize: 36, fontWeight: 900, color: '#1a1a1a', letterSpacing: '-1.5px', lineHeight: 1 }}>
          Joven<span style={{ color: '#D63D8F' }}>+</span>
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#00B5AD', letterSpacing: 3, textTransform: 'uppercase', marginTop: 6 }}>
          Florida
        </div>

        {/* Divisor */}
        <div style={{ width: 40, height: 3, background: '#AACC00', borderRadius: 2, margin: '16px auto' }} />

        {/* Descripción */}
        <p style={{ fontSize: 14.5, color: '#444', lineHeight: 1.65, margin: '0 0 6px', fontWeight: 500 }}>
          Descuentos exclusivos en comercios locales para jóvenes de 15 a 29 años de la comuna de Florida.
        </p>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5, margin: '0 0 24px' }}>
          Presenta tu tarjeta Joven+ y accede a tus beneficios.
        </p>

        {/* Pills */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          <span style={{ background: '#E0F7F6', color: '#007A75', fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 20 }}>
            🏪 Comercios locales
          </span>
          <span style={{ background: '#FCE8F3', color: '#A0005A', fontSize: 11, fontWeight: 700, padding: '5px 13px', borderRadius: 20 }}>
            🎉 Descuentos reales
          </span>
        </div>

        {/* Botón CTA */}
        <button
          className="splash-btn"
          onClick={onEnter}
          style={{
            width: '100%',
            padding: '17px',
            background: 'linear-gradient(135deg, #00B5AD, #007A75)',
            color: 'white',
            border: 'none',
            borderRadius: 16,
            fontSize: 15,
            fontWeight: 800,
            cursor: 'pointer',
            letterSpacing: 0.3,
            boxShadow: '0 8px 20px rgba(0,181,173,0.38)',
            fontFamily: 'inherit',
          }}
        >
          Ver comercios adheridos →
        </button>

        <div style={{ marginTop: 16, fontSize: 11, color: '#bbb' }}>
          @joven_mas_florida · joven.mas.florida@gmail.com
        </div>
      </div>
    </div>
  )
}

export default function ComerciosPage() {
  const [splash, setSplash] = useState(true)
  const [comercios, setComercios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchComercios() {
      const { data } = await supabase
        .from('comercios')
        .select('nombre, categoria, descuento, direccion, sector, maps_url')
        .eq('estado', 'activo')
        .order('nombre', { ascending: true })
      setComercios(data || [])
      setLoading(false)
    }
    fetchComercios()
  }, [])

  if (splash) return <SplashScreen onEnter={() => setSplash(false)} />

  const filtered = comercios.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.categoria || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.sector || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh', background: '#00B5AD', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>

      <div style={{ padding: '16px 1rem 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 16, fontWeight: 800 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Comercios colaboradores</div>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.15)', margin: '0 1rem 16px', borderRadius: 14, padding: '12px 16px', textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
          🎉 Presenta tu tarjeta Joven+ y accede a descuentos exclusivos
        </div>
      </div>

      <div style={{ margin: '0 1rem 16px', position: 'relative' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre, categoría o sector..."
          style={{ width: '100%', padding: '13px 16px 13px 42px', borderRadius: 14, border: 'none', fontSize: 14, background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.1)', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
        />
        <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>🔍</span>
      </div>

      <div style={{ flex: 1, padding: '0 1rem 0' }}>
        {loading && <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: 14 }}>Cargando comercios...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: 14 }}>
            {search ? 'No se encontraron resultados.' : 'No hay comercios registrados aún.'}
          </div>
        )}
        {filtered.map((c, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '18px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: idx % 2 === 0 ? '#00B5AD' : '#D63D8F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                {(c.nombre[0] || '').toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#222' }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.categoria || 'Local colaborador'}</div>
              </div>
              <div style={{ background: 'linear-gradient(135deg, #D63D8F, #a0005a)', borderRadius: 14, padding: '10px 14px', textAlign: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(214,61,143,0.3)' }}>
                <div style={{ fontSize: 30, fontWeight: 900, color: 'white', lineHeight: 1 }}>{c.descuento}%</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.85)', letterSpacing: 1 }}>DESCUENTO</div>
              </div>
            </div>
            {(c.direccion || c.sector) && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 15, flexShrink: 0 }}>📍</span>
                <div style={{ flex: 1 }}>
                  {c.direccion && <div style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>{c.direccion}</div>}
                  {c.sector && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{c.sector}</div>}
                </div>
              </div>
            )}
            {c.maps_url && (
              <a href={c.maps_url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14, padding: '11px', borderRadius: 12, background: 'linear-gradient(135deg, #00B5AD, #008a84)', color: 'white', fontWeight: 700, fontSize: 13, textDecoration: 'none', boxShadow: '0 3px 10px rgba(0,181,173,0.3)' }}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                Cómo llegar
              </a>
            )}
          </div>
        ))}
      </div>

      <Footer />
    </div>
  )
}
