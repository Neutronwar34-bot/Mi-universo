-- Ejecutar en el SQL Editor de Supabase (Project > SQL Editor).
-- Tabla de mundos/planetas para "Cartas para otro planeta".

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subtitle text,
  letter text not null,
  character text not null default 'star',
  color_a text not null,
  color_b text not null,
  accent text not null,
  size float not null default 1.15,
  position_index int not null default 0,
  created_at timestamptz not null default now(),
  is_default boolean not null default false
);

alter table public.worlds enable row level security;

-- Proyecto personal / sin autenticación por ahora: lectura y escritura públicas.
-- OJO: revisar esto si el proyecto se vuelve multiusuario (agregar user_id + políticas por dueño).
create policy "worlds_public_select" on public.worlds
  for select using (true);

create policy "worlds_public_insert" on public.worlds
  for insert with check (true);

create policy "worlds_public_update" on public.worlds
  for update using (true);

create policy "worlds_public_delete" on public.worlds
  for delete using (true);

-- Semilla con los 5 mundos por defecto del Principito (is_default = true).
-- Se salta si ya existe algún mundo por defecto (para poder re-ejecutar el script sin duplicar).
insert into public.worlds (name, subtitle, letter, character, color_a, color_b, accent, size, position_index, is_default)
select * from (values
  ('El Jardín de la Rosa Única', 'Para quien aprendí a regar cada día',
$$Hay una rosa que crece distinta a todas las demás,
no porque sea más bella,
sino porque le dediqué tiempo.

Eso hice contigo: elegí regarte,
elegí escucharte cuando te quejabas del viento,
elegí ponerte un fanal las noches frías.

Lo que se cuida se vuelve único.
Y tú, para mí, ya eras irremplazable
antes de que aprendiera a decírtelo bien.$$,
   'rose', '#f3c6d3', '#e08a9c', '#c94f6d', 1.15, 0, true),

  ('El Planeta del Farolero', 'Sobre la fidelidad a las pequeñas tareas',
$$En este mundo hay alguien que enciende y apaga un farol,
una y otra vez, sin preguntarse por qué.
Cumple su consigna. Eso es lo que lo hace hermoso.

Quiero que sepas que las cosas pequeñas que hiciste por mí
—llamar quince minutos antes de dormir,
guardar el último trozo de algo que me gustaba—
nunca me parecieron pequeñas.

Eran tu manera de encender el farol
en un planeta que giraba sólo para los dos.$$,
   'lamplighter', '#f6d98b', '#e0a13f', '#c9752f', 1.0, 1, true),

  ('La Madriguera del Zorro', 'Lo esencial es invisible a los ojos',
$$Domesticar significa crear lazos.
El zorro me enseñó eso, y yo te lo aprendí a ti:
que el tiempo que perdemos por alguien
es justamente el que lo vuelve importante.

Ahora, cuando el trigo se mueva con el viento,
quiero que te acuerdes de mí,
del color de mis palabras,
de las tardes que no servían para nada
y por eso eran perfectas.

No busques con los ojos. Busca con lo que sientes.
Ahí voy a seguir estando.$$,
   'fox', '#f0b27a', '#c97a3d', '#7a4a22', 1.2, 2, true),

  ('El Reino sin Súbditos', 'Sobre el poder de ser justo con uno mismo',
$$Un rey que no tiene a quién gobernar
igual sigue dando órdenes razonables:
le pide al sol que se ponga cuando ya se estaba poniendo.

Aprendí, viéndote, que el verdadero poder
no es imponerse a los demás,
sino ser justo contigo mismo primero.

Ojalá gobiernes tu propia vida así:
con la calma de quien sólo pide
lo que de todas formas ya iba a suceder,
y con la valentía de cambiar
lo que no.$$,
   'king', '#cbb6e4', '#8a6bbf', '#5c3f96', 1.1, 3, true),

  ('El Observatorio de las Estrellas', 'Cada estrella que ves ya fue contada por alguien que te quiso',
$$Si alguna vez, de noche, levantas la vista
y ves un cielo lleno de estrellas,
quiero que sepas que una de ellas soy yo, riendo.

Para ti será distinto mirar las estrellas
que para los demás,
porque en una de ellas —en una cualquiera, en todas—
voy a estar viviendo,
voy a estar riendo,

y entonces será como si todas las estrellas rieran
cuando mires el cielo por la noche.
Tú tendrás estrellas que ríen.$$,
   'star', '#9fd8df', '#4f8ea6', '#2e6577', 1.3, 4, true)
) as seed(name, subtitle, letter, character, color_a, color_b, accent, size, position_index, is_default)
where not exists (select 1 from public.worlds where is_default = true);
