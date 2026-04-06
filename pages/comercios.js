import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
 
export default function ComerciosPage() {
  const [comercios, setComercios] = useState([])
  const [loading, setLoading] = useState(true)
 
  useEffect(() => {
    async function fetchComercios() {
      const { data } = await supabase
        .from('comercios')
        .select('nombre, categoria, descuento, direccion, sector')
        .eq('estado', 'activo')
        .order('nombre', { ascending: true })
      setComercios(data || [])
      setLoading(false)
    }
    fetchComercios()
  }, [])
 
  return (
    <div style={{ minHeight: '100vh', background: '#00B5AD', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 700 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Comercios colaboradores</div>
        </div>
      </div>
 
      {/* Banner */}
      <div style={{ background: 'rgba(255,255,255,0.15)', margin: '0 1rem 20px', borderRadius: 16, padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>
          🎉 Presenta tu tarjeta Joven+ en estos locales y accede a descuentos exclusivos
        </div>
      </div>
 
      {/* Contenido */}
      <div style={{ flex: 1, padding: '0 1rem 2rem' }}>
        {loading && (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: 14 }}>Cargando comercios...</div>
        )}
 
        {!loading && comercios.length === 0 && (
          <div style={{ textAlign: 'center', color: 'white', padding: '3rem', fontSize: 14 }}>No hay comercios registrados aún.</div>
        )}
 
        {comercios.map((c, idx) => (
          <div key={idx} style={{ background: 'white', borderRadius: 16, padding: '18px 20px', marginBottom: 14, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Avatar */}
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: idx % 2 === 0 ? '#00B5AD' : '#D63D8F', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, flexShrink: 0 }}>
                {(c.nombre[0] || '').toUpperCase()}
              </div>
 
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: '#222' }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.categoria || 'Local colaborador'}</div>
              </div>
 
              {/* Descuento destacado */}
              <div style={{ background: 'linear-gradient(135deg, #D63D8F, #a0005a)', borderRadius: 14, padding: '10px 16px', textAlign: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(214,61,143,0.3)' }}>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'white', lineHeight: 1 }}>{c.descuento}%</div>
                <div style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 }}>DESCUENTO</div>
              </div>
            </div>
 
            {/* Ubicación */}
            {(c.direccion || c.sector) && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>📍</span>
                <div>
                  {c.direccion && <div style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>{c.direccion}</div>}
                  {c.sector && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{c.sector}</div>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
