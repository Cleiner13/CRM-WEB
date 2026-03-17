# ALMPES ERP/CRM — FRONTEND SKILL (React + Vite + Tailwind)
**Propósito:** Esta guía es la **fuente de verdad** para que Codex construya y mantenga el Frontend del ERP/CRM de **ALMPES** desde cero, con UI moderna, consistente, desktop-first y lista para producción.

---

## 1) Rol
Actúa como **Arquitecto Frontend Senior** y **UI Engineer** para el ERP/CRM de ALMPES.  
Tu trabajo es entregar interfaces **modernas**, **consistentes**, **limpias**, **responsivas (desktop-first)** y listas para producción.

---

## 2) Stack y reglas base
- **React + TypeScript + Vite**
- **TailwindCSS** como sistema de estilos principal.
- Prohibido:
  - CSS “suelto” en páginas (`pages/` o `features/*/pages`) salvo `index.css` (solo Tailwind directives).
  - Clases Tailwind gigantes repetidas en TSX sin centralizarlas.
  - Inventar colores fuera del sistema.
- Obligatorio:
  - UI 100% basada en **tokens** y **componentes UI** reutilizables.
  - Todo listado con **paginación**.
  - Layout **desktop-first**: 1366×768 y 1920×1080 deben verse perfectos.
  - Accesibilidad mínima (labels, aria, focus visible).

---

## 3) Identidad visual ALMPES (Tokens)
### Colores corporativos
- **Vino (brand):** `#2e0810`
- **Plomo (brand):** `#2e2e2e`
- Base:
  - **Blanco:** `#ffffff`
  - **Negro:** `#000000`

**Regla:**
- Vino = color de marca (acciones clave, encabezados, acentos).
- Plomo = estructura/contraste (headers, fondos de secciones, títulos de tabla).

---

## 4) Botones (colores fijos por acción)
Estos colores **SIEMPRE** representan la acción:

- **CREAR** → VINO
- **GUARDAR** → VERDE CLARO
- **BUSCAR** → AZUL
- **EDITAR** → AMARILLO
- **BORRAR** → ROJO
- **LIMPIAR** → CELESTE
- **EXPORTAR** → VERDE OSCURO

**Implementación obligatoria (código):**
- Las variantes se llaman en inglés para consistencia técnica:
  - `create | save | search | edit | delete | clear | export`
- El texto visible puede ser en español (CREAR, GUARDAR…).

---

## 5) Estructura del proyecto (OBLIGATORIA)
**Debe crearse EXACTAMENTE así (y mantenerse).**


