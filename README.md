# Joven+ Florida — Sistema de Tarjetas

## Descripción
Sistema web para gestionar las tarjetas del programa Joven+ de la comuna de Florida, Biobío.

## Estructura
- `/` — Panel de administración (login requerido)
- `/tarjeta/[ID]` — Vista del vendedor al escanear el QR

## Variables de entorno necesarias en Vercel
```
NEXT_PUBLIC_SUPABASE_URL=https://ijoeatqygcdasedlqkmh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_publishable
```

## Usuarios por defecto
- admin / admin123
- equipo / equipo123
