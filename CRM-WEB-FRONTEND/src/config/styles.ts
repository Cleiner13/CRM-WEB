export const COLOR_TOKENS = {
  brandWine: "#2e0810",
  brandGraphite: "#2e2e2e",
  white: "#ffffff",
  black: "#000000",
  successLight: "#22c55e",
  infoBlue: "#2563eb",
  warningYellow: "#f59e0b",
  dangerRed: "#dc2626",
  clearSky: "#0ea5e9",
  exportGreen: "#166534",
  border: "#d1d5db",
  softBg: "#f8fafc",
  mutedText: "#64748b",
} as const;

export const TYPOGRAPHY = {
  fontFamily: "font-sans",
  pageTitle: "text-2xl font-semibold tracking-tight",
  sectionTitle: "text-lg font-semibold",
  label: "text-sm font-medium",
  body: "text-sm font-normal",
  caption: "text-xs font-medium",
} as const;

export const SPACING = {
  page: "p-6",
  panel: "p-4",
  compactPanel: "p-3",
  sectionGap: "gap-6",
  stackGap: "gap-4",
  fieldGap: "gap-2",
} as const;

export const LAYOUT_STYLES = {
  shell: "min-h-screen bg-[#ced4da] text-slate-900",
  shellBackdrop: "hidden",
  shellGrid: "grid min-h-screen grid-cols-1 xl:grid-cols-[auto_1fr]",
  sidebarSlot:
    "fixed inset-y-0 left-0 z-40 w-[280px] transition-transform duration-200 xl:sticky xl:top-0 xl:z-auto xl:self-start",
  sidebarSlotOpen: "translate-x-0",
  sidebarSlotClosed: "-translate-x-full xl:w-[72px] xl:translate-x-0",
  sidebarOverlay: "fixed inset-0 z-30 bg-black/30 xl:hidden",
  sidebar: "flex h-screen w-[280px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white",
  sidebarCompact: "flex h-screen w-[72px] shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white",
  sidebarHeader: "border-slate-200 px-4 py-4",
  sidebarCompactHeader: "px-3 py-4",
  sidebarBrandWrap: "flex items-center gap-3",
  sidebarBrandLogo: "h-10 w-10 rounded-xl border border-slate-200 bg-white object-contain p-1",
  sidebarBrandTitle: "text-sm font-semibold leading-tight text-slate-900",
  sidebarBrandSubtitle: "text-xs text-slate-500",
  sidebarBody:
    "flex-1 overflow-y-auto px-3 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  sidebarCompactBody:
    "flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
  sidebarGroup: "space-y-1",
  sidebarCompactList: "space-y-2",
  sidebarCompactItem:
    "grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900",
  sidebarCompactItemActive: "bg-[#2e0810] text-white hover:bg-[#2e0810] hover:text-white",
  sidebarCompactDivider: "my-2 h-px bg-slate-200",
  sidebarItem: "flex items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900",
  sidebarItemActive: "bg-[#2e0810] text-white hover:bg-[#2e0810]/50 hover:text-slate-900",
  sidebarSectionLabel: "px-3 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400",
  sidebarGroupTrigger:
    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900",
  sidebarGroupTriggerActive: "bg-[#2e0810] text-white",
  sidebarGroupChildren: "space-y-1",
  sidebarGroupChildrenPanel: "ml-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2",
  sidebarGroupChildrenNested: "ml-3 border-l border-slate-200 pl-2",
  sidebarItemNested: "text-[13px] font-medium",
  sidebarItemNestedActive: "bg-[#2e0810] text-[#2e0810] shadow-sm ring-1 ring-[#2e0810]/10",
  sidebarLeafRow: "flex items-center gap-2",
  sidebarLeafDot: "h-1.5 w-1.5 rounded-full bg-slate-300",
  sidebarLeafDotActive: "bg-[#2e0810]",
  sidebarChevron: "text-slate-400 transition-transform duration-200",
  sidebarChevronOpen: "rotate-90 text-[#2e0810]",
  sidebarFooter: "border-t border-slate-200 px-4 py-3",
  sidebarFooterCard: "rounded-xl bg-slate-100 p-3 text-slate-700",
  sidebarCompactFooter: "border-t border-slate-200 px-2 py-3",
  contentArea: "flex min-h-screen min-w-0 flex-col",
  topbar: "sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:px-6",
  topbarLeft: "flex min-w-0 flex-1 items-center gap-2 lg:gap-3",
  topbarMenuBtn:
    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
  topbarMeta: "text-sm text-slate-500",
  topbarTitle: "text-base font-semibold text-slate-900",
  topbarSearchWrap: "w-full lg:w-[360px]",
  topbarSearchBox: "relative",
  topbarSearchIcon: "pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400",
  topbarSearchInput:
    "h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:border-blue-500",
  topbarSearchShortcut:
    "pointer-events-none absolute inset-y-0 right-2 hidden items-center rounded-md border border-slate-200 bg-slate-50 px-2 text-[11px] font-semibold text-slate-500 lg:flex",
  topbarActions: "flex flex-wrap items-center gap-2",
  topbarIconBtn: "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900",
  topbarUser: "inline-flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800",
  topbarUserDot: "grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-xs text-slate-700",
  topbarUserAvatar: "h-11 w-11 rounded-full object-cover ring-2 ring-slate-100",
  topbarUserMeta: "hidden sm:block text-left leading-tight",
  topbarUserGreeting: "text-xs text-slate-500",
  topbarUserName: "text-sm font-semibold text-slate-900",
  topbarUserRole: "text-xs text-slate-500",
  topbarUserChevron: "text-slate-400",
  main: "flex-1 min-w-0 p-4 lg:p-6",
  pageHeader: "mb-6 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm lg:px-5",
  pageHeaderRow: "flex flex-wrap items-center justify-between gap-4",
  pageHeaderTitleWrap: "space-y-1",
  pageHeaderTopMeta: "flex items-center gap-2",
  pageHeaderPill:
    "inline-flex items-center rounded-full border border-[#2e0810]/15 bg-[#2e0810]/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#2e0810]",
  pageHeaderDot: "h-1.5 w-1.5 rounded-full bg-[#2e0810]",
  pageHeaderTitle: "text-xl font-semibold tracking-tight text-slate-900 lg:text-2xl",
  pageHeaderSubtitle: "text-sm text-slate-500",
  pageHeaderActions: "flex flex-wrap items-center gap-2",
  pageHeaderMetaGrid: "hidden",
  pageHeaderMetaCard: "rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5",
  pageHeaderMetaLabel: "text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500",
  pageHeaderMetaValue: "mt-1 text-sm font-semibold text-slate-900",
} as const;