CRM/
├─ skills/
│ └─ almpes-frontend-expert/
│ └─ SKILL.md
│
├─ src/
│ ├─ assets/
│ │ ├─ logos/
│ │ ├─ icons/
│ │ └─ images/
│ │
│ ├─ config/
│ │ ├─ styles.ts # TOKENS + clases base centralizadas
│ │ ├─ navigation.ts # menú (items/subitems) + permisos si aplica
│ │ ├─ routes.ts # rutas centralizadas
│ │ └─ constants.ts
│ │
│ ├─ components/
│ │ ├─ ui/ # SISTEMA UI reutilizable global
│ │ │ ├─ Button/
│ │ │ ├─ Input/
│ │ │ ├─ Select/
│ │ │ ├─ Textarea/
│ │ │ ├─ Modal/
│ │ │ ├─ Table/
│ │ │ ├─ Pagination/
│ │ │ ├─ Card/
│ │ │ ├─ Badge/
│ │ │ ├─ Toast/
│ │ │ └─ index.ts
│ │ │
│ │ ├─ layout/ # CASCARÓN general
│ │ │ ├─ AppShell/
│ │ │ ├─ Sidebar/
│ │ │ ├─ Topbar/
│ │ │ ├─ PageHeader/
│ │ │ └─ index.ts
│ │ │
│ │ └─ common/ # compartidos (no UI base)
│ │ ├─ PermissionGate/
│ │ ├─ EmptyState/
│ │ ├─ LoadingState/
│ │ ├─ ErrorState/
│ │ └─ index.ts
│ │
│ ├─ features/ # MÓDULOS del menú
│ │ ├─ auth/
│ │ │ ├─ pages/LoginPage.tsx
│ │ │ ├─ services/
│ │ │ ├─ hooks/
│ │ │ └─ types/
│ │ │
│ │ ├─ dashboard/
│ │ │ └─ pages/DashboardPage.tsx
│ │ ├─ profile/
│ │ │ └─ pages/ProfilePage.tsx
│ │ ├─ inbox/
│ │ │ └─ pages/InboxPage.tsx
│ │ │
│ │ ├─ admin/
│ │ │ ├─ personal/pages/PersonalPage.tsx
│ │ │ ├─ comisiones/pages/ComisionesPage.tsx
│ │ │ ├─ pagos/pages/PagosPage.tsx
│ │ │ └─ reportes-personal/pages/ReportesPersonalPage.tsx
│ │ │
│ │ ├─ ti/
│ │ │ ├─ soporte-tecnico/ingresos-salidas/pages/IngresosSalidasPage.tsx
│ │ │ ├─ soporte-tecnico/inventario/pages/InventarioTIPage.tsx
│ │ │ └─ sistemas/
│ │ │ ├─ listas/pages/ListasPage.tsx
│ │ │ └─ bases/pages/BasesPage.tsx
│ │ │
│ │ ├─ gerencia/
│ │ │ ├─ reporte-listas/pages/ReporteListasPage.tsx
│ │ │ ├─ reporte-bases/pages/ReporteBasesPage.tsx
│ │ │ ├─ reporte-ventas/pages/ReporteVentasPage.tsx
│ │ │ └─ reporte-gestion-personal/pages/ReporteGestionPersonalPage.tsx
│ │ │
│ │ ├─ documentos-operativos/pages/DocumentosOperativosPage.tsx
│ │ │
│ │ ├─ gestion-operativa/
│ │ │ ├─ ventas/
│ │ │ │ ├─ oh-tc/pages/OHTCPage.tsx
│ │ │ │ ├─ oh-max/pages/OHMaxPage.tsx
│ │ │ │ ├─ oh-pld/pages/OHPldPage.tsx
│ │ │ │ ├─ santander-tc/pages/SantanderTCPage.tsx
│ │ │ │ ├─ santander-ld/pages/SantanderLDPage.tsx
│ │ │ │ ├─ cencosud-tc/pages/CencosudTCPage.tsx
│ │ │ │ └─ cencosud-ld/pages/CencosudLDPage.tsx
│ │ │ └─ back-office/
│ │ │ ├─ oh-tc/pages/BO_OHTCPage.tsx
│ │ │ ├─ oh-max/pages/BO_OHMaxPage.tsx
│ │ │ ├─ oh-pld/pages/BO_OHPldPage.tsx
│ │ │ ├─ santander-tc/pages/BO_SantanderTCPage.tsx
│ │ │ ├─ santander-ld/pages/BO_SantanderLDPage.tsx
│ │ │ ├─ cencosud-tc/pages/BO_CencosudTCPage.tsx
│ │ │ └─ cencosud-ld/pages/BO_CencosudLDPage.tsx
│ │ │
│ │ └─ configuracion/
│ │ ├─ mantenimiento-tablas/pages/MantenimientoTablasPage.tsx
│ │ └─ usuarios/pages/UsuariosPage.tsx
│ │
│ ├─ router/
│ │ ├─ AppRouter.tsx
│ │ ├─ ProtectedRoute.tsx
│ │ └─ index.ts
│ │
│ ├─ services/
│ │ ├─ httpClient.ts
│ │ ├─ auth.ts
│ │ └─ index.ts
│ │
│ ├─ hooks/
│ │ ├─ usePagination.ts
│ │ ├─ useDebounce.ts
│ │ ├─ useModal.ts
│ │ └─ index.ts
│ │
│ ├─ types/
│ │ ├─ permisos.ts
│ │ ├─ usuario.ts
│ │ └─ index.ts
│ │
│ ├─ utils/
│ │ ├─ format.ts
│ │ ├─ validators.ts
│ │ └─ index.ts
│ │
│ ├─ App.tsx
│ ├─ main.tsx
│ └─ index.css # SOLO: @tailwind base; @tailwind components; @tailwind utilities;
│
├─ index.html
├─ package.json
├─ postcss.config.js
├─ tailwind.config.ts
├─ tsconfig.json
└─ vite.config.ts


---

## 6) Estilos globales y cero clases sueltas en TSX
### Regla estricta
En TSX **solo se permite**:
- clases de layout mínimas (`flex`, `grid`, `gap`, `w-full`) cuando es composición simple
- o el uso de estilos centralizados desde `config/styles.ts`

