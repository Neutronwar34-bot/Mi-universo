import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Clave pública (anon/publishable) únicamente: este proyecto es de lectura y
// escritura pública sin autenticación (ver supabase/schema.sql). La secret
// key nunca debe usarse desde el frontend.
export const supabase = (url && key) ? createClient(url, key) : null;