export const BUTTON_STYLES = {
  base: "inline-flex items-center justify-center rounded-xl border border-transparent font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60",
  sizes: {
    sm: "h-9 px-3 text-sm gap-2",
    md: "h-10 px-4 text-sm gap-2",
    lg: "h-12 px-5 text-base gap-2",
  },
  fullWidth: "w-full",
  spinner: "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent",
  variants: {
    create: "bg-[#660708] text-white hover:bg-[#451019] focus-visible:ring-[#660708]",
    save: "bg-[#22c55e] text-white hover:bg-[#16a34a] focus-visible:ring-[#22c55e]",
    search: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] focus-visible:ring-[#2563eb]",
    edit: "bg-[#f59e0b] text-slate-900 hover:bg-[#d97706] focus-visible:ring-[#f59e0b]",
    delete: "bg-[#dc2626] text-white hover:bg-[#b91c1c] focus-visible:ring-[#dc2626]",
    clear: "bg-[#0ea5e9] text-white hover:bg-[#0284c7] focus-visible:ring-[#0ea5e9]",
    export: "bg-[#166534] text-white hover:bg-[#14532d] focus-visible:ring-[#166534]",
    paginacion: "bg-[#adb5bd] text-white hover:bg-[#5a6270] focus-visible:ring-[#adb5bd]",
  },
  ghost: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-500",
} as const;

export const INPUT_STYLES = {
  fieldWrapper: "w-full space-y-2",
  label: "block text-sm font-medium text-slate-800",
  baseField: "w-full rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2",
  focus: "border-slate-300 focus-visible:border-blue-500 focus-visible:ring-blue-500/30",
  error: "border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/25",
  helperText: "text-xs text-slate-500",
  errorText: "text-xs font-medium text-red-600",
  selectRightIconSpace: "pr-10",
  textarea: "min-h-[120px] resize-y",
} as const;

export const TABLE_STYLES = {
  wrapper: "overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm",
  table: "min-w-full border-collapse",
  headerRow: "bg-[#2e2e2e]",
  headerCell: "px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-white",
  bodyRow: "border-t border-slate-100 bg-white transition hover:bg-slate-50",
  bodyCell: "px-4 py-3 text-center text-slate-700 align-top",
  emptyCell: "px-4 py-10 text-center text-sm text-slate-500",
} as const;

