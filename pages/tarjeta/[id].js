import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabase'

function initials(name) {
  const parts = (name || '').trim().split(' ')
  return ((parts[0] || '')[0] || '').toUpperCase() + ((parts[1] || '')[0] || '').toUpperCase()
}

function decodeId(token) {
  try {
    return atob(token.split('').reverse().join(''))
  } catch {
    return null
  }
}

export default function TarjetaPage() {
  const router = useRouter()
  const { id: token } = router.query
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!token) return
    const realId = decodeId(token)
    if (!realId) { setNotFound(true); setLoading(false); return }

    async function fetch() {
      const { data } = await supabase.from('tarjetas').select('id, nombre, rut, estado').eq('id', realId).single()
      if (data) setCard(data)
      else setNotFound(true)
      setLoading(false)
    }
    fetch()
  }, [token])

  const estadoMap = {
    habilitada: { bg: '#E0F7F6', color: '#007A75', dot: '#00B5AD', label: 'Habilitada' },
    inhabilitada: { bg: '#F2F9D6', color: '#6B8500', dot: '#AACC00', label: 'Inhabilitada' },
    bloqueada: { bg: '#FCE8F3', color: '#A0005A', dot: '#D63D8F', label: 'Bloqueada' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#00B5AD', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 1rem', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M3 4 L12 20 L21 4" stroke="#00B5AD" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="20" r="3" fill="#D63D8F"/>
          </svg>
        </div>
        <div>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 500 }}>Joven+ Florida</div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>Verificación de tarjeta</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ background: 'white', borderRadius: 16, padding: '1.5rem', width: '100%', maxWidth: 340, textAlign: 'center' }}>
          {loading && <div style={{ color: '#888', fontSize: 14, padding: '2rem 0' }}>Verificando tarjeta...</div>}

          {notFound && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FCE8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>?</div>
              <div style={{ fontSize: 16, fontWeight: 500, color: '#222' }}>Tarjeta no encontrada</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Esta tarjeta no está registrada en el sistema.</div>
            </>
          )}

          {card && (() => {
            const s = estadoMap[card.estado] || estadoMap.inhabilitada
            return (
              <>
                <div style={{ fontSize: 10, color: '#aaa', letterSpacing: 1, marginBottom: 10, fontFamily: 'monospace' }}>{card.id}</div>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#00B5AD', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 500, margin: '0 auto 12px' }}>
                  {initials(card.nombre)}
                </div>
                <div style={{ fontSize: 20, fontWeight: 500, color: '#222' }}>{card.nombre}</div>
                <div style={{ fontSize: 14, color: '#888', margin: '4px 0 16px' }}>{card.rut}</div>
                <div style={{ background: s.bg, borderRadius: 20, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.dot, flexShrink: 0 }}></div>
                  <span style={{ color: s.color, fontWeight: 500, fontSize: 15 }}>{s.label}</span>
                </div>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