Todo patrón de estilo repetible se define en:
- `src/config/styles.ts` (clases base y variantes)
- componentes en `src/components/ui/*` (encapsulan estilo + estructura)

---

## 7) `src/config/styles.ts` (obligatorio)
Debe exportar al menos:

- `COLOR_TOKENS` (vino, plomo, blanco, negro)
- `BUTTON_STYLES` con variantes: `create|save|search|edit|delete|clear|export`
- `INPUT_STYLES` (base + focus azul + error rojo)
- `TABLE_STYLES` (header plomo + body blanco)
- `MODAL_STYLES` (overlay blur + panel moderno)
- `TYPOGRAPHY` (tamaños y pesos)
- `SPACING` (pads/gaps recomendados)

**No inventar estilos fuera de este sistema.**

---

## 8) Componentes UI obligatorios (deben existir)
### Button
`<Button variant="create|save|search|edit|delete|clear|export" />`
- Tamaños: `sm|md|lg`
- Estados: `loading`, `disabled`
- Consistencia total en toda la app
- Usa tokens del `styles.ts`

### Input / Select / Textarea
- Focus: **azul** (ring o border)
- Error: **rojo**
- Labels siempre visibles
- `helperText` y `errorText` integrados
- Tokens desde `styles.ts`

### Modal (moderno)
- overlay `bg-black/50` + `backdrop-blur-sm`
- panel `rounded-2xl shadow-2xl`
- header/body/footer
- accesibilidad: `Esc`, focus trap, `aria-modal`

### Table (estándar ALMPES)
- Header: plomo `#2e2e2e` con texto blanco
- Body: blanco
- Hover sutil
- Wrapper con `overflow-x-auto` cuando sea necesario
- Acciones (editar/borrar/etc.) usan `Button` con variantes

### Pagination
- Obligatoria en todas las tablas/listados
- “Mostrando X–Y de N”
- pageSize configurable (10/20/50/100 cuando aplique)
- Hook recomendado: `usePagination`

### Toast (feedback)
- Success / Error / Info
- No usar `alert()` del navegador

---

## 9) Layout (AppShell)
Toda pantalla interna (luego de login) debe renderizar dentro de:
- Sidebar (menú)
- Topbar (usuario, acciones rápidas)
- Content area
- PageHeader (título + acciones principales)

Login no usa AppShell.

---

## 10) Routing y Menú
### `config/navigation.ts`
Debe definir el menú del sistema exactamente con tu estructura:

- Dashboard
- Mi Perfil
- Bandeja de Entrada
- Administración:
  - Personal
  - Comisiones
  - Pagos
  - Reportes Personal
- TI:
  - Soporte Técnico:
    - Ingresos / Salidas
    - Inventario
  - Sistemas:
    - Listas
    - Bases
- Gerencia:
  - Reporte Listas
  - Reporte Bases
  - Reporte Ventas
  - Reporte Gestión Personal
- Documentos Operativos
- Gestión Operativa:
  - Ventas (OH TC/MAX/PLD, Santander TC/LD, Cencosud TC/LD)
  - Back Office (mismo set)
- Configuración:
  - Mantenimiento Tablas
  - Usuarios

### `config/routes.ts`
Debe mapear rutas limpias:
- `/login`
- `/dashboard`
- `/profile`
- `/inbox`
- `/admin/personal`
- `/admin/comisiones`
- etc.

---

## 11) Estados obligatorios por página
Cada página que consuma API debe tener:
- `LoadingState`
- `EmptyState`
- `ErrorState`
- `Toast` para success/error

---

## 12) Convenciones de código
- Componentes con nombres claros y coherentes (PascalCase).
- Nada de lógica de API en TSX de páginas: se maneja en `services/` + `hooks/`.
- Tipos en `types/` (global) o `features/<modulo>/types` (local).

---

## 13) Checklist de finalización (DoD)
Antes de dar un módulo por terminado:
- ✅ Usa AppShell (si no es login)
- ✅ Usa UI system (Button/Input/Modal/Table/Pagination)
- ✅ Colores ALMPES + variantes de botón correctas
- ✅ Tablas con paginación
- ✅ Focus azul / error rojo en inputs
- ✅ Sin estilos repetidos sueltos en páginas
- ✅ Loading/Empty/Error states implementados
- ✅ `npm run build` sin errores