export const MODAL_STYLES = {
  overlay: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm",
  panel: "w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5",
  header: "flex items-center justify-between border-b border-slate-200 px-5 py-4",
  title: "text-lg font-semibold text-slate-900",
  body: "px-5 py-4",
  footer: "flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-4",
  closeButton: BUTTON_STYLES.ghost,
} as const;

export const CARD_STYLES = {
  base: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  header: "flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3",
  body: "px-4 py-4",
  footer: "border-t border-slate-100 px-4 py-3",
  title: "text-base font-semibold text-slate-900",
  subtitle: "text-sm text-slate-500",
} as const;

export const BADGE_STYLES = {
  base: "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
  variants: {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
    info: "bg-sky-100 text-sky-700",
    brand: "bg-[#2e0810]/10 text-[#2e0810]",
  },
} as const;

export const TOAST_STYLES = {
  base: "flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 shadow-lg",
  messageWrap: "space-y-1",
  title: "text-sm font-semibold",
  message: "text-sm",
  dismiss: BUTTON_STYLES.ghost,
  variants: {
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    error: "border-rose-200 bg-rose-50 text-rose-900",
    info: "border-sky-200 bg-sky-50 text-sky-900",
  },
} as const;

export const PAGINATION_STYLES = {
  container: "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
  summary: "text-sm text-slate-600",
  controls: "flex flex-wrap items-center gap-2",
  pageText: "text-sm font-medium text-slate-700",
} as const;

export const COMMON_STATE_STYLES = {
  card: "rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm",
  title: "text-base font-semibold text-slate-900",
  description: "mt-1 text-sm text-slate-500",
} as const;

export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export const AUTH_STYLES = {
  page: "min-h-screen bg-slate-100",
  shell: "grid min-h-screen w-full overflow-hidden bg-white lg:grid-cols-[1.25fr_0.95fr]",
  visual: "relative hidden lg:block min-h-screen",
  visualImage: "absolute inset-0 h-full w-full object-cover",
  visualOverlay: "absolute inset-0 bg-[#2e0810]/65",
  visualGlow: "absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.16),transparent_42%),radial-gradient(circle_at_85%_70%,rgba(37,99,235,0.15),transparent_44%)]",
  visualContent: "relative z-10 flex h-full items-end p-10 text-white",
  visualTextWrap: "max-w-sm space-y-3",
  visualTitle: "text-3xl font-semibold leading-tight",
  visualText: "text-sm leading-6 text-white/85",
  diagonalLine: "pointer-events-none absolute right-[-20px] top-[-10%] hidden h-[120%] w-px rotate-[32deg] bg-white/70 shadow-[0_0_0_1px_rgba(46,8,16,0.35)] lg:block",
  formPanel: "relative flex min-h-screen items-center justify-center p-5 sm:p-8 lg:p-10",
  formPanelBg: "absolute inset-0 bg-gradient-to-br from-white to-slate-50",
  formStack: "relative z-10 w-full max-w-md space-y-4",
  formBrand: "space-y-3 text-center",
  formBrandLogoWrap: "inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2 shadow-sm",
  formBrandLogo: "h-14 w-auto object-contain",
  formBrandTitle: "text-2xl font-semibold text-slate-900",
  formBrandText: "text-sm text-slate-500",
  formCard: "rounded-2xl border border-slate-200 bg-white shadow-sm",
  formHeader: "space-y-1",
  formTitle: "text-xl font-semibold text-slate-900",
  formSubtitle: "text-sm text-slate-500",
  form: "space-y-4",
  formOptions: "flex items-center justify-between gap-3",
  rememberWrap: "flex items-center gap-2 text-sm text-slate-600",
  checkbox: "h-4 w-4 rounded border-slate-300 text-[#2e0810] focus:ring-[#2e0810]/30",
  link: "text-sm font-semibold text-[#2e0810] hover:underline",
  actions: "flex justify-end",
  footerHint: "text-center text-xs text-slate-500",
} as const;

