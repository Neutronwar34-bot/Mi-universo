import { supabase } from './supabaseClient.js';

// Usado como red de seguridad si Supabase no está configurado o falla la
// conexión (ej. sin internet) — así la escena nunca queda vacía.
export const FALLBACK_WORLDS = [
  {
    id: 'rosa',
    name: 'El Jardín de la Rosa Única',
    subtitle: 'Para quien aprendí a regar cada día',
    letter:
`Hay una rosa que crece distinta a todas las demás,
no porque sea más bella,
sino porque le dediqué tiempo.

Eso hice contigo: elegí regarte,
elegí escucharte cuando te quejabas del viento,
elegí ponerte un fanal las noches frías.

Lo que se cuida se vuelve único.
Y tú, para mí, ya eras irremplazable
antes de que aprendiera a decírtelo bien.`,
    character: 'rose', colorA: '#f3c6d3', colorB: '#e08a9c', accent: '#c94f6d', size: 1.15, custom: false
  },
  {
    id: 'farolero',
    name: 'El Planeta del Farolero',
    subtitle: 'Sobre la fidelidad a las pequeñas tareas',
    letter:
`En este mundo hay alguien que enciende y apaga un farol,
una y otra vez, sin preguntarse por qué.
Cumple su consigna. Eso es lo que lo hace hermoso.

Quiero que sepas que las cosas pequeñas que hiciste por mí
—llamar quince minutos antes de dormir,
guardar el último trozo de algo que me gustaba—
nunca me parecieron pequeñas.

Eran tu manera de encender el farol
en un planeta que giraba sólo para los dos.`,
    character: 'lamplighter', colorA: '#f6d98b', colorB: '#e0a13f', accent: '#c9752f', size: 1.0, custom: false
  },
  {
    id: 'zorro',
    name: 'La Madriguera del Zorro',
    subtitle: 'Lo esencial es invisible a los ojos',
    letter:
`Domesticar significa crear lazos.
El zorro me enseñó eso, y yo te lo aprendí a ti:
que el tiempo que perdemos por alguien
es justamente el que lo vuelve importante.

Ahora, cuando el trigo se mueva con el viento,
quiero que te acuerdes de mí,
del color de mis palabras,
de las tardes que no servían para nada
y por eso eran perfectas.

No busques con los ojos. Busca con lo que sientes.
Ahí voy a seguir estando.`,
    character: 'fox', colorA: '#f0b27a', colorB: '#c97a3d', accent: '#7a4a22', size: 1.2, custom: false
  },
  {
    id: 'rey',
    name: 'El Reino sin Súbditos',
    subtitle: 'Sobre el poder de ser justo con uno mismo',
    letter:
`Un rey que no tiene a quién gobernar
igual sigue dando órdenes razonables:
le pide al sol que se ponga cuando ya se estaba poniendo.

Aprendí, viéndote, que el verdadero poder
no es imponerse a los demás,
sino ser justo contigo mismo primero.

Ojalá gobiernes tu propia vida así:
con la calma de quien sólo pide
lo que de todas formas ya iba a suceder,
y con la valentía de cambiar
lo que no.`,
    character: 'king', colorA: '#cbb6e4', colorB: '#8a6bbf', accent: '#5c3f96', size: 1.1, custom: false
  },
  {
    id: 'astronomo',
    name: 'El Observatorio de las Estrellas',
    subtitle: 'Cada estrella que ves ya fue contada por alguien que te quiso',
    letter:
`Si alguna vez, de noche, levantas la vista
y ves un cielo lleno de estrellas,
quiero que sepas que una de ellas soy yo, riendo.

Para ti será distinto mirar las estrellas
que para los demás,
porque en una de ellas —en una cualquiera, en todas—
voy a estar viviendo,
voy a estar riendo,

y entonces será como si todas las estrellas rieran
cuando mires el cielo por la noche.
Tú tendrás estrellas que ríen.`,
    character: 'star', colorA: '#9fd8df', colorB: '#4f8ea6', accent: '#2e6577', size: 1.3, custom: false
  }
];

function rowToWorld(row) {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle || '',
    letter: row.letter,
    character: row.character,
    colorA: row.color_a,
    colorB: row.color_b,
    accent: row.accent,
    size: row.size,
    custom: !row.is_default
  };
}

function worldToRow(world) {
  return {
    name: world.name,
    subtitle: world.subtitle,
    letter: world.letter,
    character: world.character,
    color_a: world.colorA,
    color_b: world.colorB,
    accent: world.accent,
    size: world.size
  };
}

export async function fetchWorlds() {
  if (!supabase) {
    console.warn('[worldsStore] Supabase no configurado, usando mundos por defecto locales.');
    return FALLBACK_WORLDS.map(w => ({ ...w }));
  }
  const { data, error } = await supabase
    .from('worlds')
    .select('*')
    .order('is_default', { ascending: false })
    .order('position_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[worldsStore] Error cargando mundos de Supabase, usando fallback local.', error);
    return FALLBACK_WORLDS.map(w => ({ ...w }));
  }
  if (!data || data.length === 0) {
    return FALLBACK_WORLDS.map(w => ({ ...w }));
  }
  return data.map(rowToWorld);
}

export async function createWorld(world) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase
    .from('worlds')
    .insert({ ...worldToRow(world), is_default: false })
    .select()
    .single();
  if (error) throw error;
  return rowToWorld(data);
}

export async function updateWorld(id, world) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { data, error } = await supabase
    .from('worlds')
    .update(worldToRow(world))
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return rowToWorld(data);
}

export async function deleteWorld(id) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const { error } = await supabase.from('worlds').delete().eq('id', id);
  if (error) throw error;
}
