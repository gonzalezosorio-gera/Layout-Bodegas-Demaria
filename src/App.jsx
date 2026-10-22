import React, { useEffect, useRef, useState } from "react";
import { supabase } from "./supabaseClient";

const COLORS = {
  turquoise: "#00C1C2",
  turquoiseDark: "#009A9B",
  background: "#F3F6F8",
  panel: "#FFFFFF",
  text: "#172033",
  muted: "#667085",
  border: "#D8E0E7",
};

const RACKS = [
  { number: 1, positions: 12, className: "rack1" },
  { number: 2, positions: 8, className: "rack2" },
  { number: 3, positions: 8, className: "rack3" },
  { number: 4, positions: 6, className: "rack4" },
  { number: 5, positions: 6, className: "rack5" },
  { number: 6, positions: 6, className: "rack6" },
  { number: 7, positions: 6, className: "rack7" },
  { number: 8, positions: 6, className: "rack8" },
  { number: 9, positions: 6, className: "rack9" },
  { number: 10, positions: 6, className: "rack10" },
  { number: 11, positions: 6, className: "rack11" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [appError, setAppError] = useState("");
  const [mainTab, setMainTab] = useState("b70");
  const [sub70, setSub70] = useState("racks");
  const [sub60, setSub60] = useState("envases");
  const [searchSku, setSearchSku] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState(null);
  const [searchProductLoading, setSearchProductLoading] = useState(false);
  const [assignmentSku, setAssignmentSku] = useState("");
  const [focusLocation, setFocusLocation] = useState(null);
  const [rackCells, setRackCells] = useState({});
  const [driveCells, setDriveCells] = useState({});
  const hydratedRef = useRef(false);
  const previousRackRef = useRef({});
  const previousDriveRef = useRef({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setAppError(error.message);
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryMode(true);
      setSession(nextSession);
      if (!nextSession) {
        setProfile(null);
        setRackCells({});
        setDriveCells({});
        hydratedRef.current = false;
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadApplicationData() {
      setDataLoading(true);
      setAppError("");

      const [profileResult, locationsResult] = await Promise.all([
        supabase.from("profiles").select("display_name, role").eq("id", session.user.id).single(),
        supabase
          .from("warehouse_locations")
          .select("area, unit_number, level, position, sku")
          .eq("warehouse", "70")
          .in("area", ["racks_selectivos", "drive_in"]),
      ]);

      if (cancelled) return;
      if (profileResult.error) setAppError(profileResult.error.message);
      if (locationsResult.error) setAppError(locationsResult.error.message);

      setProfile(profileResult.data ?? { display_name: session.user.email, role: "viewer" });

      const nextRacks = {};
      const nextDrive = {};
      (locationsResult.data ?? []).forEach((row) => {
        const key = `${row.unit_number}-${row.level}-${row.position}`;
        if (row.area === "racks_selectivos") nextRacks[key] = row.sku;
        if (row.area === "drive_in") nextDrive[key] = row.sku;
      });

      previousRackRef.current = nextRacks;
      previousDriveRef.current = nextDrive;
      setRackCells(nextRacks);
      setDriveCells(nextDrive);
      hydratedRef.current = true;
      setDataLoading(false);
    }

    loadApplicationData();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const canEdit = profile?.role === "admin" || profile?.role === "editor";

  useEffect(() => {
    if (!hydratedRef.current || !session?.user || !canEdit) return;
    const timer = window.setTimeout(() => syncArea("racks_selectivos", rackCells, previousRackRef), 650);
    return () => window.clearTimeout(timer);
  }, [rackCells, session?.user?.id, canEdit]);

  useEffect(() => {
    if (!hydratedRef.current || !session?.user || !canEdit) return;
    const timer = window.setTimeout(() => syncArea("drive_in", driveCells, previousDriveRef), 650);
    return () => window.clearTimeout(timer);
  }, [driveCells, session?.user?.id, canEdit]);

  async function syncArea(area, currentCells, previousRef) {
    const previous = previousRef.current;
    const changedEntries = Object.entries(currentCells).filter(([key, value]) => value !== previous[key]);
    const deletedKeys = Object.keys(previous).filter((key) => !(key in currentCells) || !String(currentCells[key] ?? "").trim());
    if (!changedEntries.length && !deletedKeys.length) return;

    setSyncState("saving");
    setAppError("");

    const rows = changedEntries
      .filter(([, value]) => String(value ?? "").trim())
      .map(([key, value]) => {
        const [unitNumber, level, position] = key.split("-").map(Number);
        return {
          warehouse: "70",
          area,
          unit_number: unitNumber,
          level,
          position,
          sku: String(value).trim(),
          updated_by: session.user.id,
          updated_at: new Date().toISOString(),
        };
      });

    let error = null;
    if (rows.length) {
      const result = await supabase
        .from("warehouse_locations")
        .upsert(rows, { onConflict: "warehouse,area,unit_number,level,position" });
      error = result.error;
    }

    if (!error && deletedKeys.length) {
      for (const key of deletedKeys) {
        const [unitNumber, level, position] = key.split("-").map(Number);
        const result = await supabase
          .from("warehouse_locations")
          .delete()
          .eq("warehouse", "70")
          .eq("area", area)
          .eq("unit_number", unitNumber)
          .eq("level", level)
          .eq("position", position);
        if (result.error) { error = result.error; break; }
      }
    }

    if (error) {
      setSyncState("error");
      setAppError(error.message);
      return;
    }

    previousRef.current = { ...currentCells };
    setSyncState("saved");
    window.setTimeout(() => setSyncState("idle"), 1800);
  }

  const normalizedSearch = searchSku.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? [
        ...Object.entries(rackCells)
          .filter(([, sku]) => String(sku).toLowerCase().includes(normalizedSearch))
          .map(([key, sku]) => {
            const [rack, level, position] = key.split("-");
            return { id: `rack-${key}`, sku, area: "Racks Selectivos", coordinate: `RACK ${rack} · N${level} · P${position}`, target: "racks", unit: Number(rack), level: Number(level), slot: Number(position) };
          }),
        ...Object.entries(driveCells)
          .filter(([, sku]) => String(sku).toLowerCase().includes(normalizedSearch))
          .map(([key, sku]) => {
            const [street, level, depth] = key.split("-");
            return { id: `drive-${key}`, sku, area: "Racks Drive In", coordinate: `CALLE ${String(street).padStart(2, "0")} · N${level} · PROF. ${depth}`, target: "drive", unit: Number(street), level: Number(level), slot: Number(depth) };
          }),
      ]
    : [];

  useEffect(() => {
    const sku = searchSku.trim();
    if (!sku || !session?.user) {
      setSearchProduct(null);
      setSearchProductLoading(false);
      return;
    }

    let cancelled = false;
    setSearchProductLoading(true);
    const timer = window.setTimeout(async () => {
      const result = await supabase
        .from("products")
        .select("sku, description, stock, units_per_pallet, observation")
        .eq("sku", sku)
        .maybeSingle();
      if (!cancelled) {
        setSearchProduct(result.error ? null : result.data);
        setSearchProductLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [searchSku, session?.user?.id]);

  const searchAssigned = searchResults.length;
  const searchStock = Number(searchProduct?.stock) || 0;
  const searchUnitsPerPallet = Number(searchProduct?.units_per_pallet) || 0;
  const searchPallets = searchUnitsPerPallet > 0 ? searchStock / searchUnitsPerPallet : 0;
  const searchRequiredPositions = Math.ceil(searchPallets);
  const searchFreePositions = Math.max(searchAssigned - searchRequiredPositions, 0);
  const searchUtilization = searchAssigned > 0 ? (searchPallets / searchAssigned) * 100 : 0;
  const searchLocationGroups = summarizeLocations(searchResults);

  function navigateToResult(result) {
    setFocusLocation({ target: result.target, unit: result.unit, sku: String(result.sku || searchSku).trim() });
    setMainTab("b70");
    setSub70(result.target);
    setSearchOpen(false);
  }

  if (authLoading) return <LoadingScreen text="Verificando sesión..." />;
  if (recoveryMode && session) return <PasswordRecoveryScreen onComplete={() => setRecoveryMode(false)} />;
  if (!session) return <LoginScreen />;
  if (dataLoading || !profile) return <LoadingScreen text="Cargando ubicaciones..." />;

  const displayName = profile.display_name || session.user.email || "Usuario";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const roleLabel = profile.role === "admin" ? "Administrador" : profile.role === "editor" ? "Editor" : "Viewer";

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.brandBlock}>
          <p style={styles.eyebrow}>DEMARÍA</p>
          <h1 style={styles.title}>Layout de Bodegas</h1>
          <p style={styles.subtitle}>Gestión visual de ubicaciones, materiales y productos.</p>
        </div>
        <div style={styles.headerTools}>
          <div style={styles.searchWrap}>
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>
              <input value={searchSku} onChange={(event) => { setSearchSku(event.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} placeholder="Buscar SKU" aria-label="Buscar SKU" style={styles.searchInput} />
              {searchSku && <button type="button" onClick={() => { setSearchSku(""); setSearchOpen(false); }} style={styles.clearSearch} aria-label="Limpiar búsqueda">×</button>}
            </div>
            {searchOpen && searchSku.trim() && (
              <div style={styles.searchPanel}>
                <div style={styles.searchSummary}>
                  <div>
                    <span style={styles.searchSummaryLabel}>SKU buscado</span>
                    <strong style={styles.searchSkuValue}>{searchSku.trim()}</strong>
                  </div>
                  <div style={styles.positionCount}>
                    <strong>{searchAssigned}</strong>
                    <span>{searchAssigned === 1 ? "posición" : "posiciones"}</span>
                  </div>
                </div>

                {searchProductLoading ? (
                  <div style={styles.searchLoading}>Cargando detalle del producto…</div>
                ) : searchProduct ? (
                  <div style={styles.skuDetailCard}>
                    <strong style={styles.skuDescription}>{searchProduct.description || "Sin descripción"}</strong>
                    <div style={styles.skuMetricsGrid}>
                      <SearchMetric label="Stock" value={formatNumber(searchStock)} />
                      <SearchMetric label="Cant./Pallet" value={formatNumber(searchUnitsPerPallet)} />
                      <SearchMetric label="Pallets Eq." value={searchUnitsPerPallet > 0 ? searchPallets.toFixed(2) : "—"} />
                      <SearchMetric label="Utilización" value={searchAssigned > 0 && searchUnitsPerPallet > 0 ? `${searchUtilization.toFixed(1)}%` : "—"} alert={searchUtilization > 100} />
                      <SearchMetric label="Posiciones libres" value={searchUnitsPerPallet > 0 ? searchFreePositions : "—"} />
                    </div>
                    {searchProduct.observation && <div style={styles.skuObservation}>{searchProduct.observation}</div>}
                  </div>
                ) : (
                  <div style={styles.productMissing}>El SKU no existe en el Maestro de Productos.</div>
                )}

                <div style={styles.searchLocationSection}>
                  <span style={styles.searchSummaryLabel}>Primera ubicación</span>
                  {searchLocationGroups.length ? searchLocationGroups.map((group) => (
                    <button
                      key={group.target}
                      type="button"
                      onClick={() => navigateToResult({ target: group.target, unit: group.unit, sku: searchSku.trim() })}
                      style={styles.searchLocationCard}
                    >
                      <span style={styles.searchLocationIcon}>⌖</span>
                      <span style={styles.searchLocationText}>
                        <strong>{group.title} · {group.count} pos.</strong>
                        <small>{group.details} · {group.levels}</small>
                        <em>Ir a la primera posición</em>
                      </span>
                      <span style={styles.resultArrow}>›</span>
                    </button>
                  )) : <div style={styles.noResults}>El SKU no tiene posiciones asignadas.</div>}
                </div>
              </div>
            )}
          </div>
          <div style={styles.userCard}>
            <div style={styles.userAvatar}>{initials || "US"}</div>
            <div style={styles.userText}><strong>{displayName}</strong><span>{roleLabel} · {syncState === "saving" ? "Guardando..." : syncState === "saved" ? "Guardado" : syncState === "error" ? "Error al guardar" : "En línea"}</span></div>
            <span style={{ ...styles.onlineDot, ...(syncState === "error" ? styles.errorDot : {}) }} />
            <button type="button" onClick={() => supabase.auth.signOut()} style={styles.signOutButton}>Salir</button>
          </div>
        </div>
      </header>

      {appError && <div style={styles.errorBanner}>{appError}</div>}
      {!canEdit && <div style={styles.viewerBanner}>Modo Viewer: puedes consultar y buscar, pero no modificar ubicaciones.</div>}

      <nav style={styles.mainNav} aria-label="Navegación principal">
        <Tab active={mainTab === "b70"} onClick={() => setMainTab("b70")}>Bodega 70</Tab>
        <Tab active={mainTab === "b60"} onClick={() => setMainTab("b60")}>Bodega 60</Tab>
        <Tab active={mainTab === "master"} onClick={() => setMainTab("master")}>Maestro de Productos</Tab>
        {profile.role === "admin" && <Tab active={mainTab === "admin"} onClick={() => setMainTab("admin")}>Administración</Tab>}
      </nav>
      <main style={styles.content}>
        {mainTab === "b70" && <Bodega70 activeTab={sub70} onTabChange={setSub70} rackCells={rackCells} setRackCells={setRackCells} driveCells={driveCells} setDriveCells={setDriveCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={() => setAssignmentSku("")} focusLocation={focusLocation} />}
        {mainTab === "b60" && <Bodega60 activeTab={sub60} onTabChange={setSub60} />}
        {mainTab === "master" && <MaestroProductos rackCells={rackCells} driveCells={driveCells} canEdit={canEdit} isAdmin={profile.role === "admin"} userId={session.user.id} onNavigate={(location) => { setFocusLocation(location); setMainTab("b70"); setSub70(location.target); }} onAssign={(sku) => { setAssignmentSku(sku); setMainTab("b70"); setSub70("racks"); }} />}
        {mainTab === "admin" && profile.role === "admin" && <AdminProfiles currentUserId={session.user.id} />}
      </main>
    </div>
  );
}

function SearchMetric({ label, value, alert }) {
  return <div style={{ ...styles.searchMetric, ...(alert ? styles.searchMetricAlert : {}) }}><span>{label}</span><strong>{value}</strong></div>;
}

function LoadingScreen({ text }) {
  return <div style={styles.authPage}><div style={styles.loadingCard}><div style={styles.spinner} /><strong>{text}</strong></div></div>;
}

function LoginScreen() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event) {
    event.preventDefault(); setLoading(true); setError(""); setMessage("");
    if (mode === "login") {
      const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) setError(result.error.message);
    } else {
      const redirectTo = `${window.location.origin}${import.meta.env.BASE_URL}`;
      const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
      if (result.error) setError(result.error.message);
      else setMessage("Enviamos un enlace de recuperación. Abre el correo más reciente.");
    }
    setLoading(false);
  }

  return <div style={styles.authPage}><form onSubmit={submit} style={styles.loginCard}>
    <div style={styles.loginMark}>D</div><p style={styles.eyebrow}>DEMARÍA</p>
    <h1 style={styles.loginTitle}>{mode === "login" ? "Layout de Bodegas" : "Recuperar contraseña"}</h1>
    <p style={styles.loginText}>{mode === "login" ? "Ingresa con tu correo y contraseña autorizados." : "Escribe tu correo para recibir un enlace de recuperación."}</p>
    <label style={styles.fieldLabel}>Correo</label>
    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" style={styles.loginInput} />
    {mode === "login" && <><label style={styles.fieldLabel}>Contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={styles.loginInput} /></>}
    {error && <div style={styles.loginError}>{translateAuthError(error)}</div>}
    {message && <div style={styles.loginSuccess}>{message}</div>}
    <button type="submit" disabled={loading} style={styles.loginButton}>{loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Enviar enlace"}</button>
    <button type="button" onClick={() => { setMode(mode === "login" ? "reset" : "login"); setError(""); setMessage(""); }} style={styles.linkButton}>{mode === "login" ? "Olvidé mi contraseña" : "Volver al inicio de sesión"}</button>
  </form></div>;
}

function PasswordRecoveryScreen({ onComplete }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function update(event) {
    event.preventDefault(); setError(""); setMessage("");
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    if (password !== confirmation) return setError("Las contraseñas no coinciden.");
    setLoading(true);
    const result = await supabase.auth.updateUser({ password });
    if (result.error) { setError(translateAuthError(result.error.message)); setLoading(false); return; }
    setMessage("Contraseña actualizada. Volverás al inicio de sesión.");
    window.setTimeout(async () => { await supabase.auth.signOut(); onComplete(); }, 1400);
  }

  return <div style={styles.authPage}><form onSubmit={update} style={styles.loginCard}>
    <div style={styles.loginMark}>D</div><p style={styles.eyebrow}>DEMARÍA</p><h1 style={styles.loginTitle}>Nueva contraseña</h1>
    <p style={styles.loginText}>Crea una contraseña de al menos 8 caracteres.</p>
    <label style={styles.fieldLabel}>Nueva contraseña</label><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" style={styles.loginInput} />
    <label style={styles.fieldLabel}>Confirmar contraseña</label><input type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} required minLength={8} autoComplete="new-password" style={styles.loginInput} />
    {error && <div style={styles.loginError}>{error}</div>}{message && <div style={styles.loginSuccess}>{message}</div>}
    <button type="submit" disabled={loading} style={styles.loginButton}>{loading ? "Actualizando..." : "Guardar nueva contraseña"}</button>
  </form></div>;
}

function translateAuthError(message) {
  const value = String(message || "").toLowerCase();
  if (value.includes("invalid login credentials")) return "Correo o contraseña incorrectos.";
  if (value.includes("email not confirmed")) return "El correo todavía no está confirmado.";
  if (value.includes("expired") || value.includes("otp")) return "El enlace es inválido o expiró. Solicita uno nuevo.";
  if (value.includes("rate limit")) return "Se alcanzó el límite de correos. Espera unos minutos.";
  return message;
}

function Tab({ active, onClick, children }) {
  return (
    <button type="button" onClick={onClick} style={{ ...styles.mainTab, ...(active ? styles.mainTabActive : {}) }}>
      {children}
    </button>
  );
}

function SubNav({ tabs, activeTab, onTabChange }) {
  return (
    <nav style={styles.subNav} aria-label="Navegación de área">
      {tabs.map((tab) => (
        <button key={tab.id} type="button" onClick={() => onTabChange(tab.id)} style={{ ...styles.subTab, ...(activeTab === tab.id ? styles.subTabActive : {}) }}>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

function Section({ title, description, children }) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <p style={styles.sectionDescription}>{description}</p>
        </div>
        <span style={styles.status}>V5.3 buscador detallado</span>
      </div>
      {children}
    </section>
  );
}

function Bodega70({ activeTab, onTabChange, rackCells, setRackCells, driveCells, setDriveCells, canEdit, assignmentSku, onCancelAssignment, focusLocation }) {
  return (
    <Section title="Bodega 70" description="Racks selectivos y almacenamiento compacto Drive In.">
      <SubNav
        tabs={[{ id: "racks", label: "Racks Selectivos" }, { id: "drive", label: "Racks Drive In" }]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      {activeTab === "racks" && <RacksSelectivos cells={rackCells} setCells={setRackCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={onCancelAssignment} focusLocation={focusLocation} />}
      {activeTab === "drive" && <DriveIn cells={driveCells} setCells={setDriveCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={onCancelAssignment} focusLocation={focusLocation} />}
    </Section>
  );
}

function selectionBounds(selection) {
  if (!selection) return null;
  return {
    rowStart: Math.min(selection.anchor.row, selection.focus.row),
    rowEnd: Math.max(selection.anchor.row, selection.focus.row),
    colStart: Math.min(selection.anchor.col, selection.focus.col),
    colEnd: Math.max(selection.anchor.col, selection.focus.col),
  };
}

function isCellSelected(selection, group, row, col) {
  if (!selection || selection.group !== group) return false;
  const bounds = selectionBounds(selection);
  return row >= bounds.rowStart && row <= bounds.rowEnd && col >= bounds.colStart && col <= bounds.colEnd;
}

function DriveIn({ cells, setCells, canEdit, assignmentSku, onCancelAssignment, focusLocation }) {
  const [activeCell, setActiveCell] = useState("");
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const streets = Array.from({ length: 23 }, (_, index) => index + 1);
  const levels = [3, 2, 1];
  const depths = [1, 2, 3, 4, 5];

  useEffect(() => {
    if (focusLocation?.target !== "drive") return;
    const timer = window.setTimeout(() => {
      document.getElementById(`drive-street-${focusLocation.unit}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [focusLocation]);

  function updateCell(street, level, depth, value) {
    const key = `${street}-${level}-${depth}`;
    setCells((current) => ({ ...current, [key]: value }));
  }

  function selectedDriveKeys(currentSelection = selection) {
    if (!currentSelection) return [];
    const bounds = selectionBounds(currentSelection);
    const keys = [];
    for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
      for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
        keys.push(`${currentSelection.group}-${levels[row]}-${depths[col]}`);
      }
    }
    return keys;
  }

  function clearSelection() {
    if (!canEdit) return;
    const keys = selectedDriveKeys();
    if (!keys.length) return;
    setCells((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }

  function assignSkuToSelection() {
    if (!canEdit || !assignmentSku || !selection) return;
    const keys = selectedDriveKeys();
    setCells((current) => {
      const next = { ...current };
      keys.forEach((key) => { next[key] = assignmentSku; });
      return next;
    });
  }

  function copySelection() {
    if (!selection) return;
    const bounds = selectionBounds(selection);
    const text = [];
    for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
      const values = [];
      for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
        values.push(cells[`${selection.group}-${levels[row]}-${depths[col]}`] || "");
      }
      text.push(values.join("\t"));
    }
    navigator.clipboard?.writeText(text.join("\n"));
  }

  function pasteSelection(text) {
    if (!canEdit || !selection) return;
    const rows = text.replace(/\r/g, "").split("\n").filter((row, index, all) => row || index < all.length - 1).map((row) => row.split("\t"));
    const bounds = selectionBounds(selection);
    const isSingleValue = rows.length === 1 && rows[0].length === 1;

    setCells((current) => {
      const next = { ...current };

      if (isSingleValue) {
        const value = rows[0][0].trim();
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
          for (let col = bounds.colStart; col <= bounds.colEnd; col += 1) {
            next[`${selection.group}-${levels[row]}-${depths[col]}`] = value;
          }
        }
        return next;
      }

      rows.forEach((values, rowOffset) => {
        values.forEach((value, colOffset) => {
          const row = bounds.rowStart + rowOffset;
          const col = bounds.colStart + colOffset;
          if (row < levels.length && col < depths.length) {
            next[`${selection.group}-${levels[row]}-${depths[col]}`] = value.trim();
          }
        });
      });
      return next;
    });
  }

  function handleGridKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelection();
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selectedDriveKeys().length > 1) {
      event.preventDefault();
      clearSelection();
    }
  }

  return (
    <div
      style={styles.driveArea}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onKeyDown={handleGridKeyDown}
      onPaste={(event) => {
        if (selection) {
          event.preventDefault();
          pasteSelection(event.clipboardData.getData("text/plain"));
        }
      }}
    >
      {assignmentSku && <div style={styles.assignmentBanner}><div><strong>SKU en asignación: {assignmentSku}</strong><span>Selecciona una o varias celdas y pulsa “Asignar a selección”.</span></div><div style={styles.actionGroup}><button type="button" onClick={assignSkuToSelection} style={styles.assignmentButton}>Asignar a selección</button><button type="button" onClick={onCancelAssignment} style={styles.actionSecondary}>Cancelar</button></div></div>}
      <div style={styles.layoutToolbar}>
        <div>
          <h3 style={styles.areaTitle}>Racks Drive In</h3>
          <p style={styles.areaDescription}>23 calles, 5 profundidades y 3 niveles. Arrastra para seleccionar; usa Ctrl/Cmd+C, Ctrl/Cmd+V o Supr.</p>
        </div>
        <div style={styles.selectionTools}>
          <span style={styles.summaryBadge}>345 celdas editables</span>
          <button type="button" onClick={copySelection} style={styles.selectionButton}>Copiar</button>
          <button type="button" onClick={clearSelection} style={styles.selectionButtonDanger}>Borrar selección</button>
        </div>
      </div>

      <div style={styles.driveGrid}>
        {streets.map((street) => (
          <DriveStreet
            key={street}
            street={street}
            cells={cells}
            activeCell={activeCell}
            setActiveCell={setActiveCell}
            updateCell={updateCell}
            selection={selection}
            setSelection={setSelection}
            dragging={dragging}
            setDragging={setDragging}
            canEdit={canEdit}
            focusLocation={focusLocation}
          />
        ))}
      </div>
    </div>
  );
}

function DriveStreet({ street, cells, activeCell, setActiveCell, updateCell, selection, setSelection, dragging, setDragging, canEdit, focusLocation }) {
  const depths = [1, 2, 3, 4, 5];
  const levels = [3, 2, 1];

  return (
    <article id={`drive-street-${street}`} style={{ ...styles.driveStreet, ...(focusLocation?.target === "drive" && focusLocation.unit === street ? styles.focusedUnit : {}) }}>
      <div style={styles.driveStreetHeader}>Calle {String(street).padStart(2, "0")}</div>
      <div style={styles.driveMatrixWrap}>
        <div style={styles.driveMatrix}>
          <div style={styles.driveCorner}>NIVEL</div>
          {depths.map((depth) => <div key={`depth-${depth}`} style={styles.driveDepthHeader}>PROF. {depth}</div>)}
          {levels.flatMap((level, row) => [
            <div key={`label-${level}`} style={styles.driveLevelLabel}>N{level}</div>,
            ...depths.map((depth, col) => {
              const key = `${street}-${level}-${depth}`;
              const selected = isCellSelected(selection, street, row, col);
              return (
                <input
                  key={key}
                  value={cells[key] || ""}
                  readOnly={!canEdit}
                  onMouseDown={(event) => {
                    if (!canEdit) return;
                    event.preventDefault();
                    setSelection({ group: street, anchor: { row, col }, focus: { row, col } });
                    setDragging(true);
                    setActiveCell(key);
                    event.currentTarget.focus();
                  }}
                  onMouseEnter={() => {
                    if (dragging && selection?.group === street) {
                      setSelection((current) => ({ ...current, focus: { row, col } }));
                    }
                  }}
                  onChange={(event) => canEdit && updateCell(street, level, depth, event.target.value)}
                  aria-label={`Calle ${street}, nivel ${level}, profundidad ${depth}`}
                  placeholder="SKU"
                  style={{
                    ...styles.driveCell,
                    ...(level === 3 ? styles.levelThree : {}),
                    ...(level === 2 ? styles.levelTwo : {}),
                    ...(level === 1 ? styles.levelOne : {}),
                    ...(activeCell === key ? styles.driveCellActive : {}),
                    ...(selected ? styles.multiSelectedCell : {}),
                    ...(focusLocation?.target === "drive" && String(cells[key] || "").trim() === focusLocation.sku ? styles.focusedSkuCell : {}),
                  }}
                />
              );
            }),
          ])}
        </div>
      </div>
    </article>
  );
}

function RacksSelectivos({ cells, setCells, canEdit, assignmentSku, onCancelAssignment, focusLocation }) {
  const [activeCell, setActiveCell] = useState("");
  const [selection, setSelection] = useState(null);
  const [dragging, setDragging] = useState(false);
  const levels = [3, 2, 1];

  useEffect(() => {
    if (focusLocation?.target !== "racks") return;
    const timer = window.setTimeout(() => {
      document.getElementById(`selective-rack-${focusLocation.unit}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [focusLocation]);

  function updateCell(rack, level, position, value) {
    const key = `${rack}-${level}-${position}`;
    setCells((current) => ({ ...current, [key]: value }));
  }

  function selectedRackKeys(currentSelection = selection) {
    if (!currentSelection) return [];
    const rack = RACKS.find((item) => item.number === currentSelection.group);
    if (!rack) return [];
    const bounds = selectionBounds(currentSelection);
    const keys = [];
    for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
      for (let col = bounds.colStart; col <= Math.min(bounds.colEnd, rack.positions - 1); col += 1) {
        keys.push(`${rack.number}-${levels[row]}-${col + 1}`);
      }
    }
    return keys;
  }

  function clearSelection() {
    if (!canEdit) return;
    const keys = selectedRackKeys();
    if (!keys.length) return;
    setCells((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }

  function assignSkuToSelection() {
    if (!canEdit || !assignmentSku || !selection) return;
    const keys = selectedRackKeys();
    setCells((current) => {
      const next = { ...current };
      keys.forEach((key) => { next[key] = assignmentSku; });
      return next;
    });
  }

  function copySelection() {
    if (!selection) return;
    const rack = RACKS.find((item) => item.number === selection.group);
    const bounds = selectionBounds(selection);
    const text = [];
    for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
      const values = [];
      for (let col = bounds.colStart; col <= Math.min(bounds.colEnd, rack.positions - 1); col += 1) {
        values.push(cells[`${rack.number}-${levels[row]}-${col + 1}`] || "");
      }
      text.push(values.join("\t"));
    }
    navigator.clipboard?.writeText(text.join("\n"));
  }

  function pasteSelection(text) {
    if (!canEdit || !selection) return;
    const rack = RACKS.find((item) => item.number === selection.group);
    const rows = text.replace(/\r/g, "").split("\n").filter((row, index, all) => row || index < all.length - 1).map((row) => row.split("\t"));
    const bounds = selectionBounds(selection);
    const isSingleValue = rows.length === 1 && rows[0].length === 1;

    setCells((current) => {
      const next = { ...current };

      if (isSingleValue) {
        const value = rows[0][0].trim();
        for (let row = bounds.rowStart; row <= bounds.rowEnd; row += 1) {
          for (let col = bounds.colStart; col <= Math.min(bounds.colEnd, rack.positions - 1); col += 1) {
            next[`${rack.number}-${levels[row]}-${col + 1}`] = value;
          }
        }
        return next;
      }

      rows.forEach((values, rowOffset) => {
        values.forEach((value, colOffset) => {
          const row = bounds.rowStart + rowOffset;
          const col = bounds.colStart + colOffset;
          if (row < levels.length && col < rack.positions) {
            next[`${rack.number}-${levels[row]}-${col + 1}`] = value.trim();
          }
        });
      });
      return next;
    });
  }

  function handleGridKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copySelection();
    }
    if ((event.key === "Delete" || event.key === "Backspace") && selectedRackKeys().length > 1) {
      event.preventDefault();
      clearSelection();
    }
  }

  return (
    <div
      style={styles.fullLayoutArea}
      onMouseUp={() => setDragging(false)}
      onMouseLeave={() => setDragging(false)}
      onKeyDown={handleGridKeyDown}
      onPaste={(event) => {
        if (selection) {
          event.preventDefault();
          pasteSelection(event.clipboardData.getData("text/plain"));
        }
      }}
    >
      {assignmentSku && <div style={styles.assignmentBanner}><div><strong>SKU en asignación: {assignmentSku}</strong><span>Selecciona una o varias celdas y pulsa “Asignar a selección”.</span></div><div style={styles.actionGroup}><button type="button" onClick={assignSkuToSelection} style={styles.assignmentButton}>Asignar a selección</button><button type="button" onClick={onCancelAssignment} style={styles.actionSecondary}>Cancelar</button></div></div>}
      <div style={styles.layoutToolbar}>
        <div>
          <h3 style={styles.areaTitle}>Plano completo de Racks Selectivos</h3>
          <p style={styles.areaDescription}>Arrastra sobre las celdas para seleccionar un bloque; usa Ctrl/Cmd+C, Ctrl/Cmd+V o Supr.</p>
        </div>
        <div style={styles.selectionTools}>
          <span style={styles.summaryBadge}>Selección múltiple</span>
          <button type="button" onClick={copySelection} style={styles.selectionButton}>Copiar</button>
          <button type="button" onClick={clearSelection} style={styles.selectionButtonDanger}>Borrar selección</button>
        </div>
      </div>

      <div style={styles.canvasScroller}>
        <div style={styles.warehouseCanvas}>
          {RACKS.map((rack) => (
            <div key={rack.number} className={rack.className} style={{ ...styles.rackPlacement, ...rackPlacements[rack.className] }}>
              <WarehouseRack
                rack={rack}
                cells={cells}
                activeCell={activeCell}
                setActiveCell={setActiveCell}
                updateCell={updateCell}
                selection={selection}
                setSelection={setSelection}
                dragging={dragging}
                setDragging={setDragging}
                canEdit={canEdit}
                focusLocation={focusLocation}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WarehouseRack({ rack, cells, activeCell, setActiveCell, updateCell, selection, setSelection, dragging, setDragging, canEdit, focusLocation }) {
  const positions = Array.from({ length: rack.positions }, (_, index) => index + 1);
  const levels = [3, 2, 1];

  return (
    <div id={`selective-rack-${rack.number}`} style={{ ...styles.warehouseRack, ...(focusLocation?.target === "racks" && focusLocation.unit === rack.number ? styles.focusedUnit : {}) }}>
      <div style={styles.rackName}>RACK {rack.number}</div>
      <div style={styles.rackMatrixWrap}>
        <div style={{ ...styles.rackMatrix, gridTemplateColumns: `repeat(${rack.positions}, minmax(0, 1fr))` }}>
          {positions.map((position) => <div key={`h-${position}`} style={styles.matrixPositionHeader}>P{position}</div>)}
          {levels.flatMap((level, row) => positions.map((position, col) => {
            const key = `${rack.number}-${level}-${position}`;
            const selected = isCellSelected(selection, rack.number, row, col);
            return (
              <input
                key={key}
                value={cells[key] || ""}
                readOnly={!canEdit}
                onMouseDown={(event) => {
                  if (!canEdit) return;
                  event.preventDefault();
                  setSelection({ group: rack.number, anchor: { row, col }, focus: { row, col } });
                  setDragging(true);
                  setActiveCell(key);
                  event.currentTarget.focus();
                }}
                onMouseEnter={() => {
                  if (dragging && selection?.group === rack.number) {
                    setSelection((current) => ({ ...current, focus: { row, col } }));
                  }
                }}
                onChange={(event) => canEdit && updateCell(rack.number, level, position, event.target.value)}
                aria-label={`Rack ${rack.number}, nivel ${level}, posición ${position}`}
                style={{
                  ...styles.matrixCell,
                  ...(level === 3 ? styles.levelThree : {}),
                  ...(level === 2 ? styles.levelTwo : {}),
                  ...(level === 1 ? styles.levelOne : {}),
                  ...(activeCell === key ? styles.matrixCellActive : {}),
                  ...(selected ? styles.multiSelectedCell : {}),
                  ...(focusLocation?.target === "racks" && String(cells[key] || "").trim() === focusLocation.sku ? styles.focusedSkuCell : {}),
                }}
              />
            );
          }))}
        </div>
        <div style={styles.levelLabelsColumn}>
          <div style={styles.levelSpacer} />
          <div style={styles.matrixLevelLabel}>Nivel 3</div>
          <div style={styles.matrixLevelLabel}>Nivel 2</div>
          <div style={styles.matrixLevelLabel}>Nivel 1</div>
        </div>
      </div>
    </div>
  );
}

function Bodega60({ activeTab, onTabChange }) {
  const tabs = [
    { id: "envases", label: "Envases" },
    { id: "tc", label: "Etiquetas TC" },
    { id: "adhesivas", label: "Etiquetas Adhesivas" },
    { id: "film", label: "FILM" },
  ];
  const panels = {
    envases: ["EN", "Envases", "Ubicaciones y control de envases."],
    tc: ["TC", "Etiquetas TC", "Área de almacenamiento de etiquetas TC."],
    adhesivas: ["EA", "Etiquetas Adhesivas", "Área de almacenamiento de etiquetas adhesivas."],
    film: ["FI", "FILM", "Área de almacenamiento y control de film."],
  };
  const panel = panels[activeTab];

  return (
    <Section title="Bodega 60" description="Envases y materiales de empaque.">
      <SubNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
      <Placeholder code={panel[0]} title={panel[1]} text={panel[2]} />
    </Section>
  );
}

function Placeholder({ code, title, text }) {
  return (
    <div style={styles.placeholder}>
      <div style={styles.placeholderCode}>{code}</div>
      <div>
        <h3 style={styles.areaTitle}>{title}</h3>
        <p style={styles.areaDescription}>{text}</p>
        <p style={styles.pending}>Layout pendiente de diseño.</p>
      </div>
    </div>
  );
}

function AdminProfiles({ currentUserId }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProfiles() {
    setLoading(true); setError("");
    const result = await supabase.from("profiles").select("id, display_name, role, created_at, updated_at").order("display_name");
    if (result.error) setError(result.error.message);
    else setProfiles(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadProfiles(); }, []);

  async function changeRole(id, role) {
    if (id === currentUserId) return setError("Por seguridad, no puedes cambiar tu propio rol desde la aplicación.");
    setSavingId(id); setError(""); setMessage("");
    const result = await supabase.from("profiles").update({ role, updated_at: new Date().toISOString() }).eq("id", id).select("id, role").single();
    if (result.error) setError(result.error.message);
    else {
      setProfiles((current) => current.map((item) => item.id === id ? { ...item, role } : item));
      setMessage("Rol actualizado correctamente.");
    }
    setSavingId("");
  }

  if (loading) return <LoadingPanel text="Cargando perfiles..." />;

  return <Section title="Administración de perfiles" description="Asigna permisos de consulta o edición a usuarios existentes.">
    <div style={styles.adminToolbar}>
      <div><strong>{profiles.length} usuarios</strong><p style={styles.adminHelp}>Los usuarios se crean en Supabase Authentication. Aquí se administra únicamente el rol operativo.</p></div>
      <button type="button" onClick={loadProfiles} style={styles.selectionButton}>Actualizar lista</button>
    </div>
    {error && <div style={styles.errorBannerInline}>{error}</div>}
    {message && <div style={styles.successBannerInline}>{message}</div>}
    <div style={styles.profileList}>
      {profiles.map((item) => {
        const isCurrent = item.id === currentUserId;
        return <article key={item.id} style={styles.profileCard}>
          <div style={styles.profileIdentity}>
            <div style={styles.profileAvatar}>{(item.display_name || "U").slice(0,2).toUpperCase()}</div>
            <div><strong>{item.display_name || "Usuario sin nombre"}</strong><small style={styles.profileId}>{item.id}</small></div>
          </div>
          <div style={styles.roleControl}>
            <span style={{ ...styles.roleBadge, ...roleBadgeStyles[item.role] }}>{roleLabels[item.role]}</span>
            <select value={item.role} disabled={isCurrent || savingId === item.id} onChange={(event) => changeRole(item.id, event.target.value)} style={styles.roleSelect} aria-label={`Rol de ${item.display_name}`}>
              <option value="viewer">Viewer · Solo lectura</option>
              <option value="editor">Editor · Puede editar</option>
              <option value="admin">Administrador · Control total</option>
            </select>
            {isCurrent && <small style={styles.currentUserTag}>Tu usuario</small>}
          </div>
        </article>;
      })}
    </div>
    <div style={styles.permissionGrid}>
      <PermissionCard role="Viewer" color="#667085" items={["Consultar layouts", "Buscar SKU y coordenadas", "No puede editar, pegar ni borrar"]} />
      <PermissionCard role="Editor" color="#009A9B" items={["Todo lo de Viewer", "Editar SKU", "Copiar, pegar y borrar selecciones"]} />
      <PermissionCard role="Administrador" color="#172033" items={["Todo lo de Editor", "Abrir Administración", "Cambiar roles de otros usuarios"]} />
    </div>
  </Section>;
}

const roleLabels = { viewer: "Viewer", editor: "Editor", admin: "Administrador" };
const roleBadgeStyles = {
  viewer: { background: "#F2F4F7", color: "#475467" },
  editor: { background: "#DDF9F8", color: "#007C7D" },
  admin: { background: "#E4E7EC", color: "#172033" },
};

function PermissionCard({ role, color, items }) {
  return <div style={styles.permissionCard}><strong style={{ color }}>{role}</strong>{items.map((item) => <span key={item}>✓ {item}</span>)}</div>;
}

function LoadingPanel({ text }) {
  return <div style={styles.loadingPanel}><div style={styles.spinner} /><strong>{text}</strong></div>;
}

function compactNumberRanges(values) {
  const numbers = [...new Set(values.map(Number).filter(Number.isFinite))].sort((a, b) => a - b);
  if (!numbers.length) return "";
  const ranges = [];
  let start = numbers[0];
  let previous = numbers[0];
  for (let index = 1; index <= numbers.length; index += 1) {
    const current = numbers[index];
    if (current === previous + 1) {
      previous = current;
      continue;
    }
    ranges.push(start === previous ? `${start}` : `${start}–${previous}`);
    start = current;
    previous = current;
  }
  return ranges.join(", ");
}

function summarizeLocations(locations) {
  const groups = [
    { target: "racks", singular: "Rack", plural: "Racks Selectivos" },
    { target: "drive", singular: "Calle", plural: "Drive In" },
  ];

  return groups.flatMap((config) => {
    const items = locations.filter((location) => location.target === config.target);
    if (!items.length) return [];
    const units = [...new Set(items.map((item) => item.unit))].sort((a, b) => a - b);
    const unitText = compactNumberRanges(units);
    const levels = [...new Set(items.map((item) => item.level))].sort((a, b) => b - a);
    const details = config.target === "racks"
      ? `${units.length === 1 ? config.singular : "Racks"} ${unitText}`
      : `${units.length === 1 ? config.singular : "Calles"} ${unitText}`;
    return [{
      target: config.target,
      title: config.plural,
      details,
      count: items.length,
      levels: levels.map((level) => `N${level}`).join(", "),
      first: items[0]?.label || "",
      unit: units[0],
    }];
  });
}

function MaestroProductos({ rackCells, driveCells, canEdit, isAdmin, userId, onNavigate, onAssign }) {
  const emptyDraft = { sku: "", description: "", stock: "", units_per_pallet: "", observation: "" };
  const [products, setProducts] = useState([]);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingSku, setEditingSku] = useState("");
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [importPreview, setImportPreview] = useState(null);
  const [importType, setImportType] = useState("");
  const [importing, setImporting] = useState(false);
  const [history, setHistory] = useState([]);

  const locationsBySku = {};
  Object.entries(rackCells).forEach(([key, sku]) => {
    const normalized = String(sku || "").trim();
    if (!normalized) return;
    const [rack, level, position] = key.split("-");
    if (!locationsBySku[normalized]) locationsBySku[normalized] = [];
    locationsBySku[normalized].push({ label: `RACK ${rack} · N${level} · P${position}`, target: "racks", unit: Number(rack), level: Number(level), slot: Number(position) });
  });
  Object.entries(driveCells).forEach(([key, sku]) => {
    const normalized = String(sku || "").trim();
    if (!normalized) return;
    const [street, level, depth] = key.split("-");
    if (!locationsBySku[normalized]) locationsBySku[normalized] = [];
    locationsBySku[normalized].push({ label: `CALLE ${String(street).padStart(2, "0")} · N${level} · PROF. ${depth}`, target: "drive", unit: Number(street), level: Number(level), slot: Number(depth) });
  });

  async function loadProducts() {
    setLoading(true); setError("");
    const result = await supabase.from("products").select("sku, description, stock, units_per_pallet, observation, updated_at").order("sku");
    if (result.error) setError(result.error.message);
    else setProducts(result.data ?? []);
    const historyResult = await supabase.from("import_history").select("id, import_type, file_name, total_rows, successful_rows, error_rows, created_at").order("created_at", { ascending: false }).limit(10);
    if (!historyResult.error) setHistory(historyResult.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  function enriched(product) {
    const stock = Number(product.stock) || 0;
    const units = Number(product.units_per_pallet) || 0;
    const pallets = units > 0 ? stock / units : 0;
    const locations = locationsBySku[product.sku] ?? [];
    const assigned = locations.length;
    return { ...product, stock, units, pallets, locations, assigned, difference: assigned - pallets };
  }

  async function saveProduct(event, source, isNew) {
    event.preventDefault();
    if (!canEdit) return;
    const sku = String(source.sku || "").trim();
    if (!sku) return setError("El SKU es obligatorio.");
    setSaving(true); setError(""); setMessage("");
    const payload = {
      sku,
      description: String(source.description || "").trim(),
      stock: Math.max(0, Number(source.stock) || 0),
      units_per_pallet: Math.max(0, Number(source.units_per_pallet) || 0),
      observation: String(source.observation || "").trim(),
      updated_by: userId,
      updated_at: new Date().toISOString(),
    };
    const result = await supabase.from("products").upsert(payload, { onConflict: "sku" }).select("sku, description, stock, units_per_pallet, observation, updated_at").single();
    if (result.error) setError(result.error.message);
    else {
      setProducts((current) => [...current.filter((item) => item.sku !== sku), result.data].sort((a,b) => a.sku.localeCompare(b.sku)));
      if (isNew) setDraft(emptyDraft);
      setEditingSku("");
      setMessage(isNew ? "Producto agregado correctamente." : "Producto actualizado correctamente.");
    }
    setSaving(false);
  }

  async function deleteProduct(sku) {
    if (!isAdmin || !window.confirm(`¿Eliminar el producto ${sku}?`)) return;
    setError(""); setMessage("");
    const result = await supabase.from("products").delete().eq("sku", sku);
    if (result.error) setError(result.error.message);
    else { setProducts((current) => current.filter((item) => item.sku !== sku)); setMessage("Producto eliminado."); }
  }

  function parseDelimited(text) {
    const lines = text.replace(/^\uFEFF/, "").replace(/\r/g, "").split("\n").filter((line) => line.trim());
    if (!lines.length) return [];
    const delimiter = lines[0].includes(";") ? ";" : lines[0].includes("\t") ? "\t" : ",";
    const headers = lines[0].split(delimiter).map((value) => value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "_"));
    return lines.slice(1).map((line, index) => {
      const values = line.split(delimiter).map((value) => value.trim().replace(/^"|"$/g, ""));
      return { rowNumber: index + 2, data: Object.fromEntries(headers.map((header, position) => [header, values[position] ?? ""])) };
    });
  }

  async function readImportFile(event, type) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const text = await file.text();
    const source = parseDelimited(text);
    const seen = new Set();
    const valid = [];
    const errors = [];

    source.forEach(({ rowNumber, data }) => {
      const sku = String(data.sku || data.codigo || data.material || "").trim();
      if (!sku) { errors.push({ rowNumber, reason: "SKU vacío" }); return; }
      if (seen.has(sku)) { errors.push({ rowNumber, reason: `SKU duplicado en archivo: ${sku}` }); return; }
      seen.add(sku);
      if (type === "products") {
        const units = Number(String(data.cantidad_pallet || data.cant_pallet || data.units_per_pallet || data.pallet || "0").replace(",", "."));
        if (!Number.isFinite(units) || units < 0) { errors.push({ rowNumber, reason: `Cantidad por pallet inválida: ${sku}` }); return; }
        valid.push({ sku, description: data.descripcion || data.description || "", units_per_pallet: units, observation: data.observacion || data.observation || "" });
      } else {
        const stock = Number(String(data.stock || data.stock_actual || data.cantidad || "").replace(/\./g, "").replace(",", "."));
        if (!Number.isFinite(stock) || stock < 0) { errors.push({ rowNumber, reason: `Stock inválido: ${sku}` }); return; }
        valid.push({ sku, stock });
      }
    });
    setImportType(type);
    setImportPreview({ fileName: file.name, total: source.length, valid, errors });
  }

  async function confirmImport() {
    if (!canEdit || !importPreview?.valid.length || importing) return;
    setImporting(true);
    setError("");
    setMessage("");

    const originalPreview = importPreview;
    let success = 0;
    let importErrors = [...originalPreview.errors];

    try {
      if (importType === "products") {
        const payload = originalPreview.valid.map((row) => ({
          ...row,
          updated_by: userId,
          updated_at: new Date().toISOString(),
        }));
        const result = await supabase.from("products").upsert(payload, { onConflict: "sku" });
        if (result.error) throw result.error;
        success = payload.length;
      } else {
        const payload = originalPreview.valid.map((row) => ({
          sku: String(row.sku).trim(),
          stock: Number(row.stock),
        }));
        const result = await supabase.rpc("bulk_update_product_stock", { stock_rows: payload });
        if (result.error) throw result.error;

        const summary = Array.isArray(result.data) ? result.data[0] : result.data;
        success = Number(summary?.updated_count) || 0;
        const missing = Array.isArray(summary?.missing_skus) ? summary.missing_skus : [];
        missing.forEach((sku) => importErrors.push({ rowNumber: 0, reason: `SKU no encontrado: ${sku}` }));
      }

      const historyResult = await supabase.from("import_history").insert({
        import_type: importType,
        file_name: originalPreview.fileName,
        total_rows: originalPreview.total,
        successful_rows: success,
        error_rows: importErrors.length,
        imported_by: userId,
      });
      if (historyResult.error) {
        importErrors.push({ rowNumber: 0, reason: `Historial no registrado: ${historyResult.error.message}` });
      }

      await loadProducts();
      setMessage(`Importación finalizada: ${success} filas actualizadas y ${importErrors.length} observaciones.`);
      setImportPreview(null);
      if (importErrors.length) {
        setImportPreview({
          fileName: originalPreview.fileName,
          total: originalPreview.total,
          valid: [],
          errors: importErrors,
          completed: true,
          success,
        });
      }
    } catch (importError) {
      setError(`No se actualizó el stock: ${importError.message || importError}`);
      setImportPreview(originalPreview);
    } finally {
      setImporting(false);
    }
  }

  const rows = products.map(enriched).filter((item) => {
    const searchMatch = `${item.sku} ${item.description} ${item.observation}`.toLowerCase().includes(query.trim().toLowerCase());
    const statusMatch = statusFilter === "all" || (statusFilter === "deficit" && item.difference < -0.01) || (statusFilter === "balanced" && Math.abs(item.difference) <= 0.01) || (statusFilter === "surplus" && item.difference > 0.01) || (statusFilter === "unlocated" && item.assigned === 0);
    return searchMatch && statusMatch;
  });

  const summary = products.map(enriched);
  const deficitCount = summary.filter((item) => item.difference < -0.01).length;
  const unlocatedCount = summary.filter((item) => item.assigned === 0).length;

  return <Section title="Maestro de Productos" description="Stock, palletizado, posiciones asignadas, diferencias y ubicaciones reales.">
    <div style={styles.masterSummary}>
      <SummaryCard label="Productos" value={products.length} />
      <SummaryCard label="Con déficit de posiciones" value={deficitCount} warning />
      <SummaryCard label="Sin ubicación" value={unlocatedCount} warning={unlocatedCount > 0} />
      <SummaryCard label="Ubicaciones ocupadas" value={Object.values(locationsBySku).reduce((total, list) => total + list.length, 0)} />
    </div>

    <div style={styles.masterToolbar}>
      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar SKU, descripción u observación" style={styles.masterSearch} />
      <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.roleSelect}>
        <option value="all">Todos los estados</option><option value="deficit">Déficit de posiciones</option><option value="balanced">Equilibrados</option><option value="surplus">Exceso de posiciones</option><option value="unlocated">Sin ubicación</option>
      </select>
      <button type="button" onClick={loadProducts} style={styles.selectionButton}>Actualizar</button>
      {canEdit && <><label style={styles.importButton}>Importar Maestro CSV<input type="file" accept=".csv,.txt" hidden onChange={(event) => readImportFile(event, "products")} /></label><label style={styles.importButtonStock}>Actualizar Stock CSV<input type="file" accept=".csv,.txt" hidden onChange={(event) => readImportFile(event, "stock")} /></label></>}
    </div>

    {importPreview && <div style={styles.importPreview}><div><strong>{importPreview.completed ? "Resultado de importación" : importType === "products" ? "Vista previa Maestro" : "Vista previa Stock"}</strong><span>{importPreview.fileName}</span></div><div style={styles.importStats}><span>{importPreview.total} filas</span>{importPreview.completed ? <span>{importPreview.success} actualizadas</span> : <span>{importPreview.valid.length} válidas</span>}<span>{importPreview.errors.length} observaciones</span></div>{importPreview.errors.length > 0 && <details><summary>Ver observaciones</summary><div style={styles.importErrors}>{importPreview.errors.slice(0,50).map((item,index) => <span key={`${item.rowNumber}-${index}`}>{item.rowNumber ? `Fila ${item.rowNumber}: ` : ""}{item.reason}</span>)}</div></details>}<div style={styles.actionGroup}>{!importPreview.completed && <button type="button" disabled={importing || !importPreview.valid.length} onClick={confirmImport} style={styles.actionPrimary}>{importing ? "Importando..." : "Confirmar importación"}</button>}<button type="button" onClick={() => setImportPreview(null)} style={styles.actionSecondary}>{importPreview.completed ? "Cerrar" : "Cancelar"}</button></div></div>}

    {canEdit && <form onSubmit={(event) => saveProduct(event, draft, true)} style={styles.newProductForm}>
      <strong style={styles.formTitle}>Nuevo producto</strong>
      <input value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} placeholder="SKU" required style={styles.masterInput} />
      <input value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Descripción" style={styles.masterInputWide} />
      <input type="number" min="0" step="any" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: event.target.value })} placeholder="Stock" style={styles.masterInput} />
      <input type="number" min="0" step="any" value={draft.units_per_pallet} onChange={(event) => setDraft({ ...draft, units_per_pallet: event.target.value })} placeholder="Cant./Pallet" style={styles.masterInput} />
      <input value={draft.observation} onChange={(event) => setDraft({ ...draft, observation: event.target.value })} placeholder="Observación" style={styles.masterInputWide} />
      <button type="submit" disabled={saving} style={styles.loginButton}>{saving ? "Guardando..." : "Agregar producto"}</button>
    </form>}

    {error && <div style={styles.errorBannerInline}>{error}</div>}{message && <div style={styles.successBannerInline}>{message}</div>}
    {loading ? <LoadingPanel text="Cargando maestro..." /> : <div style={styles.masterTableWrap}><style>{`.master-v5 th{padding:10px 8px;background:#00C1C2;color:white;text-align:left;font-weight:900;white-space:nowrap}.master-v5 td{padding:9px 8px;border-bottom:1px solid #D8E0E7;vertical-align:top}`}</style><table className="master-v5" style={styles.masterTable}>
      <thead><tr><th>SKU</th><th>Descripción</th><th>Stock</th><th>Cant./Pallet</th><th>Pallets Eq.</th><th>Posiciones</th><th>Diferencia</th><th>Ubicaciones</th><th>Observación</th>{canEdit && <th>Acciones</th>}</tr></thead>
      <tbody>{rows.map((item) => {
        const editing = editingSku === item.sku;
        return <tr key={item.sku}>
          <td><strong>{item.sku}</strong></td>
          <td>{editing ? <input value={editDraft.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} style={styles.tableInput} /> : item.description || "—"}</td>
          <td>{editing ? <input type="number" min="0" step="any" value={editDraft.stock} onChange={(e) => setEditDraft({ ...editDraft, stock: e.target.value })} style={styles.tableInputSmall} /> : formatNumber(item.stock)}</td>
          <td>{editing ? <input type="number" min="0" step="any" value={editDraft.units_per_pallet} onChange={(e) => setEditDraft({ ...editDraft, units_per_pallet: e.target.value })} style={styles.tableInputSmall} /> : formatNumber(item.units)}</td>
          <td>{item.units > 0 ? item.pallets.toFixed(2) : "—"}</td>
          <td><strong>{item.assigned}</strong></td>
          <td><span style={{ ...styles.differenceBadge, ...(item.difference < -0.01 ? styles.diffNegative : item.difference > 0.01 ? styles.diffPositive : styles.diffBalanced) }}>{item.units > 0 ? signedNumber(item.difference) : "—"}</span></td>
          <td><div style={styles.locationList}>{item.locations.length ? summarizeLocations(item.locations).map((group) => <button key={group.target} type="button" onClick={() => onNavigate({ target: group.target, unit: group.unit, sku: item.sku })} style={styles.locationSummaryCard}><span style={styles.locationSummaryTop}><strong>{group.title}</strong><b>{group.count} pos.</b></span><span>{group.details}</span><small>{group.levels}</small></button>) : <span style={styles.mutedText}>Sin ubicación</span>}</div></td>
          <td>{editing ? <input value={editDraft.observation} onChange={(e) => setEditDraft({ ...editDraft, observation: e.target.value })} style={styles.tableInput} /> : item.observation || "—"}</td>
          {canEdit && <td><div style={styles.actionGroup}>{editing ? <><button type="button" onClick={(event) => saveProduct(event, { ...editDraft, sku: item.sku }, false)} style={styles.actionPrimary}>Guardar</button><button type="button" onClick={() => setEditingSku("")} style={styles.actionSecondary}>Cancelar</button></> : <><button type="button" onClick={() => onAssign(item.sku)} style={styles.assignmentButton}>Asignar posiciones</button><button type="button" onClick={() => { setEditingSku(item.sku); setEditDraft({ ...item, stock: item.stock, units_per_pallet: item.units }); }} style={styles.actionPrimary}>Editar</button>{isAdmin && <button type="button" onClick={() => deleteProduct(item.sku)} style={styles.actionDanger}>Eliminar</button>}</>}</div></td>}
        </tr>;
      })}{!rows.length && <tr><td colSpan={canEdit ? 10 : 9} style={styles.emptyTable}>No hay productos que coincidan con el filtro.</td></tr>}</tbody>
    </table></div>}
    {history.length > 0 && <details style={styles.historyPanel}><summary>Historial de importaciones</summary><div style={styles.historyList}>{history.map((item) => <div key={item.id} style={styles.historyRow}><strong>{item.import_type === "stock" ? "Stock" : "Maestro"}</strong><span>{item.file_name}</span><span>{new Date(item.created_at).toLocaleString("es-CL")}</span><span>{item.successful_rows}/{item.total_rows} correctas</span><span>{item.error_rows} errores</span></div>)}</div></details>}
  </Section>;
}

function SummaryCard({ label, value, warning }) {
  return <div style={{ ...styles.summaryCard, ...(warning ? styles.summaryCardWarning : {}) }}><strong>{value}</strong><span>{label}</span></div>;
}

function formatNumber(value) { return new Intl.NumberFormat("es-CL", { maximumFractionDigits: 2 }).format(Number(value) || 0); }
function signedNumber(value) { const number = Number(value) || 0; return `${number > 0 ? "+" : ""}${number.toFixed(2)}`; }

const rackPlacements = {
  rack1: { gridColumn: "1 / 13", gridRow: "1" },
  rack2: { gridColumn: "1 / 13", gridRow: "2" },
  rack3: { gridColumn: "1 / 13", gridRow: "3" },
  rack4: { gridColumn: "1 / 13", gridRow: "4" },
  rack5: { gridColumn: "1 / 13", gridRow: "5" },
  rack6: { gridColumn: "1 / 13", gridRow: "6" },
  rack7: { gridColumn: "1 / 13", gridRow: "7" },
  rack8: { gridColumn: "1 / 13", gridRow: "8" },
  rack9: { gridColumn: "1 / 13", gridRow: "9" },
  rack10: { gridColumn: "1 / 13", gridRow: "10" },
  rack11: { gridColumn: "1 / 13", gridRow: "11" },
};

const styles = {
  app: { minHeight: "100vh", padding: 28, background: COLORS.background, color: COLORS.text, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  header: { maxWidth: 1280, margin: "0 auto 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
  eyebrow: { margin: "0 0 6px", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800, letterSpacing: ".16em" },
  title: { margin: 0, fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.1 },
  subtitle: { margin: "10px 0 0", color: COLORS.muted, fontSize: 15 },
  version: { padding: "8px 12px", height: "fit-content", borderRadius: 999, background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800 },
  brandBlock: { minWidth: 250 },
  headerTools: { display: "flex", alignItems: "flex-start", justifyContent: "flex-end", gap: 12, flex: 1, flexWrap: "wrap" },
  searchWrap: { position: "relative", width: "min(430px, 100%)", zIndex: 15 },
  searchBox: { minHeight: 46, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", border: `1px solid ${COLORS.border}`, borderRadius: 13, background: "#FFFFFF", boxShadow: "0 7px 22px rgba(16,24,40,.06)" },
  searchIcon: { color: COLORS.turquoiseDark, fontSize: 23, lineHeight: 1, fontWeight: 900 },
  searchInput: { width: "100%", padding: "12px 0", border: 0, outline: "none", background: "transparent", color: COLORS.text, fontSize: 14, fontWeight: 650 },
  clearSearch: { width: 27, height: 27, display: "grid", placeItems: "center", border: 0, borderRadius: 8, background: "#EEF2F6", color: COLORS.muted, fontSize: 18, cursor: "pointer" },
  searchPanel: { position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, overflow: "hidden", border: `1px solid ${COLORS.border}`, borderRadius: 15, background: "#FFFFFF", boxShadow: "0 18px 44px rgba(16,24,40,.16)" },
  searchSummary: { padding: 15, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: "#F7FFFF", borderBottom: `1px solid ${COLORS.border}` },
  searchSummaryLabel: { display: "block", marginBottom: 3, color: COLORS.muted, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".08em" },
  searchSkuValue: { display: "block", color: COLORS.text, fontSize: 14 },
  positionCount: { minWidth: 80, padding: "7px 10px", display: "flex", alignItems: "baseline", justifyContent: "center", gap: 5, borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF" },
  resultList: { maxHeight: 255, overflowY: "auto", padding: 6 },
  resultItem: { width: "100%", padding: "10px 9px", display: "flex", alignItems: "center", gap: 10, border: 0, borderRadius: 9, background: "#FFFFFF", color: COLORS.text, textAlign: "left", cursor: "pointer" },
  resultMarker: { color: COLORS.turquoise, fontSize: 10 },
  resultText: { display: "grid", gap: 3, flex: 1 },
  resultArrow: { color: COLORS.turquoiseDark, fontSize: 22, fontWeight: 800 },
  noResults: { padding: 20, color: COLORS.muted, textAlign: "center", fontSize: 13 },
  searchLoading: { padding: 18, color: COLORS.muted, textAlign: "center", fontSize: 12 },
  skuDetailCard: { padding: 14, display: "grid", gap: 10, borderBottom: `1px solid ${COLORS.border}`, background: "#FFFFFF" },
  skuDescription: { color: COLORS.text, fontSize: 13, lineHeight: 1.35 },
  skuMetricsGrid: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 7 },
  searchMetric: { padding: "8px 9px", display: "grid", gap: 2, border: `1px solid ${COLORS.border}`, borderRadius: 9, background: "#F8FAFC" },
  searchMetricAlert: { borderColor: "#FDA29B", background: "#FFF1F1", color: "#B42318" },
  skuObservation: { padding: 8, borderRadius: 8, background: "#FFFAEB", color: "#93370D", fontSize: 10 },
  productMissing: { padding: 14, borderBottom: `1px solid ${COLORS.border}`, color: "#B42318", background: "#FFF7F7", fontSize: 11 },
  searchLocationSection: { padding: 10, display: "grid", gap: 7, background: "#FBFDFE" },
  searchLocationCard: { width: "100%", padding: "10px 11px", display: "flex", alignItems: "center", gap: 10, border: `1px solid ${COLORS.turquoise}`, borderRadius: 11, background: "#E7FBFB", color: COLORS.text, textAlign: "left", cursor: "pointer" },
  searchLocationIcon: { width: 28, height: 28, display: "grid", placeItems: "center", flex: "0 0 28px", borderRadius: 8, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 17 },
  searchLocationText: { display: "grid", gap: 2, flex: 1 },
  userCard: { minHeight: 46, padding: "5px 10px 5px 6px", display: "flex", alignItems: "center", gap: 9, border: `1px solid ${COLORS.border}`, borderRadius: 13, background: "#FFFFFF", boxShadow: "0 7px 22px rgba(16,24,40,.06)" },
  userAvatar: { width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 11, fontWeight: 900 },
  userText: { display: "grid", gap: 2, minWidth: 105, fontSize: 12 },
  onlineDot: { width: 8, height: 8, borderRadius: 999, background: "#22C55E", boxShadow: "0 0 0 3px #DCFCE7" },
  authPage: { minHeight: "100vh", padding: 24, display: "grid", placeItems: "center", background: "linear-gradient(145deg,#E7FBFB,#F3F6F8 55%,#FFFFFF)" },
  loginCard: { width: "min(390px,100%)", padding: 30, display: "grid", gap: 10, border: `1px solid ${COLORS.border}`, borderRadius: 20, background: "#FFFFFF", boxShadow: "0 24px 70px rgba(16,24,40,.14)" },
  loginMark: { width: 52, height: 52, display: "grid", placeItems: "center", borderRadius: 15, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 24, fontWeight: 900 },
  loginTitle: { margin: 0, fontSize: 28 },
  loginText: { margin: "0 0 10px", color: COLORS.muted, fontSize: 14 },
  fieldLabel: { marginTop: 5, color: COLORS.text, fontSize: 12, fontWeight: 800 },
  loginInput: { width: "100%", padding: "12px 13px", border: `1px solid ${COLORS.border}`, borderRadius: 10, outline: "none", boxSizing: "border-box", fontSize: 14 },
  loginButton: { marginTop: 10, padding: "12px 16px", border: 0, borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 14, fontWeight: 850, cursor: "pointer" },
  loginError: { padding: 10, borderRadius: 9, background: "#FFF1F1", color: "#B42318", fontSize: 12 },
  loginSuccess: { padding: 10, borderRadius: 9, background: "#ECFDF3", color: "#027A48", fontSize: 12 },
  linkButton: { padding: "8px 10px", border: 0, background: "transparent", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800, cursor: "pointer" },
  adminToolbar: { padding: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}` },
  adminHelp: { margin: "5px 0 0", color: COLORS.muted, fontSize: 12 },
  profileList: { marginTop: 16, display: "grid", gap: 10 },
  profileCard: { padding: 13, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#FBFDFE" },
  profileIdentity: { display: "flex", alignItems: "center", gap: 11 },
  profileAvatar: { width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 11, fontWeight: 900 },
  profileId: { maxWidth: 300, marginTop: 3, display: "block", overflow: "hidden", color: COLORS.muted, fontSize: 9, textOverflow: "ellipsis" },
  roleControl: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  roleBadge: { padding: "6px 9px", borderRadius: 999, fontSize: 10, fontWeight: 850 },
  roleSelect: { padding: "8px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 9, background: "#FFFFFF", color: COLORS.text, fontSize: 12, fontWeight: 700 },
  currentUserTag: { color: COLORS.turquoiseDark, fontSize: 10, fontWeight: 850 },
  permissionGrid: { marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 },
  permissionCard: { padding: 14, display: "grid", gap: 7, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#FFFFFF", color: COLORS.muted, fontSize: 11 },
  errorBannerInline: { marginTop: 12, padding: 10, borderRadius: 9, background: "#FFF1F1", color: "#B42318", fontSize: 12 },
  successBannerInline: { marginTop: 12, padding: 10, borderRadius: 9, background: "#ECFDF3", color: "#027A48", fontSize: 12 },
  loadingPanel: { minHeight: 240, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, border: `1px solid ${COLORS.border}`, borderRadius: 14, background: "#FFFFFF" },
  loadingCard: { padding: 26, display: "flex", alignItems: "center", gap: 12, borderRadius: 16, background: "#FFFFFF", boxShadow: "0 18px 50px rgba(16,24,40,.12)" },
  spinner: { width: 20, height: 20, border: "3px solid #DDF9F8", borderTopColor: COLORS.turquoiseDark, borderRadius: 999 },
  signOutButton: { padding: "7px 9px", border: `1px solid ${COLORS.border}`, borderRadius: 8, background: "#FFFFFF", color: COLORS.muted, fontSize: 11, fontWeight: 800, cursor: "pointer" },
  errorBanner: { maxWidth: 1280, margin: "0 auto 12px", padding: "10px 13px", border: "1px solid #FDA29B", borderRadius: 10, background: "#FFF1F1", color: "#B42318", fontSize: 12 },
  viewerBanner: { maxWidth: 1280, margin: "0 auto 12px", padding: "10px 13px", border: "1px solid #FEC84B", borderRadius: 10, background: "#FFFAEB", color: "#93370D", fontSize: 12 },
  errorDot: { background: "#EF4444", boxShadow: "0 0 0 3px #FEE2E2" },
  mainNav: { maxWidth: 1280, margin: "0 auto 18px", padding: 6, display: "flex", gap: 6, flexWrap: "wrap", background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 14, boxShadow: "0 8px 24px rgba(16,24,40,.05)" },
  mainTab: { padding: "11px 17px", border: 0, borderRadius: 10, background: "transparent", color: COLORS.muted, fontSize: 14, fontWeight: 750, cursor: "pointer" },
  mainTabActive: { background: COLORS.turquoise, color: "#fff", boxShadow: "0 5px 14px rgba(0,193,194,.24)" },
  content: { maxWidth: 1280, margin: "0 auto" },
  section: { padding: 24, background: COLORS.panel, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: "0 10px 28px rgba(16,24,40,.06)" },
  sectionHeader: { marginBottom: 18, display: "flex", justifyContent: "space-between", gap: 16 },
  sectionTitle: { margin: 0, fontSize: 25 },
  sectionDescription: { margin: "7px 0 0", color: COLORS.muted, fontSize: 14 },
  status: { padding: "6px 10px", height: "fit-content", borderRadius: 999, background: "#EEF2F6", color: COLORS.muted, fontSize: 11, fontWeight: 750, whiteSpace: "nowrap" },
  subNav: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18, paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` },
  subTab: { padding: "9px 14px", border: `1px solid ${COLORS.border}`, borderRadius: 9, background: "#fff", color: COLORS.muted, fontSize: 13, fontWeight: 750, cursor: "pointer" },
  subTabActive: { borderColor: COLORS.turquoise, background: "#E7FBFB", color: COLORS.turquoiseDark },
  fullLayoutArea: { border: `1px solid ${COLORS.border}`, borderRadius: 16, background: "#fff", overflow: "hidden" },
  layoutToolbar: { padding: 18, display: "flex", justifyContent: "space-between", gap: 16, alignItems: "flex-start", background: "#FBFDFE", borderBottom: `1px solid ${COLORS.border}` },
  areaTitle: { margin: "0 0 7px", fontSize: 20 },
  areaDescription: { margin: 0, color: COLORS.muted, fontSize: 14, lineHeight: 1.5 },
  summaryBadge: { padding: "7px 11px", borderRadius: 999, background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800, whiteSpace: "nowrap" },
  canvasScroller: { overflowX: "auto", padding: 18 },
  warehouseCanvas: { minWidth: 1080, display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gridAutoRows: "auto", rowGap: 22, alignItems: "start", padding: "4px 0 22px" },
  rackPlacement: { minWidth: 0 },
  warehouseRack: { width: "100%", display: "grid", gridTemplateColumns: "82px minmax(0, 1fr)", alignItems: "center" },
  rackName: { paddingRight: 12, textAlign: "right", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 900, letterSpacing: ".03em", whiteSpace: "nowrap" },
  rackMatrixWrap: { width: "100%", display: "flex", alignItems: "stretch" },
  rackMatrix: { width: "calc(100% - 64px)", display: "grid", border: `2px solid ${COLORS.turquoiseDark}`, borderRadius: "12px 0 0 12px", overflow: "hidden", background: "#fff", boxShadow: "0 5px 16px rgba(0,154,155,.09)" },
  matrixPositionHeader: { height: 28, display: "grid", placeItems: "center", background: COLORS.turquoise, color: "#FFFFFF", borderRight: "1px solid rgba(255,255,255,.38)", borderBottom: `1px solid ${COLORS.turquoiseDark}`, fontSize: 11, fontWeight: 900 },
  matrixCell: { width: "100%", height: 36, minWidth: 0, padding: "3px 4px", border: 0, borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, borderRadius: 0, outline: "none", textAlign: "center", color: "#101828", fontSize: 10, fontWeight: 700, boxSizing: "border-box" },
  matrixCellActive: { boxShadow: `inset 0 0 0 2px ${COLORS.turquoise}`, zIndex: 1 },
  levelThree: { background: "#DDF2F6" },
  levelTwo: { background: "#F9E8DF" },
  levelOne: { background: "#EEF4E5" },
  levelLabelsColumn: { width: 64, flex: "0 0 64px", display: "grid", gridTemplateRows: "28px repeat(3,36px)", border: `2px solid ${COLORS.turquoiseDark}`, borderLeft: 0, borderRadius: "0 12px 12px 0", overflow: "hidden", boxShadow: "0 5px 16px rgba(0,154,155,.09)" },
  levelSpacer: { background: COLORS.turquoise, borderBottom: `1px solid ${COLORS.turquoiseDark}` },
  matrixLevelLabel: { display: "grid", placeItems: "center", borderBottom: `1px solid ${COLORS.turquoiseDark}`, background: "#F7FFFF", color: COLORS.turquoiseDark, fontSize: 10, fontWeight: 800, whiteSpace: "nowrap" },
  driveArea: { border: `1px solid ${COLORS.border}`, borderRadius: 16, background: "#FFFFFF", overflow: "hidden" },
  driveGrid: { padding: 18, display: "grid", gridTemplateColumns: "repeat(2, minmax(460px, 1fr))", gap: 18, overflowX: "auto" },
  driveStreet: { minWidth: 460, overflow: "hidden", border: `2px solid ${COLORS.turquoiseDark}`, borderRadius: 14, background: "#FFFFFF", boxShadow: "0 6px 18px rgba(0,154,155,.09)" },
  driveStreetHeader: { padding: "10px 14px", background: COLORS.turquoise, color: "#FFFFFF", textAlign: "center", fontSize: 13, fontWeight: 900, letterSpacing: ".04em" },
  driveMatrixWrap: { overflowX: "auto" },
  driveMatrix: { minWidth: 450, display: "grid", gridTemplateColumns: "62px repeat(5, minmax(72px, 1fr))" },
  driveCorner: { minHeight: 30, display: "grid", placeItems: "center", background: COLORS.turquoiseDark, color: "#FFFFFF", borderRight: "1px solid rgba(255,255,255,.35)", borderBottom: `1px solid ${COLORS.turquoiseDark}`, fontSize: 9, fontWeight: 900 },
  driveDepthHeader: { minHeight: 30, display: "grid", placeItems: "center", background: "#DDF9F8", color: COLORS.turquoiseDark, borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, fontSize: 9, fontWeight: 900 },
  driveLevelLabel: { minHeight: 40, display: "grid", placeItems: "center", background: "#F7FFFF", color: COLORS.turquoiseDark, borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, fontSize: 11, fontWeight: 900 },
  driveCell: { width: "100%", minWidth: 0, minHeight: 40, padding: "4px 5px", border: 0, borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, borderRadius: 0, outline: "none", boxSizing: "border-box", textAlign: "center", color: COLORS.text, fontSize: 10, fontWeight: 700 },
  driveCellActive: { position: "relative", zIndex: 1, boxShadow: `inset 0 0 0 2px ${COLORS.turquoise}` },
  selectionTools: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 7, flexWrap: "wrap" },
  selectionButton: { padding: "7px 11px", border: `1px solid ${COLORS.turquoise}`, borderRadius: 9, background: "#FFFFFF", color: COLORS.turquoiseDark, fontSize: 11, fontWeight: 850, cursor: "pointer" },
  selectionButtonDanger: { padding: "7px 11px", border: "1px solid #F3A6A6", borderRadius: 9, background: "#FFF7F7", color: "#B42318", fontSize: 11, fontWeight: 850, cursor: "pointer" },
  multiSelectedCell: { position: "relative", zIndex: 2, background: "#BDF5F4", boxShadow: `inset 0 0 0 2px ${COLORS.turquoiseDark}` },
  assignmentBanner: { padding: "11px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", background: "#DDF9F8", borderBottom: `1px solid ${COLORS.turquoise}` },
  assignmentButton: { padding: "7px 10px", border: 0, borderRadius: 8, background: COLORS.turquoiseDark, color: "#FFFFFF", fontSize: 10, fontWeight: 850, cursor: "pointer" },
  importButton: { padding: "8px 11px", borderRadius: 8, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 11, fontWeight: 850, cursor: "pointer" },
  importButtonStock: { padding: "8px 11px", borderRadius: 8, background: "#172033", color: "#FFFFFF", fontSize: 11, fontWeight: 850, cursor: "pointer" },
  importPreview: { marginBottom: 14, padding: 14, display: "grid", gap: 10, border: `1px solid ${COLORS.turquoise}`, borderRadius: 12, background: "#F7FFFF" },
  importStats: { display: "flex", gap: 8, flexWrap: "wrap" },
  importErrors: { marginTop: 8, maxHeight: 150, overflowY: "auto", display: "grid", gap: 4, color: "#B42318", fontSize: 11 },
  historyPanel: { marginTop: 14, padding: 12, border: `1px solid ${COLORS.border}`, borderRadius: 10, background: "#FBFDFE" },
  historyList: { marginTop: 10, display: "grid", gap: 6 },
  historyRow: { padding: 8, display: "grid", gridTemplateColumns: "80px minmax(160px,1fr) 160px 110px 80px", gap: 8, borderBottom: `1px solid ${COLORS.border}`, fontSize: 10 },
  masterSummary: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 10, marginBottom: 14 },
  summaryCard: { padding: 14, display: "grid", gap: 3, border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#F7FFFF" },
  summaryCardWarning: { background: "#FFFAEB", borderColor: "#FEC84B" },
  masterToolbar: { marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" },
  masterSearch: { minWidth: 280, flex: 1, padding: "10px 12px", border: `1px solid ${COLORS.border}`, borderRadius: 9, outline: "none" },
  newProductForm: { marginBottom: 14, padding: 14, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", border: `1px solid ${COLORS.border}`, borderRadius: 12, background: "#FBFDFE" },
  formTitle: { width: "100%", fontSize: 13 },
  masterInput: { width: 130, padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, boxSizing: "border-box" },
  masterInputWide: { minWidth: 210, flex: 1, padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 8, boxSizing: "border-box" },
  masterTableWrap: { overflowX: "auto", border: `1px solid ${COLORS.border}`, borderRadius: 12 },
  masterTable: { width: "100%", minWidth: 1380, borderCollapse: "collapse", background: "#FFFFFF", fontSize: 11 },
  tableInput: { width: "100%", minWidth: 130, padding: "7px 8px", border: `1px solid ${COLORS.turquoise}`, borderRadius: 7, boxSizing: "border-box" },
  tableInputSmall: { width: 88, padding: "7px 8px", border: `1px solid ${COLORS.turquoise}`, borderRadius: 7, boxSizing: "border-box" },
  differenceBadge: { padding: "5px 7px", borderRadius: 999, fontSize: 10, fontWeight: 850, whiteSpace: "nowrap" },
  diffNegative: { background: "#FEE4E2", color: "#B42318" }, diffPositive: { background: "#ECFDF3", color: "#027A48" }, diffBalanced: { background: "#E7F6EC", color: "#166534" },
  locationList: { minWidth: 210, maxWidth: 280, display: "grid", gap: 6 },
  focusedUnit: { scrollMarginTop: "120px", borderRadius: 14, boxShadow: `0 0 0 4px rgba(0,193,194,.35), 0 12px 28px rgba(0,154,155,.18)` },
  focusedSkuCell: { position: "relative", zIndex: 3, background: "#FFF3BF", boxShadow: "inset 0 0 0 2px #F59E0B" },
  locationSummaryCard: { width: "100%", padding: "8px 10px", display: "grid", gap: 3, border: `1px solid ${COLORS.turquoise}`, borderRadius: 10, background: "#E7FBFB", color: COLORS.turquoiseDark, textAlign: "left", fontSize: 10, cursor: "pointer" },
  locationSummaryTop: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 },
  mutedText: { color: COLORS.muted, fontSize: 10 }, actionGroup: { display: "flex", gap: 5, flexWrap: "wrap" },
  actionPrimary: { padding: "6px 8px", border: 0, borderRadius: 7, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 10, fontWeight: 800, cursor: "pointer" },
  actionSecondary: { padding: "6px 8px", border: `1px solid ${COLORS.border}`, borderRadius: 7, background: "#FFFFFF", color: COLORS.muted, fontSize: 10, fontWeight: 800, cursor: "pointer" },
  actionDanger: { padding: "6px 8px", border: "1px solid #FDA29B", borderRadius: 7, background: "#FFF1F1", color: "#B42318", fontSize: 10, fontWeight: 800, cursor: "pointer" },
  emptyTable: { padding: 28, textAlign: "center", color: COLORS.muted },
  placeholder: { minHeight: 220, padding: 28, display: "flex", alignItems: "flex-start", gap: 16, border: `1px dashed ${COLORS.border}`, borderRadius: 14, background: "#FBFDFE" },
  placeholderCode: { width: 50, height: 50, flex: "0 0 50px", display: "grid", placeItems: "center", borderRadius: 14, background: COLORS.turquoise, color: "#fff", fontWeight: 850 },
  pending: { marginTop: 18, color: COLORS.turquoiseDark, fontSize: 13, fontWeight: 750 },
};