export const FEATURE_SCAFFOLD_STYLES = {
  page: "w-full space-y-5",
  toolbar: "flex flex-wrap items-center justify-center gap-2",
  heroGrid: "grid gap-4 xl:grid-cols-[1.35fr_1fr]",
  heroPanel: "rounded-2xl border border-white/60 bg-white/90 p-4 shadow-sm backdrop-blur lg:p-5",
  heroTitle: "text-base font-semibold text-slate-900",
  heroText: "mt-1 text-sm text-slate-500",
  heroActions: "mt-4 flex flex-wrap items-center gap-2",
  chipsRow: "mt-4 flex flex-wrap items-center gap-2",
  chip:
    "inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 shadow-sm",
  meta: "grid gap-4 md:grid-cols-3",
  statCard: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  statValue: "text-2xl font-semibold text-slate-900",
  statLabel: "text-sm text-slate-500",
  panelStack: "space-y-4",
  sideStack: "space-y-4",
  sectionTitle: "text-sm font-semibold text-slate-800",
  sectionText: "text-sm text-slate-500",
  taskList: "space-y-3",
  taskItem: "flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3",
  taskBullet: "mt-1 h-2.5 w-2.5 rounded-full bg-[#2e0810]",
  taskTitle: "text-sm font-semibold text-slate-800",
  taskMeta: "text-xs text-slate-500",
  stateStack: "space-y-4",
} as const;

export const DASHBOARD_STYLES = {
  page: "space-y-5",
  kpiGrid: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
  kpiCard: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  kpiIcon: "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600",
  kpiLabel: "mt-4 text-sm text-slate-500",
  kpiValue: "mt-2 text-3xl font-semibold text-slate-900",
  kpiDeltaRow: "mt-2 flex items-center gap-2 text-xs",
  kpiDeltaPositive: "rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-600",
  kpiDeltaNegative: "rounded-full bg-rose-50 px-2 py-0.5 font-semibold text-rose-600",
  kpiDeltaText: "text-slate-500",
  gridMain: "grid gap-4 xl:grid-cols-[1.8fr_1fr]",
  panel: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  panelHeader: "flex flex-wrap items-start justify-between gap-3",
  panelTitle: "text-lg font-semibold text-slate-900",
  panelSubtitle: "text-sm text-slate-500",
  chartCanvas: "mt-5 h-[300px] rounded-xl border border-slate-100 bg-slate-50 p-4",
  chartGrid: "relative h-full rounded-lg border border-dashed border-slate-200 bg-white",
  chartLines: "absolute inset-0",
  chartLineA: "absolute left-[6%] top-[40%] h-0.5 w-[88%] bg-blue-500/70",
  chartLineB: "absolute left-[6%] top-[62%] h-0.5 w-[88%] bg-[#2e0810]/60",
  chartShade: "absolute left-[6%] top-[40%] h-[22%] w-[88%] bg-blue-500/10",
  chartMonths: "absolute bottom-2 left-[6%] right-[6%] flex justify-between text-xs text-slate-500",
  trafficList: "mt-4 space-y-4",
  trafficItem: "rounded-xl border border-slate-100 p-4",
  trafficLabel: "text-sm text-slate-500",
  trafficValue: "mt-1 text-2xl font-semibold text-slate-900",
  trafficMeta: "mt-1 flex items-center gap-2 text-xs",
  miniSpark: "mt-2 h-8 rounded bg-emerald-50",
  bottomGrid: "grid gap-4 xl:grid-cols-[1.8fr_1fr]",
  listStack: "space-y-3",
  noteItem: "rounded-xl border border-slate-100 bg-white p-3",
  noteTitle: "text-sm font-semibold text-slate-800",
  noteMeta: "mt-1 text-xs text-slate-500",
} as const;

export const PROFILE_PAGE_STYLES = {
  page: "space-y-5",
  grid: "grid gap-4 xl:grid-cols-[1.1fr_1.4fr]",
  stack: "space-y-4",
  summaryCard: "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
  avatarWrap: "flex items-center gap-4",
  avatar: "grid h-16 w-16 place-items-center rounded-2xl bg-[#2e0810] text-lg font-semibold text-white",
  summaryName: "text-lg font-semibold text-slate-900",
  summaryMeta: "text-sm text-slate-500",
  tagRow: "mt-3 flex flex-wrap gap-2",
  tag: "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600",
  formGrid: "grid gap-4 md:grid-cols-2",
  full: "md:col-span-2",
  actions: "flex flex-wrap justify-end gap-2",
  activityStack: "space-y-4",
} as const;

export const PERSONAL_PAGE_STYLES = {
  page: "space-y-5",
  topGrid: "grid gap-4 xl:grid-cols-[1.2fr_1fr]",
  filtersGrid: "grid gap-4 md:grid-cols-2 xl:grid-cols-4",
  filtersActions: "flex flex-wrap items-end justify-end gap-2",
  metricsGrid: "grid gap-4 sm:grid-cols-2",
  metricCard: "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
  metricLabel: "text-sm text-slate-500",
  metricValue: "mt-2 text-2xl font-semibold text-slate-900",
  metricMeta: "mt-1 text-xs text-slate-500",
  panelStack: "space-y-4",
} as const;
