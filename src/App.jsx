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

const ENVASE_STREETS = [
  { id: 1, sku: "20104232", streetOrder: 1, capacity: 42, footprints: 14, levels: 3, zone: "superior" },
  { id: 2, sku: "20104232", streetOrder: 2, capacity: 42, footprints: 14, levels: 3, zone: "superior" },
  { id: 3, sku: "20103258", streetOrder: 1, capacity: 40, footprints: 20, levels: 2, zone: "superior" },
  { id: 4, sku: "20103258", streetOrder: 2, capacity: 40, footprints: 20, levels: 2, zone: "superior" },
  { id: 5, sku: "20103258", streetOrder: 3, capacity: 40, footprints: 20, levels: 2, zone: "superior" },
  { id: 6, sku: "20103258", streetOrder: 4, capacity: 20, footprints: 10, levels: 2, zone: "superior" },
  { id: 7, sku: "20103258", streetOrder: 5, capacity: 20, footprints: 10, levels: 2, zone: "superior" },
  { id: 8, sku: "20103244", streetOrder: 1, capacity: 20, footprints: 10, levels: 2, zone: "central" },
  { id: 9, sku: "20103244", streetOrder: 2, capacity: 20, footprints: 10, levels: 2, zone: "central" },
  { id: 10, sku: "20103243", streetOrder: 1, capacity: 20, footprints: 10, levels: 2, zone: "central" },
  { id: 11, sku: "20103243", streetOrder: 2, capacity: 20, footprints: 10, levels: 2, zone: "central" },
  { id: 12, sku: "20103249", streetOrder: 1, capacity: 20, footprints: 10, levels: 2, zone: "central" },
  { id: 13, sku: "20103238", streetOrder: 1, capacity: 7, footprints: 4, levels: 2, zone: "patio", blocked: ["2-4"] },
  { id: 14, sku: "20103238", streetOrder: 2, capacity: 7, footprints: 4, levels: 2, zone: "patio", blocked: ["2-4"] },
  { id: 15, sku: "20103238", streetOrder: 3, capacity: 7, footprints: 4, levels: 2, zone: "patio", blocked: ["2-4"] },
  { id: 16, sku: "20103260", streetOrder: 1, capacity: 12, footprints: 6, levels: 2, zone: "patio" },
  { id: 17, sku: "20103260", streetOrder: 2, capacity: 14, footprints: 7, levels: 2, zone: "patio" },
  { id: 18, sku: "20103260", streetOrder: 3, capacity: 14, footprints: 7, levels: 2, zone: "patio" },
  { id: 19, sku: "20103260", streetOrder: 4, capacity: 14, footprints: 7, levels: 2, zone: "patio" },
  { id: 20, sku: "20103260", streetOrder: 5, capacity: 10, footprints: 5, levels: 2, zone: "patio" },
  { id: 21, sku: "20103266", streetOrder: 1, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 22, sku: "20103266", streetOrder: 2, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 23, sku: "20103109", streetOrder: 1, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 24, sku: "20103109", streetOrder: 2, capacity: 14, footprints: 7, levels: 2, zone: "patio" },
  { id: 25, sku: "20103261", streetOrder: 1, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 26, sku: "20103261", streetOrder: 2, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 27, sku: "20103261", streetOrder: 3, capacity: 16, footprints: 8, levels: 2, zone: "patio" },
  { id: 28, sku: "20103248", streetOrder: 1, capacity: 16, footprints: 8, levels: 2, zone: "derecho" },
  { id: 29, sku: "20103248", streetOrder: 2, capacity: 16, footprints: 8, levels: 2, zone: "derecho" },
  { id: 30, sku: "20103236", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 31, sku: "20103236", streetOrder: 2, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 32, sku: "20103241", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 33, sku: "20103241", streetOrder: 2, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 34, sku: "20103171", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 35, sku: "20101418", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "derecho" },
  { id: 36, sku: "20103237", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "central" },
  { id: 37, sku: "20103237", streetOrder: 2, capacity: 18, footprints: 9, levels: 2, zone: "central" },
  { id: 38, sku: "20103239", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "central" },
  { id: 39, sku: "20103235", streetOrder: 1, capacity: 18, footprints: 9, levels: 2, zone: "central" },
  { id: 40, sku: "20103113", streetOrder: 1, capacity: 12, footprints: 6, levels: 2, zone: "central" },
];

const ENV_MAP_BLOCKS = [
  { sku: "20104232", capacity: 84, x: "61%", y: "1%", w: "38%", h: "7%", color: "#4B5D73", text: "#99E64D" },
  { sku: "20103258", capacity: 160, x: "47%", y: "9%", w: "52%", h: "13%", color: "#337DB6" },
  { sku: "20103244", capacity: 40, x: "41%", y: "27%", w: "28%", h: "6%", color: "#548638" },
  { sku: "20103243", capacity: 40, x: "41%", y: "35%", w: "28%", h: "6%", color: "#FFF600" },
  { sku: "20103249", capacity: 20, x: "41%", y: "43%", w: "28%", h: "5%", color: "#3E3D91", text: "#FFFFFF" },
  { sku: "20103113", capacity: 12, x: "75%", y: "22%", w: "24%", h: "6%", color: "#D4A000", text: "#FFFFFF" },
  { sku: "20103235", capacity: 18, x: "75%", y: "30%", w: "24%", h: "6%", color: "#F48A3A" },
  { sku: "20103239", capacity: 18, x: "75%", y: "38%", w: "24%", h: "6%", color: "#C7C8FA" },
  { sku: "20103237", capacity: 36, x: "75%", y: "46%", w: "24%", h: "6%", color: "#C7C8FA" },
  { sku: "20101418", capacity: 18, x: "75%", y: "54%", w: "24%", h: "6%", color: "#F37D2F" },
  { sku: "20103171", capacity: 18, x: "75%", y: "62%", w: "24%", h: "5%", color: "#FFFFFF", text: "#E31C23" },
  { sku: "20103241", capacity: 36, x: "75%", y: "74%", w: "24%", h: "6%", color: "#7134A5", text: "#FFFFFF" },
  { sku: "20103236", capacity: 36, x: "75%", y: "82%", w: "24%", h: "6%", color: "#12A8D7" },
  { sku: "20103248", capacity: 32, x: "78%", y: "90%", w: "21%", h: "5%", color: "#F08EEA" },
  { sku: "20103238", capacity: 21, x: "0.5%", y: "57%", w: "8%", h: "19%", color: "#598D38", text: "#FFFFFF" },
  { sku: "20103260", capacity: 64, x: "11%", y: "57%", w: "20%", h: "19%", color: "#0FA5D2" },
  { sku: "20103266", capacity: 32, x: "36%", y: "57%", w: "8%", h: "19%", color: "#D66A00" },
  { sku: "20103109", capacity: 30, x: "47%", y: "57%", w: "8%", h: "19%", color: "#FFE59A" },
  { sku: "20103261", capacity: 48, x: "58%", y: "57%", w: "12%", h: "19%", color: "#99D500" },
];


export default function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [syncState, setSyncState] = useState("idle");
  const [appError, setAppError] = useState("");
  const [desktopNotifications, setDesktopNotifications] = useState(() => localStorage.getItem("demaria-stock-notifications") === "on" && "Notification" in window && Notification.permission === "granted");
  const [mainTab, setMainTab] = useState("home");
  const [sub70, setSub70] = useState("racks");
  const [sub60, setSub60] = useState("envases");
    const [subVirgo, setSubVirgo] = useState("corrugados");
    const [warehouseMenuOpen, setWarehouseMenuOpen] = useState(true);
    const [openWarehouse, setOpenWarehouse] = useState("b70");
  const [searchSku, setSearchSku] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchProduct, setSearchProduct] = useState(null);
  const [searchProductLoading, setSearchProductLoading] = useState(false);
  const [assignmentSku, setAssignmentSku] = useState("");
  const [focusLocation, setFocusLocation] = useState(null);
  const [rackCells, setRackCells] = useState({});
  const [driveCells, setDriveCells] = useState({});
  const [envaseCells, setEnvaseCells] = useState({});
  const hydratedRef = useRef(false);
  const previousRackRef = useRef({});
  const previousDriveRef = useRef({});
  const previousEnvaseRef = useRef({});

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
        setEnvaseCells({});
        hydratedRef.current = false;
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function toggleDesktopNotifications() {
    if (!desktopNotifications && "Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;
    }
    setDesktopNotifications((current) => {
      localStorage.setItem("demaria-stock-notifications", current ? "off" : "on");
      return !current;
    });
  }

  useEffect(() => {
    if (!session?.user || !desktopNotifications) return;
    const channel = supabase.channel(`stock-alerts-${session.user.id}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "stock_movement_alerts" }, ({ new: alert }) => {
      if ("Notification" in window && Notification.permission === "granted") {
        const sign = alert.movement_type === "in" ? "+" : "-";
        new Notification(`Movimiento de stock · SKU ${alert.sku}`, { body: `${sign}${formatNumber(alert.quantity)} unidades · ${alert.operator_name}`, tag: `stock-${alert.movement_id}` });
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session?.user?.id, desktopNotifications]);

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function loadApplicationData() {
      setDataLoading(true);
      setAppError("");

      const [profileResult, locationsResult] = await Promise.all([
        supabase.from("profiles").select("display_name, role, can_adjust_stock").eq("id", session.user.id).single(),
        supabase
          .from("warehouse_locations")
          .select("area, unit_number, level, position, sku")
          .in("warehouse", ["70", "60"])
          .in("area", ["racks_selectivos", "drive_in", "envases"]),
      ]);

      if (cancelled) return;
      if (profileResult.error) setAppError(profileResult.error.message);
      if (locationsResult.error) setAppError(locationsResult.error.message);

      setProfile(profileResult.data ?? { display_name: session.user.email, role: "viewer" });

      const nextRacks = {};
      const nextDrive = {};
      const nextEnvases = {};
      (locationsResult.data ?? []).forEach((row) => {
        const key = `${row.unit_number}-${row.level}-${row.position}`;
        if (row.area === "racks_selectivos") nextRacks[key] = row.sku;
        if (row.area === "drive_in") nextDrive[key] = row.sku;
        if (row.area === "envases") nextEnvases[key] = row.sku;
      });

      previousRackRef.current = nextRacks;
      previousDriveRef.current = nextDrive;
      previousEnvaseRef.current = nextEnvases;
      setRackCells(nextRacks);
      setDriveCells(nextDrive);
      setEnvaseCells(nextEnvases);
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

  useEffect(() => {
    if (!hydratedRef.current || !session?.user || !canEdit) return;
    const timer = window.setTimeout(() => syncArea("envases", envaseCells, previousEnvaseRef, "60"), 650);
    return () => window.clearTimeout(timer);
  }, [envaseCells, session?.user?.id, canEdit]);

  async function syncArea(area, currentCells, previousRef, warehouse = "70") {
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
          warehouse,
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
          .eq("warehouse", warehouse)
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
        ...Object.entries(envaseCells)
          .filter(([, sku]) => String(sku).toLowerCase().includes(normalizedSearch))
          .map(([key, sku]) => {
            const [street, level, position] = key.split("-");
            return { id: `envase-${key}`, sku, area: "Envases", coordinate: `ENV-C${String(street).padStart(2, "0")} · N${level} · P${position}`, target: "envases", unit: Number(street), level: Number(level), slot: Number(position) };
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
    if (result.target === "envases") {
      setMainTab("b60");
      setSub60("envases");
    } else {
      setMainTab("b70");
      setSub70(result.target);
    }
    setSearchOpen(false);
  }

  if (authLoading) return <LoadingScreen text="Verificando sesión..." />;
  if (recoveryMode && session) return <PasswordRecoveryScreen onComplete={() => setRecoveryMode(false)} />;
  if (!session) return <LoginScreen />;
  if (dataLoading || !profile) return <LoadingScreen text="Cargando ubicaciones..." />;

  const displayName = profile.display_name || session.user.email || "Usuario";
  const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const roleLabel = profile.role === "admin" ? "Administrador" : profile.role === "editor" ? "Editor" : profile.role === "operator" ? "Operador" : "Viewer";
  if (profile.role === "operator") return <OperatorMobile profile={profile} rackCells={rackCells} driveCells={driveCells} envaseCells={envaseCells} onSignOut={() => supabase.auth.signOut()} desktopNotifications={desktopNotifications} onToggleNotifications={toggleDesktopNotifications} />;

  return (
    <div
      style={styles.app}
      onMouseDown={(event) => {
        const clickedStorageCell = event.target.closest?.('[data-storage-cell="true"]');
        const clickedSearch = event.target.closest?.('[data-search-ui="true"]');
        if (!clickedStorageCell && !clickedSearch) setFocusLocation(null);
      }}
    >
      <header style={styles.header}>
        <div style={styles.brandBlock}>
          <img src={`${import.meta.env.BASE_URL}demaria-logo.png`} alt="Demaria 1896" style={styles.headerLogo} />
          <strong style={styles.systemTitle}>SISTEMA DE GESTIÓN DE BODEGAS</strong>
        </div>
        <div style={styles.headerTools}>
          <div style={styles.searchWrap} data-search-ui="true">
            <div style={styles.searchBox}>
              <span style={styles.searchIcon}>⌕</span>
              <input value={searchSku} onChange={(event) => {
                  const value = event.target.value;
                  setSearchSku(value);
                  setSearchOpen(Boolean(value.trim()));
                  if (!value.trim()) setFocusLocation(null);
                }} onFocus={() => setSearchOpen(true)} placeholder="Buscar SKU" aria-label="Buscar SKU" style={styles.searchInput} />
              {searchSku && <button type="button" onClick={() => { setSearchSku(""); setSearchOpen(false); setFocusLocation(null); }} style={styles.clearSearch} aria-label="Limpiar búsqueda">×</button>}
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
                      <SearchMetric label="Utilización" value={searchAssigned > 0 && searchUnitsPerPallet > 0 ? `${searchUtilization.toFixed(1)}%${searchUtilization > 100 ? "  !" : ""}` : "—"} alert={searchUtilization > 100} />
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
          <div style={styles.userControlStack}><div style={styles.userCard}>
            <div style={styles.userAvatar}>{initials || "US"}</div>
            <div style={styles.userText}><strong>{displayName}</strong><span>{roleLabel} · {syncState === "saving" ? "Guardando..." : syncState === "saved" ? "Guardado" : syncState === "error" ? "Error al guardar" : "En línea"}</span></div>
            <span style={{ ...styles.onlineDot, ...(syncState === "error" ? styles.errorDot : {}) }} />
            <button type="button" onClick={() => supabase.auth.signOut()} style={styles.signOutButton}>Salir</button>
          </div><label style={styles.desktopNotificationToggle}><input type="checkbox" checked={desktopNotifications} onChange={toggleDesktopNotifications} /><span>Alertas de stock en este equipo</span></label></div>
        </div>
      </header>

      {appError && <div style={styles.errorBanner}>{appError}</div>}
      {!canEdit && <div style={styles.viewerBanner}>Modo Viewer: puedes consultar y buscar, pero no modificar ubicaciones.</div>}

      <div style={styles.applicationBody}>
        <aside style={styles.sideNav}>
          <button type="button" onClick={() => setMainTab("home")} style={{ ...styles.sideNavRoot, ...(mainTab === "home" ? styles.sideNavActive : {}) }}><span>⌂</span><strong>Inicio</strong></button>
          <button type="button" onClick={() => setWarehouseMenuOpen((value) => !value)} style={styles.sideNavRoot}><span>▦</span><strong>Bodegas</strong><b>{warehouseMenuOpen ? "⌃" : "⌄"}</b></button>
          {warehouseMenuOpen && <div style={styles.sideTree}>
            <SidebarWarehouse title="Bodega 70" open={openWarehouse === "b70"} onToggle={() => setOpenWarehouse(openWarehouse === "b70" ? "" : "b70")}>
              <SidebarLink active={mainTab === "b70" && sub70 === "racks"} onClick={() => { setMainTab("b70"); setSub70("racks"); }}>Racks Selectivos</SidebarLink>
              <SidebarLink active={mainTab === "b70" && sub70 === "drive"} onClick={() => { setMainTab("b70"); setSub70("drive"); }}>Racks Drive In</SidebarLink>
              <SidebarLink active={mainTab === "b70" && sub70 === "altillo"} onClick={() => { setMainTab("b70"); setSub70("altillo"); }}>Altillo</SidebarLink>
            </SidebarWarehouse>
            <SidebarWarehouse title="Bodega 60" open={openWarehouse === "b60"} onToggle={() => setOpenWarehouse(openWarehouse === "b60" ? "" : "b60")}>
              <SidebarLink active={mainTab === "b60" && sub60 === "envases"} onClick={() => { setMainTab("b60"); setSub60("envases"); }}>Envases</SidebarLink>
              <SidebarLink active={mainTab === "b60" && sub60 === "adhesivas"} onClick={() => { setMainTab("b60"); setSub60("adhesivas"); }}>Etiquetas Adhesivas</SidebarLink>
              <SidebarLink active={mainTab === "b60" && sub60 === "tc"} onClick={() => { setMainTab("b60"); setSub60("tc"); }}>Etiquetas TC</SidebarLink>
              <SidebarLink active={mainTab === "b60" && sub60 === "drive60"} onClick={() => { setMainTab("b60"); setSub60("drive60"); }}>Racks Drive In</SidebarLink>
            </SidebarWarehouse>
            <SidebarWarehouse title="Bodega Virgo 2" open={openWarehouse === "virgo"} onToggle={() => setOpenWarehouse(openWarehouse === "virgo" ? "" : "virgo")}>
              <SidebarLink active={mainTab === "virgo" && subVirgo === "corrugados"} onClick={() => { setMainTab("virgo"); setSubVirgo("corrugados"); }}>Corrugados</SidebarLink>
              <SidebarLink active={mainTab === "virgo" && subVirgo === "corrosiva"} onClick={() => { setMainTab("virgo"); setSubVirgo("corrosiva"); }}>Bodega Corrosiva</SidebarLink>
              <SidebarLink active={mainTab === "virgo" && subVirgo === "inflamable"} onClick={() => { setMainTab("virgo"); setSubVirgo("inflamable"); }}>Bodega Inflamable</SidebarLink>
            </SidebarWarehouse>
          </div>}
          <div style={styles.sideNavDivider} />
          <button type="button" onClick={() => setMainTab("master")} style={{ ...styles.sideNavRoot, ...(mainTab === "master" ? styles.sideNavActive : {}) }}><span>▤</span><strong>Maestro de Productos</strong></button>
          {profile.role === "admin" && <><button type="button" onClick={() => setMainTab("admin")} style={{ ...styles.sideNavRoot, ...(mainTab === "admin" ? styles.sideNavActive : {}) }}><span>⚙</span><strong>Administración</strong></button><button type="button" onClick={() => setMainTab("notifications")} style={{ ...styles.sideNavRoot, ...(mainTab === "notifications" ? styles.sideNavActive : {}) }}><span>●</span><strong>Notificaciones</strong></button></>}
        </aside>
        <main style={styles.mainWorkspace}>
          {mainTab === "home" && <HomeDashboard displayName={displayName} profile={profile} onNavigate={(target, sub) => { setMainTab(target); if (target === "b70") setSub70(sub); if (target === "b60") setSub60(sub); if (target === "virgo") setSubVirgo(sub); }} />}
          {mainTab === "b70" && <Bodega70 activeTab={sub70} onTabChange={setSub70} rackCells={rackCells} setRackCells={setRackCells} driveCells={driveCells} setDriveCells={setDriveCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={() => setAssignmentSku("")} focusLocation={focusLocation} />}
          {mainTab === "b60" && <Bodega60 activeTab={sub60} onTabChange={setSub60} envaseCells={envaseCells} setEnvaseCells={setEnvaseCells} canEdit={canEdit} focusLocation={focusLocation} />}
          {mainTab === "virgo" && <BodegaVirgo2 activeTab={subVirgo} onTabChange={setSubVirgo} />}
          {mainTab === "master" && <MaestroProductos rackCells={rackCells} driveCells={driveCells} envaseCells={envaseCells} canEdit={canEdit} isAdmin={profile.role === "admin"} userId={session.user.id} onNavigate={(location) => { setFocusLocation(location); if (location.target === "envases") { setMainTab("b60"); setSub60("envases"); } else { setMainTab("b70"); setSub70(location.target); } }} onAssign={(sku) => { setAssignmentSku(sku); setMainTab("b70"); setSub70("racks"); }} />}
          {mainTab === "admin" && profile.role === "admin" && <AdminProfiles currentUserId={session.user.id} />}
          {mainTab === "notifications" && profile.role === "admin" && <StockNotifications currentUserId={session.user.id} />}
        </main>
      </div>
    </div>
  );
}

function SidebarWarehouse({ title, open, onToggle, children }) {
  return <div><button type="button" onClick={onToggle} style={styles.sideWarehouseButton}><span>{open ? "▾" : "▸"}</span><strong>{title}</strong></button>{open && <div style={styles.sideWarehouseChildren}>{children}</div>}</div>;
}
function SidebarLink({ active, onClick, children }) {
  return <button type="button" onClick={onClick} style={{ ...styles.sideLink, ...(active ? styles.sideLinkActive : {}) }}>{children}</button>;
}
function HomeDashboard() {
  return <section style={styles.homeDashboard}>
    <div style={styles.homeHero}>
      <img src={`${import.meta.env.BASE_URL}home-hero.png`} alt="Áreas logísticas y bodegas Demaría" style={styles.homeHeroImage} />
    </div>
    <section style={styles.brandStripSection} aria-label="Marcas Demaría">
      <img src={`${import.meta.env.BASE_URL}brand-logos.png`} alt="Virginia, Virginia Pro, Brillina, Arom, Igenix, Team, Deyco, D-70, Killer y Deliciosa" style={styles.brandStripImage} />
    </section>
  </section>;
}


function OperatorMobile({ profile, rackCells, driveCells, envaseCells, onSignOut, desktopNotifications, onToggleNotifications }) {
  const [sku, setSku] = useState("");
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [movementMode, setMovementMode] = useState("in");
  const [movementQuantity, setMovementQuantity] = useState("");
  const [documentType, setDocumentType] = useState("guia_despacho");
  const [documentNumber, setDocumentNumber] = useState("");
  const [movementSaving, setMovementSaving] = useState(false);
  const [movementMessage, setMovementMessage] = useState("");
  const [movementError, setMovementError] = useState("");
  const normalizedSku = sku.trim();

  const locations = normalizedSku ? [
    ...Object.entries(rackCells).filter(([, value]) => String(value || "").trim() === normalizedSku).map(([key]) => { const [rack, level, position] = key.split("-"); return { warehouse: "Bodega 70", area: "Racks Selectivos", group: `Rack ${rack}` }; }),
    ...Object.entries(driveCells).filter(([, value]) => String(value || "").trim() === normalizedSku).map(([key]) => { const [street, level, depth] = key.split("-"); return { warehouse: "Bodega 70", area: "Drive In", group: `Calle ${String(street).padStart(2,"0")}` }; }),
    ...Object.entries(envaseCells).filter(([, value]) => String(value || "").trim() === normalizedSku).map(([key]) => { const [street, level, position] = key.split("-"); return { warehouse: "Bodega 60", area: "Envases", group: `Calle ${String(street).padStart(2,"0")}` }; }),
  ] : [];
  const assigned = locations.length;
  const stock = Number(product?.stock) || 0;
  const palletizing = Number(product?.units_per_pallet) || 0;
  const pallets = palletizing > 0 ? stock / palletizing : 0;
  const free = palletizing > 0 ? Math.max(assigned - Math.ceil(pallets), 0) : null;
  const overstock = assigned > 0 && palletizing > 0 && pallets > assigned;
  const grouped = Object.values(locations.reduce((acc, item) => {
    const key = `${item.warehouse}|${item.area}|${item.group}`;
    if (!acc[key]) acc[key] = item;
    return acc;
  }, {}));

  async function searchOperatorSku(event) {
    event?.preventDefault();
    if (!/^\d{8}$/.test(normalizedSku)) { setProduct(null); setSearched(true); return; }
    setLoading(true); setSearched(true);
    const { data } = await supabase.from("products").select("sku, description, stock, units_per_pallet").eq("sku", normalizedSku).maybeSingle();
    setProduct(data ?? null); setLoading(false);
  }

  async function submitStockMovement(event) {
    event.preventDefault();
    setMovementError(""); setMovementMessage("");
    const quantity = Number(movementQuantity);
    if (!Number.isInteger(quantity) || quantity <= 0) return setMovementError("La cantidad debe ser un número entero mayor que cero.");
    if (!/^\d+$/.test(documentNumber)) return setMovementError("El número de documento debe contener solo números.");
    if (movementMode === "out" && quantity > stock) return setMovementError(`No puedes quitar más de ${formatNumber(stock)} unidades.`);
    const action = movementMode === "in" ? "agregar" : "quitar";
    if (!window.confirm(`¿Confirmar ${action} ${formatNumber(quantity)} unidades al SKU ${product.sku}?`)) return;
    setMovementSaving(true);
    const result = await supabase.rpc("operator_adjust_stock", { target_sku: product.sku, movement: movementMode, movement_quantity: quantity, doc_type: documentType, doc_number: documentNumber });
    if (result.error) setMovementError(result.error.message);
    else {
      const row = Array.isArray(result.data) ? result.data[0] : result.data;
      const nextStock = Number(row?.new_stock);
      setProduct((current) => ({ ...current, stock: nextStock }));
      setMovementMessage(`Movimiento registrado. Nuevo stock: ${formatNumber(nextStock)} unidades.`);
      setMovementQuantity(""); setDocumentNumber("");
    }
    setMovementSaving(false);
  }

  return <div style={styles.operatorShell}>
    <header style={styles.operatorHeader}>
      <div><span style={styles.operatorBrand}>DEMΛRIA</span><small>Consulta de bodega</small></div>
      <div style={styles.operatorHeaderActions}><label style={styles.operatorNotificationToggle}><input type="checkbox" checked={desktopNotifications} onChange={onToggleNotifications} /> Alertas</label><button type="button" onClick={onSignOut} style={styles.operatorLogout}>Salir</button></div>
    </header>
    <main style={styles.operatorMain}>
      <div style={styles.operatorWelcome}><span>Perfil Operador</span><strong>{profile.display_name || "Operador"}</strong><p>Ingresa un SKU para consultar stock y ubicación.</p></div>
      <form onSubmit={searchOperatorSku} style={styles.operatorSearchForm}>
        <label htmlFor="operator-sku">Código SKU</label>
        <div style={styles.operatorSearchRow}><input id="operator-sku" inputMode="numeric" autoComplete="off" maxLength={8} value={sku} onChange={(event) => { setSku(event.target.value.replace(/\D/g, "")); setSearched(false); }} placeholder="Ej. 10803048" style={styles.operatorSearchInput} /><button type="submit" style={styles.operatorSearchButton}>Buscar</button></div>
      </form>
      {loading && <div style={styles.operatorStatus}>Consultando SKU…</div>}
      {!loading && searched && !product && <div style={styles.operatorNotFound}><strong>SKU no encontrado</strong><span>Revisa que el código tenga 8 dígitos y exista en el Maestro.</span></div>}
      {!loading && product && <section style={styles.operatorResult}>
        <div style={styles.operatorProductHead}><span>SKU {product.sku}</span><h1>{product.description || "Sin descripción registrada"}</h1></div>
        {overstock && <div style={styles.operatorOverstock}>! Sobrestock: el stock supera las posiciones asignadas.</div>}
        <div style={styles.operatorMetricGrid}>
          <OperatorMetric label="Stock" value={`${formatNumber(stock)} un.`} />
          <OperatorMetric label="Palletizado" value={palletizing > 0 ? `${formatNumber(palletizing)} un./pallet` : "Sin registro"} />
          <OperatorMetric label="Posiciones asignadas" value={assigned} />
          <OperatorMetric label="Posiciones libres" value={free === null ? "—" : free} alert={overstock} />
        </div>
        {profile.can_adjust_stock && <form onSubmit={submitStockMovement} style={styles.operatorMovementCard}>
          <div><span style={styles.searchSummaryLabel}>Control autorizado</span><h2>Movimiento de stock</h2></div>
          <div style={styles.operatorMovementTabs}><button type="button" onClick={() => setMovementMode("in")} style={movementMode === "in" ? styles.operatorMovementActiveIn : styles.operatorMovementTab}>Agregar stock</button><button type="button" onClick={() => setMovementMode("out")} style={movementMode === "out" ? styles.operatorMovementActiveOut : styles.operatorMovementTab}>Quitar stock</button></div>
          <label style={styles.operatorField}>Cantidad de unidades<input inputMode="numeric" value={movementQuantity} onChange={(event) => setMovementQuantity(event.target.value.replace(/\D/g,""))} required style={styles.operatorControlInput} /></label>
          <label style={styles.operatorField}>Documento asociado<select value={documentType} onChange={(event) => setDocumentType(event.target.value)} style={styles.operatorControlInput}><option value="guia_despacho">Guía de despacho</option><option value="factura">Factura</option><option value="migo_devolucion">MIGO de devolución</option><option value="folio_pedido">Folio de pedido</option></select></label>
          <label style={styles.operatorField}>Número de documento<input inputMode="numeric" value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value.replace(/\D/g,""))} required style={styles.operatorControlInput} /></label>
          {movementError && <div style={styles.operatorMovementError}>{movementError}</div>}{movementMessage && <div style={styles.operatorMovementSuccess}>{movementMessage}</div>}
          <button type="submit" disabled={movementSaving} style={movementMode === "in" ? styles.operatorSubmitIn : styles.operatorSubmitOut}>{movementSaving ? "Registrando..." : movementMode === "in" ? "Confirmar ingreso" : "Confirmar egreso"}</button>
        </form>}
        <div style={styles.operatorLocations}><h2>Ubicación</h2>{grouped.length ? grouped.map((item) => <article key={`${item.warehouse}-${item.area}-${item.group}`} style={styles.operatorLocationCard}><strong>{item.warehouse}</strong><span>{item.area} · {item.group}</span></article>) : <div style={styles.operatorEmptyLocation}>Sin ubicación asignada.</div>}</div>
      </section>}
    </main>
  </div>;
}

function OperatorMetric({ label, value, alert }) {
  return <div style={{ ...styles.operatorMetric, ...(alert ? styles.operatorMetricAlert : {}) }}><small>{label}</small><strong>{value}</strong></div>;
}

function SearchMetric({ label, value, alert }) {
  return <div style={{ ...styles.searchMetric, ...(alert ? styles.searchMetricAlert : {}) }}><span>{label}</span><strong>{value}</strong></div>;
}

function CellSkuDetail({ sku, cells, areaLabel, panelPosition }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const normalizedSku = String(sku || "").trim();
  useEffect(() => {
    if (!normalizedSku) { setProduct(null); return; }
    let cancelled = false;
    setLoading(true);
    supabase.from("products").select("sku, description, stock, units_per_pallet").eq("sku", normalizedSku).maybeSingle().then(({ data }) => {
      if (!cancelled) { setProduct(data ?? null); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [normalizedSku]);
  if (!normalizedSku) return null;
  const assigned = Object.values(cells).filter((value) => String(value || "").trim() === normalizedSku).length;
  const stock = Number(product?.stock) || 0;
  const unitsPerPallet = Number(product?.units_per_pallet) || 0;
  const palletsEquivalent = unitsPerPallet > 0 ? stock / unitsPerPallet : 0;
  const utilization = assigned > 0 && unitsPerPallet > 0 ? palletsEquivalent / assigned * 100 : 0;
  const free = unitsPerPallet > 0 ? Math.max(assigned - Math.ceil(palletsEquivalent), 0) : null;
  const overstock = utilization > 100;
  return <aside data-cell-detail="true" style={{ ...styles.cellDetailPanel, ...panelPosition, ...(overstock ? styles.cellDetailPanelOverstock : {}) }}>
    <div style={styles.cellDetailHeading}><div><span style={styles.searchSummaryLabel}>Detalle de la celda</span><strong style={styles.cellDetailSku}>{normalizedSku}</strong></div>{overstock && <OverstockMark />}</div>
    <span style={styles.cellDetailArea}>{areaLabel}</span>
    {loading ? <div style={styles.cellDetailLoading}>Consultando Maestro…</div> : <>
      <p style={styles.cellDetailDescription}>{product?.description || "Sin descripción registrada en el Maestro"}</p>
      <div style={styles.cellDetailMetrics}>
        <div style={styles.cellDetailMetric}><small>Posiciones asignadas</small><strong>{assigned}</strong></div>
        <div style={styles.cellDetailMetric}><small>Stock</small><strong>{formatNumber(stock)}</strong></div>
        <div style={styles.cellDetailMetric}><small>% de ocupación</small><strong style={overstock ? styles.cellDetailDangerText : undefined}>{unitsPerPallet > 0 ? `${utilization.toFixed(1)}%` : "—"}</strong></div>
        <div style={styles.cellDetailMetric}><small>Posiciones libres</small><strong>{free === null ? "—" : free}</strong></div>
      </div>
      {!product && <div style={styles.cellDetailMissing}>SKU no encontrado en el Maestro de Productos.</div>}
    </>}
  </aside>;
}

function OverstockMark({ compact = false }) {
  return <span style={compact ? styles.overstockIconCompact : styles.overstockMark} title="Sobrestock: utilización superior al 100%">!{compact ? "" : " Sobrestock"}</span>;
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
    <img src={`${import.meta.env.BASE_URL}demaria-logo.png`} alt="Demaria 1896" style={styles.loginLogo} />
    <h1 style={styles.loginTitle}>{mode === "login" ? "Sistema de Gestión de Bodegas" : "Recuperar contraseña"}</h1>
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
    <img src={`${import.meta.env.BASE_URL}demaria-logo.png`} alt="Demaria 1896" style={styles.loginLogo} /><h1 style={styles.loginTitle}>Nueva contraseña</h1>
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
        <span style={styles.status}>V7.5 logo alineado y acceso corporativo</span>
      </div>
      {children}
    </section>
  );
}

function Bodega70({ activeTab, onTabChange, rackCells, setRackCells, driveCells, setDriveCells, canEdit, assignmentSku, onCancelAssignment, focusLocation }) {
  return (
    <Section title="Bodega 70" description="Racks selectivos y almacenamiento compacto Drive In.">
      <SubNav
        tabs={[{ id: "racks", label: "Racks Selectivos" }, { id: "drive", label: "Racks Drive In" }, { id: "altillo", label: "Altillo" }]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      {activeTab === "racks" && <RacksSelectivos cells={rackCells} setCells={setRackCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={onCancelAssignment} focusLocation={focusLocation} />}
      {activeTab === "drive" && <DriveIn cells={driveCells} setCells={setDriveCells} canEdit={canEdit} assignmentSku={assignmentSku} onCancelAssignment={onCancelAssignment} focusLocation={focusLocation} />}
        {activeTab === "altillo" && <Placeholder code="AL" title="Altillo" text="Área de almacenamiento en Altillo." />}
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
  const [detailPanelPosition, setDetailPanelPosition] = useState(null);

  function positionCellDetail(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const panelWidth = 330;
    const panelHeight = 330;
    const gap = 18;
    const placeLeft = rect.left + rect.width / 2 > window.innerWidth / 2;
    const left = placeLeft ? Math.max(12, rect.left - panelWidth - gap) : Math.min(window.innerWidth - panelWidth - 12, rect.right + gap);
    const top = Math.max(12, Math.min(rect.top, window.innerHeight - panelHeight - 12));
    setDetailPanelPosition({ left, top, width: panelWidth });
  }

  useEffect(() => {
    function closeDetailOnOutsideClick(event) {
      if (event.target.closest?.('[data-storage-cell="true"]') || event.target.closest?.('[data-cell-detail="true"]')) return;
      setActiveCell("");
      setSelection(null);
      setDetailPanelPosition(null);
    }
    document.addEventListener("mousedown", closeDetailOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeDetailOnOutsideClick);
  }, []);
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
      onMouseDown={(event) => {
        if (!event.target.closest?.('[data-storage-cell="true"]') && !event.target.closest?.('[data-cell-detail="true"]') ) {
          setActiveCell("");
          setSelection(null);
          setDetailPanelPosition(null);
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

      <div style={styles.storageDetailAnchor}>
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
            positionCellDetail={positionCellDetail}
          />
        ))}
      </div>
      {detailPanelPosition && activeCell && String(cells[activeCell] || "").trim() && <CellSkuDetail sku={cells[activeCell]} cells={cells} areaLabel="Racks Drive In" panelPosition={detailPanelPosition} />}
      </div>
    </div>
  );
}

function DriveStreet({ street, cells, activeCell, setActiveCell, updateCell, selection, setSelection, dragging, setDragging, canEdit, focusLocation, positionCellDetail }) {
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
                    event.stopPropagation();
                    positionCellDetail(event.currentTarget);
                    setActiveCell(key);
                    setSelection({ group: street, anchor: { row, col }, focus: { row, col } });
                    if (canEdit) { setDragging(true); event.currentTarget.focus(); }
                  }}
                  onMouseEnter={() => {
                    if (dragging && selection?.group === street) {
                      setSelection((current) => ({ ...current, focus: { row, col } }));
                    }
                  }}
                  onChange={(event) => canEdit && updateCell(street, level, depth, event.target.value)}
                  aria-label={`Calle ${street}, nivel ${level}, profundidad ${depth}`}
                  data-storage-cell="true"
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
  const [detailPanelPosition, setDetailPanelPosition] = useState(null);

  function positionCellDetail(element) {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const panelWidth = 330;
    const panelHeight = 330;
    const gap = 18;
    const placeLeft = rect.left + rect.width / 2 > window.innerWidth / 2;
    const left = placeLeft ? Math.max(12, rect.left - panelWidth - gap) : Math.min(window.innerWidth - panelWidth - 12, rect.right + gap);
    const top = Math.max(12, Math.min(rect.top, window.innerHeight - panelHeight - 12));
    setDetailPanelPosition({ left, top, width: panelWidth });
  }

  useEffect(() => {
    function closeDetailOnOutsideClick(event) {
      if (event.target.closest?.('[data-storage-cell="true"]') || event.target.closest?.('[data-cell-detail="true"]')) return;
      setActiveCell("");
      setSelection(null);
      setDetailPanelPosition(null);
    }
    document.addEventListener("mousedown", closeDetailOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeDetailOnOutsideClick);
  }, []);
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
      onMouseDown={(event) => {
        if (!event.target.closest?.('[data-storage-cell="true"]') && !event.target.closest?.('[data-cell-detail="true"]') ) {
          setActiveCell("");
          setSelection(null);
          setDetailPanelPosition(null);
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

      <div style={styles.storageDetailAnchor}>
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
                positionCellDetail={positionCellDetail}
              />
            </div>
          ))}
        </div>
      </div>
      {detailPanelPosition && activeCell && String(cells[activeCell] || "").trim() && <CellSkuDetail sku={cells[activeCell]} cells={cells} areaLabel="Racks Selectivos" panelPosition={detailPanelPosition} />}
      </div>
    </div>
  );
}

function WarehouseRack({ rack, cells, activeCell, setActiveCell, updateCell, selection, setSelection, dragging, setDragging, canEdit, focusLocation, positionCellDetail }) {
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
                  event.stopPropagation();
                  positionCellDetail(event.currentTarget);
                  setActiveCell(key);
                  setSelection({ group: rack.number, anchor: { row, col }, focus: { row, col } });
                  if (canEdit) { setDragging(true); event.currentTarget.focus(); }
                }}
                onMouseEnter={() => {
                  if (dragging && selection?.group === rack.number) {
                    setSelection((current) => ({ ...current, focus: { row, col } }));
                  }
                }}
                onChange={(event) => canEdit && updateCell(rack.number, level, position, event.target.value)}
                aria-label={`Rack ${rack.number}, nivel ${level}, posición ${position}`}
                data-storage-cell="true"
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

function Bodega60({ activeTab, onTabChange, envaseCells, setEnvaseCells, canEdit, focusLocation }) {
  const tabs = [
    { id: "envases", label: "Envases" }, { id: "tc", label: "Etiquetas TC" },
    { id: "adhesivas", label: "Etiquetas Adhesivas" }, { id: "drive60", label: "Racks Drive In" },
  ];
  const panels = { tc: ["TC", "Etiquetas TC", "Área de almacenamiento de etiquetas TC."], adhesivas: ["EA", "Etiquetas Adhesivas", "Área de almacenamiento de etiquetas adhesivas."], drive60: ["DI", "Racks Drive In", "Área de almacenamiento compacto de Bodega 60."] };
  return <Section title="Bodega 60" description="Envases y materiales de empaque.">
    <SubNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />
    {activeTab === "envases" ? <EnvasesLayout cells={envaseCells} setCells={setEnvaseCells} canEdit={canEdit} focusLocation={focusLocation} /> : <Placeholder code={panels[activeTab][0]} title={panels[activeTab][1]} text={panels[activeTab][2]} />}
  </Section>;
}

function EnvasesLayout({ cells, setCells, canEdit, focusLocation }) {
  const [selectedSku, setSelectedSku] = useState("");
  const [detailSku, setDetailSku] = useState("");
  const [envQuery, setEnvQuery] = useState("");
  const [detailProduct, setDetailProduct] = useState(null);
  const [envSelection, setEnvSelection] = useState(null);
  const [envDragging, setEnvDragging] = useState(false);
  const [layoutConfig, setLayoutConfig] = useState({});
  const [designMode, setDesignMode] = useState(false);
  const [envProducts, setEnvProducts] = useState({});
  const [configSaving, setConfigSaving] = useState(false);
  const [showNewStreet, setShowNewStreet] = useState(false);
  const [newStreetForm, setNewStreetForm] = useState({ footprints: 10, levels: 2 });
  const [editingDetailSku, setEditingDetailSku] = useState(false);
  const [detailSkuDraft, setDetailSkuDraft] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      supabase.from("envase_layout_config").select("street_id, footprints, levels, blocked_positions, sku, street_order, zone, is_custom, is_deleted"),
      supabase.from("products").select("sku, description, stock, units_per_pallet").in("sku", [...new Set(ENVASE_STREETS.map((street) => street.sku))]),
    ]).then(([configResult, productsResult]) => {
      if (cancelled) return;
      if (!configResult.error) setLayoutConfig(Object.fromEntries((configResult.data ?? []).map((row) => [row.street_id, { footprints: row.footprints, levels: row.levels, blocked: Array.isArray(row.blocked_positions) ? row.blocked_positions : [], sku: row.sku, streetOrder: row.street_order, zone: row.zone, isCustom: row.is_custom, isDeleted: row.is_deleted }])));
      if (!productsResult.error) setEnvProducts(Object.fromEntries((productsResult.data ?? []).map((product) => [product.sku, product])));
    });
    return () => { cancelled = true; };
  }, []);

  const baseStreets = ENVASE_STREETS.map((street) => {
    const override = layoutConfig[street.id];
    return override ? { ...street, sku: override.sku || street.sku, streetOrder: override.streetOrder || street.streetOrder, zone: override.zone || street.zone, footprints: override.footprints, levels: override.levels, blocked: override.blocked, isDeleted: override.isDeleted, capacity: override.footprints * override.levels - override.blocked.length } : street;
  }).filter((street) => !street.isDeleted);
  const customStreets = Object.entries(layoutConfig).filter(([id, item]) => item.isCustom && !item.isDeleted && !ENVASE_STREETS.some((street) => street.id === Number(id))).map(([id, item]) => ({ id: Number(id), sku: item.sku, streetOrder: item.streetOrder, zone: item.zone || "central", footprints: item.footprints, levels: item.levels, blocked: item.blocked || [], capacity: item.footprints * item.levels - (item.blocked || []).length, isCustom: true }));
  const effectiveStreets = [...baseStreets, ...customStreets].sort((a, b) => a.sku.localeCompare(b.sku) || a.streetOrder - b.streetOrder);

  async function saveStreetConfig(street, changes) {
    if (!canEdit) return;
    const currentConfig = layoutConfig[street.id] || {};
    const next = { ...currentConfig, footprints: changes.footprints ?? street.footprints, levels: changes.levels ?? street.levels, blocked: changes.blocked ?? (street.blocked || []), sku: changes.sku ?? street.sku, streetOrder: changes.streetOrder ?? street.streetOrder, zone: changes.zone ?? street.zone, isCustom: changes.isCustom ?? currentConfig.isCustom ?? street.isCustom ?? false, isDeleted: changes.isDeleted ?? currentConfig.isDeleted ?? false };
    setLayoutConfig((current) => ({ ...current, [street.id]: next }));
    setConfigSaving(true);
    const result = await supabase.from("envase_layout_config").upsert({ street_id: street.id, footprints: next.footprints, levels: next.levels, blocked_positions: next.blocked, sku: next.sku, street_order: next.streetOrder, zone: next.zone, is_custom: next.isCustom, is_deleted: next.isDeleted, updated_at: new Date().toISOString() }, { onConflict: "street_id" });
    if (result.error) setLayoutConfig((current) => ({ ...current, [street.id]: currentConfig }));
    setConfigSaving(false);
  }

  function togglePhysicalPosition(street, level, position) {
    const code = `${level}-${position}`;
    const key = `${street.id}-${level}-${position}`;
    const blocked = street.blocked || [];
    const activating = blocked.includes(code);
    if (!activating && String(cells[key] || "").trim() && !window.confirm("Esta posición contiene un SKU. ¿Desactivar y eliminar su contenido?")) return;
    if (!activating) setCells((current) => { const next = { ...current }; delete next[key]; return next; });
    const nextBlocked = activating ? blocked.filter((item) => item !== code) : [...blocked, code];
    saveStreetConfig(street, { blocked: nextBlocked });
  }

  function addFootprint(street) {
    saveStreetConfig(street, { footprints: street.footprints + 1 });
  }

  function removeFootprint(street) {
    if (street.footprints <= 1) return;
    const position = street.footprints;
    const hasContent = Array.from({ length: street.levels }, (_, index) => street.levels - index).some((level) => String(cells[`${street.id}-${level}-${position}`] || "").trim());
    if (hasContent && !window.confirm(`La última huella de la calle ${street.streetOrder} contiene SKU. ¿Eliminar igualmente?`)) return;
    setCells((current) => {
      const next = { ...current };
      for (let level = 1; level <= street.levels; level += 1) delete next[`${street.id}-${level}-${position}`];
      return next;
    });
    saveStreetConfig(street, { footprints: street.footprints - 1, blocked: (street.blocked || []).filter((code) => Number(code.split("-")[1]) < position) });
  }

  async function renameDetailSku() {
    const nextSku = detailSkuDraft.trim();
    if (!canEdit || !/^\d{8}$/.test(nextSku) || nextSku === detailSku) { setEditingDetailSku(false); return; }
    if (envSkuList.includes(nextSku) && nextSku !== detailSku && !window.confirm(`El SKU ${nextSku} ya existe en Envases. ¿Unificar las calles bajo ese código?`)) return;
    const streets = effectiveStreets.filter((street) => street.sku === detailSku);
    setConfigSaving(true);
    for (const street of streets) await saveStreetConfig(street, { sku: nextSku });
    setCells((current) => {
      const next = { ...current };
      Object.keys(next).forEach((key) => {
        const streetId = Number(key.split("-")[0]);
        if (streets.some((street) => street.id === streetId) && String(next[key] || "").trim() === detailSku) next[key] = nextSku;
      });
      return next;
    });
    setSelectedSku(nextSku);
    setDetailSku(nextSku);
    setDetailSkuDraft(nextSku);
    setEditingDetailSku(false);
    const productResult = await supabase.from("products").select("sku, description, stock, units_per_pallet").eq("sku", nextSku).maybeSingle();
    if (!productResult.error && productResult.data) setEnvProducts((current) => ({ ...current, [nextSku]: productResult.data }));
    setConfigSaving(false);
  }

  async function createStreet() {
    if (!canEdit || !detailSku) return;
    const skuStreets = effectiveStreets.filter((street) => street.sku === detailSku);
    const newId = Math.max(1000, ...ENVASE_STREETS.map((street) => street.id), ...Object.keys(layoutConfig).map(Number).filter(Number.isFinite)) + 1;
    const streetOrder = Math.max(0, ...skuStreets.map((street) => street.streetOrder)) + 1;
    const zone = skuStreets[0]?.zone || "central";
    const street = { id: newId, sku: detailSku, streetOrder, zone, footprints: Math.max(1, Number(newStreetForm.footprints) || 1), levels: Math.max(1, Math.min(4, Number(newStreetForm.levels) || 2)), blocked: [], isCustom: true };
    await saveStreetConfig(street, { isCustom: true, isDeleted: false });
    setShowNewStreet(false);
  }

  async function deleteStreet(street) {
    if (!canEdit) return;
    const keys = Object.keys(cells).filter((key) => Number(key.split("-")[0]) === street.id && String(cells[key] || "").trim());
    if (!window.confirm(`¿Eliminar la Calle ${String(street.streetOrder).padStart(2,"0")} de ${street.sku}? Se eliminarán ${keys.length} posiciones con contenido.`)) return;
    setCells((current) => { const next = { ...current }; Object.keys(next).forEach((key) => { if (Number(key.split("-")[0]) === street.id) delete next[key]; }); return next; });
    await saveStreetConfig(street, { isDeleted: true });
  }

  function navigateDetail(direction) {
    const index = envSkuList.indexOf(detailSku);
    if (index < 0) return;
    const nextIndex = (index + direction + envSkuList.length) % envSkuList.length;
    setDetailSku(envSkuList[nextIndex]);
    setSelectedSku(envSkuList[nextIndex]);
    setEnvSelection(null);
    setDesignMode(false);
  }

  useEffect(() => {
    setDetailSkuDraft(detailSku || "");
    setEditingDetailSku(false);
    if (!detailSku) { setDetailProduct(null); return; }
    let cancelled = false;
    supabase.from("products").select("sku, description, stock, units_per_pallet").eq("sku", detailSku.trim()).maybeSingle().then(({ data, error }) => {
      if (cancelled) return;
      setDetailProduct(data ?? null);
      if (!error && data) setEnvProducts((current) => ({ ...current, [String(data.sku).trim()]: data }));
    });
    return () => { cancelled = true; };
  }, [detailSku]);

  useEffect(() => {
    if (focusLocation?.target !== "envases") return;
    const street = effectiveStreets.find((item) => item.id === focusLocation.unit);
    if (street) {
      setSelectedSku(street.sku);
      setDetailSku(street.sku);
    }
    const timer = window.setTimeout(() => document.getElementById(`env-street-${focusLocation.unit}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 180);
    return () => window.clearTimeout(timer);
  }, [focusLocation]);

  const envSkuList = [...new Set(effectiveStreets.map((street) => street.sku))].sort((a, b) => Number(a) - Number(b) || a.localeCompare(b));
  const visibleSkus = envSkuList.filter((sku) => sku.includes(envQuery.trim()));

  function skuMetrics(sku) {
    const streets = effectiveStreets.filter((street) => street.sku === sku);
    const capacity = streets.reduce((sum, street) => sum + street.capacity, 0);
    const occupied = Object.entries(cells).filter(([key, value]) => {
      const [streetPart, levelPart, positionPart] = key.split("-");
      const street = streets.find((item) => item.id === Number(streetPart));
      if (!street || !String(value || "").trim()) return false;
      const level = Number(levelPart);
      const position = Number(positionPart);
      return level >= 1 && level <= street.levels && position >= 1 && position <= street.footprints && !(street.blocked || []).includes(`${level}-${position}`);
    }).length;
    const product = sku === detailSku && detailProduct ? detailProduct : envProducts[sku];
    const stock = Number(product?.stock) || 0;
    const unitsPerPallet = Number(product?.units_per_pallet) || 0;
    const palletsEquivalent = unitsPerPallet > 0 ? stock / unitsPerPallet : 0;
    const utilization = capacity && unitsPerPallet > 0 ? palletsEquivalent / capacity * 100 : 0;
    return { streets, capacity, occupied, palletsEquivalent, free: Math.max(capacity - Math.ceil(palletsEquivalent), 0), utilization };
  }

  function selectedEnvaseKeys(currentSelection = envSelection) {
    if (!currentSelection) return [];
    const street = effectiveStreets.find((item) => item.id === currentSelection.group);
    if (!street) return [];
    const levels = Array.from({ length: street.levels }, (_, index) => street.levels - index);
    const bounds = selectionBounds(currentSelection);
    const keys = [];
    for (let row = bounds.rowStart; row <= Math.min(bounds.rowEnd, levels.length - 1); row += 1) {
      for (let col = bounds.colStart; col <= Math.min(bounds.colEnd, street.footprints - 1); col += 1) {
        const blocked = street.blocked?.includes(`${levels[row]}-${col + 1}`);
        if (!blocked) keys.push(`${street.id}-${levels[row]}-${col + 1}`);
      }
    }
    return keys;
  }

  function copyEnvaseSelection() {
    if (!envSelection) return;
    const street = effectiveStreets.find((item) => item.id === envSelection.group);
    const levels = Array.from({ length: street.levels }, (_, index) => street.levels - index);
    const bounds = selectionBounds(envSelection);
    const rows = [];
    for (let row = bounds.rowStart; row <= Math.min(bounds.rowEnd, levels.length - 1); row += 1) {
      const values = [];
      for (let col = bounds.colStart; col <= Math.min(bounds.colEnd, street.footprints - 1); col += 1) {
        values.push(cells[`${street.id}-${levels[row]}-${col + 1}`] || "");
      }
      rows.push(values.join("\t"));
    }
    navigator.clipboard?.writeText(rows.join("\n"));
  }

  function clearEnvaseSelection() {
    if (!canEdit) return;
    const keys = selectedEnvaseKeys();
    setCells((current) => {
      const next = { ...current };
      keys.forEach((key) => delete next[key]);
      return next;
    });
  }

  function pasteEnvaseSelection(text) {
    if (!canEdit || !envSelection) return;
    const street = effectiveStreets.find((item) => item.id === envSelection.group);
    const levels = Array.from({ length: street.levels }, (_, index) => street.levels - index);
    const bounds = selectionBounds(envSelection);
    const rows = text.replace(/\r/g, "").split("\n").filter((row, index, all) => row || index < all.length - 1).map((row) => row.split("\t"));
    const single = rows.length === 1 && rows[0].length === 1;
    setCells((current) => {
      const next = { ...current };
      if (single) {
        selectedEnvaseKeys().forEach((key) => { next[key] = rows[0][0].trim(); });
        return next;
      }
      rows.forEach((values, rowOffset) => values.forEach((value, colOffset) => {
        const row = bounds.rowStart + rowOffset;
        const col = bounds.colStart + colOffset;
        if (row < levels.length && col < street.footprints && !street.blocked?.includes(`${levels[row]}-${col + 1}`)) next[`${street.id}-${levels[row]}-${col + 1}`] = value.trim();
      }));
      return next;
    });
  }

  function handleEnvaseKeyDown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") { event.preventDefault(); copyEnvaseSelection(); }
    if ((event.key === "Delete" || event.key === "Backspace") && envSelection && event.target.tagName !== "INPUT") { event.preventDefault(); clearEnvaseSelection(); }
    if (event.key === "Escape") setEnvSelection(null);
  }

  function chooseSku(sku) {
    setSelectedSku(sku);
    setDetailSku("");
  }

  if (detailSku) {
    const metrics = skuMetrics(detailSku);
    return <div style={styles.envLayout} tabIndex={0} onKeyDown={handleEnvaseKeyDown} onPaste={(event) => { if (envSelection) { event.preventDefault(); pasteEnvaseSelection(event.clipboardData.getData("text")); } }} onMouseUp={() => setEnvDragging(false)} onMouseLeave={() => setEnvDragging(false)} onMouseDown={(event) => { if (!event.target.closest?.('[data-env-cell="true"]') && !event.target.closest?.('[data-env-toolbar="true"]')) setEnvSelection(null); }}>
      <div style={styles.envDetailHeader}>
        <button type="button" onClick={() => setDetailSku("")} style={styles.actionSecondary}>← Mapa general</button>
        <div style={styles.envDetailIdentity}>
          <span style={styles.searchSummaryLabel}>Detalle de Envases</span>
          <div style={styles.envDetailSkuRow}><button type="button" onClick={() => navigateDetail(-1)} style={styles.envNavArrow} aria-label="Código anterior">‹</button>{editingDetailSku ? <input autoFocus value={detailSkuDraft} maxLength={8} onChange={(event) => setDetailSkuDraft(event.target.value.replace(/\D/g,""))} onKeyDown={(event) => { if (event.key === "Enter") renameDetailSku(); if (event.key === "Escape") setEditingDetailSku(false); }} onBlur={renameDetailSku} style={styles.envSkuEditInput} aria-label="Editar SKU" /> : <button type="button" onDoubleClick={() => canEdit && setEditingDetailSku(true)} onClick={() => canEdit && setEditingDetailSku(true)} style={styles.envSkuEditButton} title={canEdit ? "Editar SKU" : ""}><h3 style={styles.envDetailTitle}>{detailSku}</h3>{canEdit && <span>✎</span>}</button>}<button type="button" onClick={() => navigateDetail(1)} style={styles.envNavArrow} aria-label="Código siguiente">›</button></div>
          <p style={styles.envDetailDescription}>{detailProduct?.description || envProducts[detailSku]?.description || `Sin descripción para el SKU exacto ${detailSku} en el Maestro`}</p>
          <div style={styles.envProductData}><span style={styles.envProductDataItem}><small>Stock</small><strong>{Number(detailProduct?.stock ?? envProducts[detailSku]?.stock) >= 0 ? `${Number((detailProduct?.stock ?? envProducts[detailSku]?.stock) || 0).toLocaleString("es-CL")} unidades` : "Sin stock registrado"}</strong></span><span style={styles.envProductDataItem}><small>Palletizado</small><strong>{Number(detailProduct?.units_per_pallet ?? envProducts[detailSku]?.units_per_pallet) > 0 ? `${Number(detailProduct?.units_per_pallet ?? envProducts[detailSku]?.units_per_pallet).toLocaleString("es-CL")} unidades por pallet` : "Sin cantidad por pallet registrada"}</strong></span></div>
        </div>
        <div style={styles.envDetailStats}><span style={styles.envDetailMetric}><small>Calles</small><b>{metrics.streets.length}</b></span><span style={styles.envDetailMetric}><small>Posiciones</small><b>{metrics.capacity}</b></span><span style={styles.envDetailMetric}><small>Pallets Eq.</small><b>{metrics.palletsEquivalent.toFixed(2)}</b></span><span style={styles.envDetailMetric}><small>Libres</small><b>{metrics.free}</b></span><span style={{ ...styles.envDetailMetric, ...(metrics.utilization > 100 ? styles.overstockPanel : {}) }}><small>Utilización</small><b>{metrics.utilization.toFixed(1)}% {metrics.utilization > 100 && <OverstockMark compact />}</b></span></div>
      </div>
      <div style={styles.envSelectionToolbar} data-env-toolbar="true"><div><strong>{envSelection ? `${selectedEnvaseKeys().length} posiciones seleccionadas` : designMode ? "Modo diseño: haz clic en un cuadro para activarlo o desactivarlo" : "Selecciona una o varias posiciones"}</strong><small style={styles.envSaveState}>{configSaving ? "Guardando estructura..." : designMode ? "Los cuadros activos se contabilizan aunque estén vacíos" : ""}</small></div><div style={styles.actionGroup}><button type="button" onClick={() => setShowNewStreet((value) => !value)} disabled={!canEdit} style={styles.actionSecondary}>+ Nueva calle</button><button type="button" onClick={() => { setDesignMode((value) => !value); setEnvSelection(null); }} disabled={!canEdit} style={designMode ? styles.actionPrimary : styles.actionSecondary}>{designMode ? "Finalizar diseño" : "Diseñar posiciones"}</button><button type="button" onClick={copyEnvaseSelection} disabled={!envSelection} style={styles.actionSecondary}>Copiar</button><button type="button" onClick={clearEnvaseSelection} disabled={!envSelection || !canEdit} style={styles.actionDanger}>Suprimir</button><button type="button" onClick={() => setEnvSelection(null)} disabled={!envSelection} style={styles.actionSecondary}>Deseleccionar</button></div></div>
      {showNewStreet && <div style={styles.envNewStreetForm} data-env-toolbar="true"><strong>Nueva calle para {detailSku}</strong><label>Huellas<input type="number" min="1" max="40" value={newStreetForm.footprints} onChange={(event) => setNewStreetForm((current) => ({ ...current, footprints: event.target.value }))} /></label><label>Niveles<select value={newStreetForm.levels} onChange={(event) => setNewStreetForm((current) => ({ ...current, levels: event.target.value }))}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label><button type="button" onClick={createStreet} style={styles.actionPrimary}>Crear calle</button><button type="button" onClick={() => setShowNewStreet(false)} style={styles.actionSecondary}>Cancelar</button></div>}
      <div style={styles.envDetailGrid}>{metrics.streets.map((street) => <EnvaseStreet key={street.id} street={street} cells={cells} setCells={setCells} canEdit={canEdit} focusLocation={focusLocation} selection={envSelection} setSelection={setEnvSelection} dragging={envDragging} setDragging={setEnvDragging} designMode={designMode} onTogglePosition={togglePhysicalPosition} onAddFootprint={addFootprint} onRemoveFootprint={removeFootprint} onDeleteStreet={deleteStreet} />)}</div>
    </div>;
  }

  return <div style={styles.envOverview} onMouseDown={(event) => { if (!event.target.closest?.('[data-env-select="true"]')) setSelectedSku(""); }}>
    <aside style={styles.envSkuSidebar}>
      <div style={styles.envSidebarHeader}><span style={styles.searchSummaryLabel}>Códigos de Envases</span><strong>{envSkuList.length} SKU</strong></div>
      <input value={envQuery} onChange={(event) => setEnvQuery(event.target.value.replace(/\D/g, ""))} placeholder="Buscar código" style={styles.envSkuSearch} />
      <div style={styles.envSkuList}>{visibleSkus.map((sku) => {
        const metrics = skuMetrics(sku);
        const active = selectedSku === sku;
        return <button key={sku} type="button" data-env-select="true" onClick={() => chooseSku(sku)} onDoubleClick={() => setDetailSku(sku)} style={{ ...styles.envSkuItem, ...(active ? styles.envSkuItemActive : {}), ...(metrics.utilization > 100 ? styles.overstockPanel : {}) }}>
          <span style={styles.envSkuItemInfo}><strong>{sku}</strong><small>{metrics.streets.length} {metrics.streets.length === 1 ? "calle" : "calles"} · {metrics.capacity} posiciones</small></span>
          <span style={{ ...styles.envSkuPercent, ...(metrics.utilization > 100 ? styles.overstockPercent : {}) }}>{metrics.utilization > 100 && <OverstockMark compact />}{metrics.utilization.toFixed(1)}%</span>
        </button>;
      })}</div>
      <div style={styles.envSidebarHint}>Un clic resalta el mapa. Doble clic abre las posiciones y sus niveles.</div>
    </aside>

    <section style={styles.envMapPanel}>
      <div style={styles.envMapHeader}><div><h3 style={styles.areaTitle}>Mapa general de Envases</h3><p style={styles.areaDescription}>Primera aproximación basada en el Excel. La geometría podrá ajustarse sin cambiar las calles ni sus posiciones.</p></div><span style={styles.summaryBadge}>{effectiveStreets.reduce((sum, street) => sum + street.capacity, 0)} posiciones</span></div>
      {selectedSku && (() => { const metrics = skuMetrics(selectedSku); return <div style={styles.envSelectedSummary}><strong>{selectedSku}</strong><span>{metrics.streets.length} calles</span><span>{metrics.capacity} posiciones</span><span>{metrics.palletsEquivalent.toFixed(2)} pallets eq.</span><span>{metrics.free} libres</span><button type="button" onClick={() => setDetailSku(selectedSku)} style={styles.assignmentButton}>Abrir detalle</button></div>; })()}
      <div style={styles.envMapCanvas}>
        <div style={{ ...styles.envFixedArea, left: "0.5%", top: "1%", width: "27%", height: "7%" }}>ZONA ANILINAS</div>
        <div style={{ ...styles.envFixedArea, left: "0.5%", top: "9%", width: "27%", height: "14%" }}><span style={styles.verticalLabel}>Fraccionamiento</span><strong>OFICINA</strong></div>
        <div style={{ ...styles.envFixedArea, left: "0.5%", top: "23.5%", width: "27%", height: "31%" }}>KANBAN</div>
        <div style={{ ...styles.envFixedArea, left: "38.5%", top: "1%", width: "5%", height: "4%", background: "#000", color: "#FFF" }}>EXT.</div>
        <div style={{ ...styles.envFixedArea, left: "44%", top: "1%", width: "8%", height: "4%", background: "#FFF200" }}>CALIDAD</div>
        <div style={{ ...styles.envFixedArea, left: "74%", top: "67%", width: "26%", height: "7%", background: "#000000", color: "#FFFFFF", borderRadius: 0 }}>Zona de etiquetas TC</div>
        <div style={{ ...styles.envFixedArea, left: "0.5%", top: "88%", width: "74%", height: "11%", background: "#000", color: "#FFF", fontSize: 16 }}>ZONA DE RACKS DRIVE IN</div>

        {ENV_MAP_BLOCKS.map((block) => {
          const originalIds = ENVASE_STREETS.filter((street) => street.sku === block.sku).map((street) => street.id);
          const mappedSku = effectiveStreets.find((street) => originalIds.includes(street.id))?.sku || block.sku;
          const metrics = skuMetrics(mappedSku);
          const selected = selectedSku === mappedSku;
          const faded = selectedSku && !selected;
          const overstock = metrics.utilization > 100;
          return <button key={block.sku} type="button" data-env-select="true" onClick={() => chooseSku(mappedSku)} onDoubleClick={() => setDetailSku(mappedSku)} style={{ ...styles.envSkuMapBlock, left: block.x, top: block.y, width: block.w, height: block.h, background: overstock ? "#F04438" : "linear-gradient(145deg,#E7FBFB,#C8F2F2)", color: overstock ? "#FFFFFF" : COLORS.text, borderColor: overstock ? "#B42318" : COLORS.turquoiseDark, ...(selected ? styles.envMapStreetSelected : {}), ...(faded ? styles.envMapStreetFaded : {}) }}>
            {overstock && <OverstockMark compact />}<strong>{mappedSku}</strong><span>{metrics.capacity} posiciones</span>
          </button>;
        })}
      </div>
    </section>
  </div>;
}

function EnvMapZone({ title, zone, selectedSku, onSelect, onOpen }) {
  const streets = ENVASE_STREETS.filter((street) => street.zone === zone);
  return <><strong style={styles.envMapZoneTitle}>{title}</strong><div style={styles.envMapStreets}>{streets.map((street) => {
    const selected = selectedSku === street.sku;
    const faded = selectedSku && !selected;
    return <button key={street.id} type="button" onClick={() => onSelect(street.sku)} onDoubleClick={() => onOpen(street.sku)} style={{ ...styles.envMapStreet, ...(selected ? styles.envMapStreetSelected : {}), ...(faded ? styles.envMapStreetFaded : {}) }}>
      <strong>{street.sku}</strong><span>C{String(street.streetOrder).padStart(2,"0")} · {street.capacity} pos.</span>
    </button>;
  })}</div></>;
}

function EnvaseStreet({ street, cells, setCells, canEdit, focusLocation, selection, setSelection, dragging, setDragging, designMode, onTogglePosition, onAddFootprint, onRemoveFootprint, onDeleteStreet }) {
  const positions = Array.from({ length: street.footprints }, (_, index) => index + 1);
  const levels = Array.from({ length: street.levels }, (_, index) => street.levels - index);
  const focused = focusLocation?.target === "envases" && focusLocation.unit === street.id;
  return <article id={`env-street-${street.id}`} style={{ ...styles.envStreet, ...(focused ? styles.focusedUnit : {}) }}>
    <div style={styles.envStreetHeader}><div style={styles.envStreetIdentity}><strong>{street.sku} · CALLE {String(street.streetOrder).padStart(2,"0")}</strong><small>{street.footprints} huellas · {street.levels} niveles</small></div><div style={styles.envStreetHeaderActions}><b>{street.capacity} pos.</b>{designMode && <><button type="button" data-env-toolbar="true" onClick={() => onAddFootprint(street)} style={styles.envStructureButton}>+ Huella</button><button type="button" data-env-toolbar="true" onClick={() => onRemoveFootprint(street)} style={styles.envStructureButton}>- Huella</button><button type="button" data-env-toolbar="true" onClick={() => onDeleteStreet(street)} style={styles.envStructureDanger}>Eliminar calle</button></>}</div></div>
    <div style={{ ...styles.envMatrix, gridTemplateColumns: `52px repeat(${street.footprints}, minmax(52px,1fr))` }}>
      <div style={styles.envCorner}>NIVEL</div>{positions.map((position) => <div key={position} style={styles.envPositionHeader}>P{position}</div>)}
      {levels.flatMap((level) => [<div key={`l-${level}`} style={styles.envLevelLabel}>N{level}</div>, ...positions.map((position) => {
        const key = `${street.id}-${level}-${position}`;
        const blocked = street.blocked?.includes(`${level}-${position}`);
        const row = street.levels - level;
        const col = position - 1;
        const selected = isCellSelected(selection, street.id, row, col);
        return blocked ? <button key={key} type="button" data-env-cell="true" onClick={() => designMode && canEdit && onTogglePosition(street, level, position)} style={{ ...styles.envBlocked, ...(designMode ? styles.envDesignBlocked : {}) }}>{designMode ? "+ ACTIVAR" : "NO DISP."}</button> : <input key={key} value={cells[key] || ""} readOnly={!canEdit || designMode} data-storage-cell="true" data-env-cell="true" onMouseDown={(event) => { if (!canEdit) return; event.preventDefault(); if (designMode) { onTogglePosition(street, level, position); return; } setSelection({ group: street.id, anchor: { row, col }, focus: { row, col } }); setDragging(true); event.currentTarget.focus(); }} onMouseEnter={() => { if (canEdit && dragging && selection?.group === street.id) setSelection((current) => ({ ...current, focus: { row, col } })); }} onChange={(event) => canEdit && setCells((current) => ({ ...current, [key]: event.target.value }))} onDoubleClick={(event) => { if (canEdit) { event.currentTarget.focus(); event.currentTarget.select(); } }} aria-label={`Envases ${street.sku}, calle ${street.streetOrder}, nivel ${level}, posición ${position}`} style={{ ...styles.envCell, ...(level === 3 ? styles.levelThree : level === 2 ? styles.levelTwo : styles.levelOne), ...(selected ? styles.multiSelectedCell : {}), ...(focusLocation?.target === "envases" && String(cells[key] || "").trim() === focusLocation.sku ? styles.focusedSkuCell : {}) }} />;
      })])}
    </div>
  </article>;
}

function BodegaVirgo2({ activeTab, onTabChange }) {
  const tabs = [{ id: "corrugados", label: "Corrugados" }, { id: "corrosiva", label: "Bodega Corrosiva" }, { id: "inflamable", label: "Bodega Inflamable" }];
  const panels = { corrugados: ["CO", "Corrugados", "Almacenamiento de materiales corrugados."], corrosiva: ["BC", "Bodega Corrosiva", "Área especial para materiales corrosivos."], inflamable: ["BI", "Bodega Inflamable", "Área especial para materiales inflamables."] };
  const panel = panels[activeTab];
  return <Section title="Bodega Virgo 2" description="Corrugados y almacenamiento de productos especiales."><SubNav tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} /><Placeholder code={panel[0]} title={panel[1]} text={panel[2]} /></Section>;
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

function StockNotifications({ currentUserId }) {
  const [movements, setMovements] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  async function loadMovements() {
    setLoading(true);
    let query = supabase.from("stock_movements").select("*").order("created_at", { ascending: false });
    if (filter === "pending") query = query.eq("reviewed", false);
    if (filter === "reviewed") query = query.eq("reviewed", true);
    if (filter === "in" || filter === "out") query = query.eq("movement_type", filter);
    const result = await query;
    setMovements(result.data ?? []); setLoading(false);
  }
  useEffect(() => { loadMovements(); }, [filter]);
  async function cancelIncome(item) {
    const reason = window.prompt(`Motivo de anulación del ingreso ${item.sku}:`, "Anulación administrativa");
    if (reason === null) return;
    if (!window.confirm(`¿Anular el ingreso de ${formatNumber(item.quantity)} unidades del SKU ${item.sku}?`)) return;
    const result = await supabase.rpc("admin_cancel_stock_income", { target_movement_id: item.id, reason });
    if (result.error) window.alert(result.error.message); else loadMovements();
  }

  async function reviewMovement(id) {
    await supabase.from("stock_movements").update({ reviewed: true, reviewed_by: currentUserId, reviewed_at: new Date().toISOString() }).eq("id", id);
    loadMovements();
  }
  const documentLabels = { guia_despacho: "Guía de despacho", factura: "Factura", migo_devolucion: "MIGO de devolución", folio_pedido: "Folio de pedido" };
  return <Section title="Notificaciones de stock" description="Bandeja de ingresos y egresos registrados por operadores.">
    <div style={styles.notificationFilters}>{[["pending","Pendientes"],["all","Todas"],["reviewed","Revisadas"],["in","Ingresos"],["out","Egresos"]].map(([value,label]) => <button key={value} onClick={() => setFilter(value)} style={filter === value ? styles.actionPrimary : styles.actionSecondary}>{label}</button>)}</div>
    {loading ? <LoadingPanel text="Cargando movimientos..." /> : <div style={styles.notificationList}>{movements.length ? movements.map((item) => <article key={item.id} style={{ ...styles.notificationCard, ...(item.movement_type === "out" ? styles.notificationOut : styles.notificationIn), ...(item.cancelled ? styles.notificationCancelled : {}) }}><div style={styles.notificationHeader}><strong>{item.movement_type === "in" ? "Ingreso" : "Egreso"} · SKU {item.sku}</strong><span>{new Date(item.created_at).toLocaleString("es-CL")}</span></div><p>{item.product_description}</p>{item.cancelled && <div style={styles.cancelledBadge}>Ingreso anulado · {item.cancellation_reason}</div>}<div style={styles.notificationData}><span>Cantidad <b>{item.movement_type === "in" ? "+" : "-"}{formatNumber(item.quantity)}</b></span><span>Stock anterior <b>{formatNumber(item.previous_stock)}</b></span><span>Stock nuevo <b>{formatNumber(item.new_stock)}</b></span><span>Documento <b>{documentLabels[item.document_type]} {item.document_number}</b></span><span>Operador <b>{item.performed_by_name}</b></span></div><div style={styles.notificationActions}>{item.movement_type === "in" && !item.cancelled && <button onClick={() => cancelIncome(item)} style={styles.actionDanger}>Anular ingreso</button>}{!item.reviewed ? <button onClick={() => reviewMovement(item.id)} style={styles.actionPrimary}>Marcar como revisada</button> : <span style={styles.reviewedBadge}>Revisada</span>}</div></article>) : <div style={styles.operatorEmptyLocation}>No hay movimientos para este filtro.</div>}</div>}
  </Section>;
}

function AdminProfiles({ currentUserId }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadProfiles() {
    setLoading(true); setError("");
    const result = await supabase.from("profiles").select("id, display_name, role, can_adjust_stock, created_at, updated_at").order("display_name");
    if (result.error) setError(result.error.message);
    else setProfiles(result.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadProfiles(); }, []);

  async function toggleOperatorStock(item) {
    if (item.role !== "operator") return;
    setSavingId(item.id); setError(""); setMessage("");
    const nextValue = !item.can_adjust_stock;
    const result = await supabase.from("profiles").update({ can_adjust_stock: nextValue, updated_at: new Date().toISOString() }).eq("id", item.id).select("id, can_adjust_stock").single();
    if (result.error) setError(result.error.message);
    else { setProfiles((current) => current.map((profile) => profile.id === item.id ? { ...profile, can_adjust_stock: nextValue } : profile)); setMessage(nextValue ? "Modificación de stock habilitada." : "Modificación de stock deshabilitada."); }
    setSavingId("");
  }

  async function changeRole(id, role) {
    if (id === currentUserId) return setError("Por seguridad, no puedes cambiar tu propio rol desde la aplicación.");
    setSavingId(id); setError(""); setMessage("");
    const result = await supabase.from("profiles").update({ role, can_adjust_stock: role === "operator" ? false : false, updated_at: new Date().toISOString() }).eq("id", id).select("id, role").single();
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
              <option value="operator">Operador · Consulta móvil</option>
              <option value="editor">Editor · Puede editar</option>
              <option value="admin">Administrador · Control total</option>
            </select>
            {item.role === "operator" && <label style={styles.operatorPermissionToggle}><input type="checkbox" checked={Boolean(item.can_adjust_stock)} disabled={savingId === item.id} onChange={() => toggleOperatorStock(item)} /><span>{item.can_adjust_stock ? "Modificar stock: habilitado" : "Modificar stock: deshabilitado"}</span></label>}
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

const roleLabels = { viewer: "Viewer", operator: "Operador", editor: "Editor", admin: "Administrador" };
const roleBadgeStyles = {
  viewer: { background: "#F2F4F7", color: "#475467" },
  operator: { background: "#E7FBFB", color: "#007C7D" },
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
    { target: "envases", singular: "Calle", plural: "Envases" },
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

function MaestroProductos({ rackCells, driveCells, envaseCells, canEdit, isAdmin, userId, onNavigate, onAssign }) {
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
  const [quickEdit, setQuickEdit] = useState(null);

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
  Object.entries(envaseCells).forEach(([key, sku]) => {
    const normalized = String(sku || "").trim();
    if (!normalized) return;
    const [street, level, position] = key.split("-");
    if (!locationsBySku[normalized]) locationsBySku[normalized] = [];
    locationsBySku[normalized].push({ label: `ENV-C${String(street).padStart(2,"0")} · N${level} · P${position}`, target: "envases", unit: Number(street), level: Number(level), slot: Number(position) });
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

  async function saveQuickEdit() {
    if (!quickEdit || !canEdit) return;
    const value = Math.max(0, Number(quickEdit.value) || 0);
    const result = await supabase.from("products").update({ [quickEdit.field]: value, updated_by: userId, updated_at: new Date().toISOString() }).eq("sku", quickEdit.sku).select("sku, description, stock, units_per_pallet, observation, updated_at").single();
    if (result.error) setError(result.error.message);
    else setProducts((current) => current.map((item) => item.sku === quickEdit.sku ? result.data : item));
    setQuickEdit(null);
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
          <td onDoubleClick={() => canEdit && !editing && setQuickEdit({ sku: item.sku, field: "stock", value: item.stock })} style={canEdit ? styles.quickEditableCell : undefined}>{quickEdit?.sku === item.sku && quickEdit.field === "stock" ? <input autoFocus type="number" min="0" step="any" value={quickEdit.value} onChange={(event) => setQuickEdit({ ...quickEdit, value: event.target.value })} onBlur={saveQuickEdit} onKeyDown={(event) => { if (event.key === "Enter") saveQuickEdit(); if (event.key === "Escape") setQuickEdit(null); }} style={styles.tableInputSmall} /> : editing ? <input type="number" min="0" step="any" value={editDraft.stock} onChange={(e) => setEditDraft({ ...editDraft, stock: e.target.value })} style={styles.tableInputSmall} /> : formatNumber(item.stock)}</td>
          <td onDoubleClick={() => canEdit && !editing && setQuickEdit({ sku: item.sku, field: "units_per_pallet", value: item.units })} style={canEdit ? styles.quickEditableCell : undefined}>{quickEdit?.sku === item.sku && quickEdit.field === "units_per_pallet" ? <input autoFocus type="number" min="0" step="any" value={quickEdit.value} onChange={(event) => setQuickEdit({ ...quickEdit, value: event.target.value })} onBlur={saveQuickEdit} onKeyDown={(event) => { if (event.key === "Enter") saveQuickEdit(); if (event.key === "Escape") setQuickEdit(null); }} style={styles.tableInputSmall} /> : editing ? <input type="number" min="0" step="any" value={editDraft.units_per_pallet} onChange={(e) => setEditDraft({ ...editDraft, units_per_pallet: e.target.value })} style={styles.tableInputSmall} /> : formatNumber(item.units)}</td>
          <td>{item.units > 0 ? item.pallets.toFixed(2) : "—"}</td>
          <td><strong>{item.assigned}</strong></td>
          <td><span style={{ ...styles.differenceBadge, ...(item.difference < -0.01 ? styles.diffNegative : item.difference > 0.01 ? styles.diffPositive : styles.diffBalanced) }}>{item.units > 0 ? `${item.difference < -0.01 ? "! " : ""}${signedNumber(item.difference)}` : "—"}</span></td>
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
  applicationBody: { maxWidth: 1540, margin: "0 auto", display: "grid", gridTemplateColumns: "248px minmax(0,1fr)", gap: 18, alignItems: "start" },
    sideNav: { position: "sticky", top: 14, minHeight: "calc(100vh - 40px)", padding: 10, display: "grid", alignContent: "start", gap: 5, border: `1px solid ${COLORS.border}`, borderRadius: 18, background: "#FFFFFF", boxShadow: "0 12px 32px rgba(16,24,40,.08)" },
    sideNavRoot: { width: "100%", padding: "12px 13px", display: "grid", gridTemplateColumns: "24px minmax(0,1fr) auto", alignItems: "center", gap: 8, border: 0, borderRadius: 11, background: "transparent", color: "#344054", textAlign: "left", cursor: "pointer" },
    sideNavActive: { background: "linear-gradient(135deg,#00C1C2,#009A9B)", color: "#FFFFFF", boxShadow: "0 6px 16px rgba(0,193,194,.22)" },
    sideTree: { display: "grid", gap: 4 },
    sideWarehouseButton: { width: "100%", padding: "9px 12px", display: "flex", alignItems: "center", gap: 7, border: 0, borderRadius: 9, background: "#F7FAFC", color: COLORS.text, textAlign: "left", cursor: "pointer" },
    sideWarehouseChildren: { margin: "3px 0 7px 18px", paddingLeft: 9, display: "grid", gap: 3, borderLeft: `2px solid ${COLORS.border}` },
    sideLink: { padding: "8px 10px", border: 0, borderRadius: 8, background: "transparent", color: COLORS.muted, textAlign: "left", fontSize: 11, cursor: "pointer" },
    sideLinkActive: { background: "#E7FBFB", color: COLORS.turquoiseDark, fontWeight: 850 },
    sideNavDivider: { height: 1, margin: "6px 4px", background: COLORS.border },
    mainWorkspace: { minWidth: 0 },
    homeDashboard: { display: "grid", gap: 16 },
    homeHero: { position: "relative", minHeight: 510, overflow: "hidden", borderRadius: 22, background: "#071F2A", boxShadow: "0 18px 48px rgba(16,24,40,.18)" },
    homeHeroImage: { width: "100%", height: "100%", minHeight: 510, display: "block", objectFit: "cover" },
    brandStripSection: { padding: "8px 18px", overflow: "hidden", border: `1px solid ${COLORS.border}`, borderRadius: 18, background: "#FFFFFF", boxShadow: "0 10px 28px rgba(16,24,40,.08)" },
    brandStripImage: { width: "100%", height: "auto", maxHeight: 128, display: "block", objectFit: "contain", objectPosition: "center", background: "transparent" },
    operatorShell: { minHeight: "100vh", background: "#F2F6F7", color: COLORS.text },
  operatorHeader: { position: "sticky", top: 0, zIndex: 10, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#071F2A", color: "#FFFFFF", boxShadow: "0 5px 18px rgba(7,31,42,.24)" },
  operatorBrand: { display: "block", color: COLORS.turquoise, fontSize: 22, fontWeight: 950, letterSpacing: ".06em" },
  operatorLogout: { padding: "9px 13px", border: "1px solid rgba(255,255,255,.35)", borderRadius: 10, background: "transparent", color: "#FFFFFF", fontWeight: 800 },
  operatorMain: { width: "min(100%,560px)", margin: "0 auto", padding: "20px 14px 36px", display: "grid", gap: 16 },
  operatorWelcome: { display: "grid", gap: 4 },
  operatorSearchForm: { padding: 14, display: "grid", gap: 8, border: `1px solid ${COLORS.border}`, borderRadius: 16, background: "#FFFFFF", boxShadow: "0 8px 22px rgba(16,24,40,.08)", fontSize: 13, fontWeight: 800 },
  operatorSearchRow: { display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8 },
  operatorSearchInput: { minWidth: 0, padding: "14px 13px", border: `2px solid ${COLORS.turquoise}`, borderRadius: 12, fontSize: 21, fontWeight: 850, letterSpacing: ".06em", outline: "none" },
  operatorSearchButton: { padding: "0 18px", border: 0, borderRadius: 12, background: COLORS.turquoiseDark, color: "#FFFFFF", fontSize: 15, fontWeight: 900 },
  operatorStatus: { padding: 24, borderRadius: 14, background: "#FFFFFF", textAlign: "center", color: COLORS.muted },
  operatorNotFound: { padding: 18, display: "grid", gap: 5, border: "1px solid #FDA29B", borderRadius: 14, background: "#FFF1F1", color: "#B42318" },
  operatorResult: { display: "grid", gap: 14 },
  operatorProductHead: { padding: "17px 16px", borderRadius: 16, background: "linear-gradient(135deg,#071F2A,#0B3B4A)", color: "#FFFFFF", boxShadow: "0 10px 26px rgba(7,31,42,.18)" },
  operatorMetricGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 9 },
  operatorMetric: { minHeight: 82, padding: 12, display: "grid", alignContent: "space-between", gap: 7, border: `1px solid ${COLORS.border}`, borderRadius: 14, background: "#FFFFFF" },
  operatorMetricAlert: { borderColor: "#F04438", background: "#FFF1F1", color: "#B42318" },
  operatorOverstock: { padding: 12, borderRadius: 12, background: "#F04438", color: "#FFFFFF", fontSize: 13, fontWeight: 900 },
  operatorLocations: { display: "grid", gap: 9 },
  operatorLocationCard: { padding: 14, display: "grid", gap: 4, border: `1px solid ${COLORS.turquoise}`, borderRadius: 14, background: "#FFFFFF", boxShadow: "0 6px 16px rgba(16,24,40,.06)" },
  operatorMovementCard: { padding: 16, display: "grid", gap: 12, border: `1px solid ${COLORS.border}`, borderRadius: 16, background: "#FFFFFF", boxShadow: "0 8px 22px rgba(16,24,40,.08)" },
  operatorMovementTabs: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 },
  operatorMovementTab: { padding: 11, border: `1px solid ${COLORS.border}`, borderRadius: 10, background: "#FFFFFF", color: COLORS.muted, fontWeight: 800 },
  operatorMovementActiveIn: { padding: 11, border: "1px solid #12B76A", borderRadius: 10, background: "#ECFDF3", color: "#027A48", fontWeight: 900 },
  operatorMovementActiveOut: { padding: 11, border: "1px solid #F04438", borderRadius: 10, background: "#FFF1F1", color: "#B42318", fontWeight: 900 },
  operatorField: { display: "grid", gap: 6, fontSize: 12, fontWeight: 800 },
  operatorControlInput: { width: "100%", padding: "12px 11px", border: `1px solid ${COLORS.border}`, borderRadius: 10, boxSizing: "border-box", background: "#FFFFFF", fontSize: 16 },
  operatorSubmitIn: { padding: 13, border: 0, borderRadius: 11, background: "#12B76A", color: "#FFFFFF", fontWeight: 900, fontSize: 15 },
  operatorSubmitOut: { padding: 13, border: 0, borderRadius: 11, background: "#F04438", color: "#FFFFFF", fontWeight: 900, fontSize: 15 },
  operatorMovementError: { padding: 10, borderRadius: 9, background: "#FFF1F1", color: "#B42318", fontSize: 12 },
  operatorMovementSuccess: { padding: 10, borderRadius: 9, background: "#ECFDF3", color: "#027A48", fontSize: 12 },
  operatorPermissionToggle: { padding: "7px 9px", display: "flex", alignItems: "center", gap: 7, borderRadius: 9, background: "#F7FFFF", color: COLORS.turquoiseDark, fontSize: 10, fontWeight: 800 },
  notificationActions: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
  notificationCancelled: { opacity: .72, background: "#F2F4F7", borderLeft: "5px solid #667085" },
  cancelledBadge: { padding: 8, borderRadius: 8, background: "#E4E7EC", color: "#344054", fontSize: 10, fontWeight: 850 },
  notificationFilters: { marginBottom: 14, display: "flex", gap: 7, flexWrap: "wrap" },
  notificationList: { display: "grid", gap: 11 },
  notificationCard: { padding: 15, display: "grid", gap: 9, border: `1px solid ${COLORS.border}`, borderRadius: 13, background: "#FFFFFF" },
  notificationIn: { borderLeft: "5px solid #12B76A" },
  notificationOut: { borderLeft: "5px solid #F04438" },
  notificationHeader: { display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" },
  notificationData: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 8, color: COLORS.muted, fontSize: 11 },
  reviewedBadge: { width: "fit-content", padding: "6px 9px", borderRadius: 999, background: "#ECFDF3", color: "#027A48", fontSize: 10, fontWeight: 850 },
  operatorEmptyLocation: { padding: 18, borderRadius: 14, background: "#FFFFFF", color: COLORS.muted, textAlign: "center" },
  app: { minHeight: "100vh", padding: 24, background: COLORS.background, color: COLORS.text, fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  header: { maxWidth: 1280, margin: "0 auto 22px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" },
  eyebrow: { margin: "0 0 6px", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800, letterSpacing: ".16em" },
  title: { margin: 0, fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.1 },
  subtitle: { margin: "10px 0 0", color: COLORS.muted, fontSize: 15 },
  version: { padding: "8px 12px", height: "fit-content", borderRadius: 999, background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800 },
  brandBlock: { width: 248, display: "grid", gap: 4, justifyItems: "center", alignContent: "center" },
  headerLogo: { width: 210, height: 62, display: "block", objectFit: "contain", objectPosition: "center" },
  systemTitle: { color: COLORS.text, fontSize: 12, fontWeight: 950, letterSpacing: ".02em", textAlign: "center" },
  headerTools: { width: "100%", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" },
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
  userControlStack: { display: "grid", gap: 5, justifyItems: "end" },
  desktopNotificationToggle: { display: "flex", alignItems: "center", gap: 6, color: COLORS.muted, fontSize: 10, cursor: "pointer" },
  operatorHeaderActions: { display: "flex", alignItems: "center", gap: 8 },
  operatorNotificationToggle: { display: "flex", alignItems: "center", gap: 5, color: "#FFFFFF", fontSize: 10 },
  userCard: { minHeight: 46, padding: "5px 10px 5px 6px", display: "flex", alignItems: "center", gap: 9, border: `1px solid ${COLORS.border}`, borderRadius: 13, background: "#FFFFFF", boxShadow: "0 7px 22px rgba(16,24,40,.06)" },
  userAvatar: { width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 11, fontWeight: 900 },
  userText: { display: "grid", gap: 2, minWidth: 105, fontSize: 12 },
  onlineDot: { width: 8, height: 8, borderRadius: 999, background: "#22C55E", boxShadow: "0 0 0 3px #DCFCE7" },
  authPage: { minHeight: "100vh", padding: 24, display: "grid", placeItems: "center", background: "linear-gradient(145deg,#E7FBFB,#F3F6F8 55%,#FFFFFF)" },
  loginCard: { width: "min(390px,100%)", padding: 30, display: "grid", gap: 10, border: `1px solid ${COLORS.border}`, borderRadius: 20, background: "#FFFFFF", boxShadow: "0 24px 70px rgba(16,24,40,.14)" },
  loginLogo: { width: "100%", maxWidth: 285, height: 82, margin: "0 auto 8px", display: "block", objectFit: "contain" },
  loginTitle: { margin: 0, fontSize: 25, textAlign: "center" },
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
  storageDetailAnchor: { position: "relative" },
  cellDetailPanel: { position: "fixed", zIndex: 120, padding: 20, display: "grid", gap: 14, border: `2px solid ${COLORS.turquoise}`, borderRadius: 16, background: "#FFFFFF", boxShadow: "0 18px 46px rgba(16,24,40,.22)" },
  cellDetailPanelOverstock: { borderColor: "#F04438", background: "#FFF7F7", boxShadow: "inset 4px 0 0 #F04438, 0 12px 28px rgba(180,35,24,.12)" },
  cellDetailHeading: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  cellDetailSku: { display: "block", color: COLORS.text, fontSize: 25, fontWeight: 900 },
  cellDetailArea: { padding: "5px 8px", width: "fit-content", borderRadius: 999, background: "#E7FBFB", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 850 },
  cellDetailDescription: { margin: 0, minHeight: 34, color: COLORS.muted, fontSize: 15, lineHeight: 1.5 },
  cellDetailMetrics: { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 },
  cellDetailMetric: { padding: "8px 7px", display: "grid", gap: 3, border: `1px solid ${COLORS.border}`, borderRadius: 9, background: "#F8FAFC", fontSize: 14 },
  cellDetailLoading: { padding: 18, color: COLORS.muted, textAlign: "center", fontSize: 15 },
  cellDetailMissing: { padding: 8, borderRadius: 8, background: "#FFF1F1", color: "#B42318", fontSize: 13 },
  cellDetailDangerText: { color: "#B42318" },
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
  quickEditableCell: { cursor: "cell", background: "#FBFFFF" },
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
  envOverview: { display: "grid", gridTemplateColumns: "280px minmax(0,1fr)", gap: 16, alignItems: "start" },
  envSkuSidebar: { position: "sticky", top: 12, maxHeight: "calc(100vh - 40px)", display: "grid", gridTemplateRows: "auto auto minmax(0,1fr) auto", border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", background: "#FFFFFF" },
  envSidebarHeader: { padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F7FFFF" },
  envSkuSearch: { margin: "0 12px 10px", padding: "9px 10px", border: `1px solid ${COLORS.border}`, borderRadius: 9, outline: "none" },
  envSkuList: { padding: "0 8px 8px", display: "grid", gap: 5, overflowY: "auto" },
  overstockPanel: { background: "#FFF1F1", borderColor: "#F04438", color: "#B42318", boxShadow: "inset 4px 0 0 #F04438" },
  overstockPercent: { background: "#F04438", color: "#FFFFFF" },
  overstockMark: { display: "inline-flex", alignItems: "center", gap: 4, color: "#B42318", fontSize: 10, fontWeight: 900 },
  overstockIconCompact: { width: 16, height: 16, display: "inline-grid", placeItems: "center", marginRight: 4, borderRadius: "50%", background: "#B42318", color: "#FFFFFF", fontSize: 11, fontWeight: 900, lineHeight: 1 },
  envSkuItem: { padding: "9px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, border: `1px solid ${COLORS.border}`, borderRadius: 9, background: "#FFFFFF", color: COLORS.text, textAlign: "left", cursor: "pointer" },
  envSkuItemInfo: { minWidth: 0, display: "grid", gap: 4 },
  envSkuPercent: { flex: "0 0 auto", padding: "5px 7px", borderRadius: 999, background: "#E7FBFB", color: COLORS.turquoiseDark, fontSize: 10, fontWeight: 800 },
  envSkuItemActive: { borderColor: COLORS.turquoiseDark, background: "#DDF9F8", boxShadow: "inset 4px 0 0 #00C1C2" },
  envSidebarHint: { padding: 10, borderTop: `1px solid ${COLORS.border}`, background: "#F8FAFC", color: COLORS.muted, fontSize: 9 },
  envMapPanel: { minWidth: 0, border: `1px solid ${COLORS.border}`, borderRadius: 14, overflow: "hidden", background: "#FFFFFF" },
  envMapHeader: { padding: 14, display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", borderBottom: `1px solid ${COLORS.border}` },
  envSelectedSummary: { padding: "10px 14px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 11 },
  envMapCanvas: { position: "relative", minWidth: 820, aspectRatio: "1.62 / 1", overflow: "hidden", background: "linear-gradient(145deg,#EEF3F5,#DCE7E9)", border: `2px solid ${COLORS.turquoiseDark}`, borderRadius: 18, boxShadow: "0 16px 36px rgba(16,24,40,.12)" },
  envFixedArea: { position: "absolute", display: "grid", placeItems: "center", border: `1px solid ${COLORS.border}`, borderRadius: 10, background: "rgba(255,255,255,.88)", color: COLORS.muted, fontSize: 12, fontWeight: 700, letterSpacing: ".02em", textAlign: "center", boxSizing: "border-box", boxShadow: "0 5px 14px rgba(16,24,40,.06)" },
  verticalLabel: { position: "absolute", left: 3, top: "50%", transform: "translateY(-50%) rotate(-90deg)", fontSize: 7 },
  envSkuMapBlock: { position: "absolute", padding: 7, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, flexWrap: "wrap", border: `1.5px solid ${COLORS.turquoiseDark}`, borderRadius: 11, fontSize: 11, fontWeight: 650, cursor: "pointer", boxSizing: "border-box", transition: ".18s ease", boxShadow: "0 5px 13px rgba(0,154,155,.14)" },
  envLandmarkBlock: { display: "grid", placeItems: "center", border: "2px solid #98A2B3", borderRadius: 9, background: "#FFFFFF", color: "#475467", fontSize: 10, fontWeight: 900, textAlign: "center" },
  envMapZone: { padding: 8, border: `2px solid ${COLORS.turquoiseDark}`, borderRadius: 10, overflow: "auto", background: "#F7FFFF" },
  envMapZoneTitle: { display: "block", marginBottom: 6, color: COLORS.turquoiseDark, fontSize: 10 },
  envMapStreets: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(90px,1fr))", gap: 5 },
  envMapStreet: { minHeight: 45, padding: 5, display: "grid", gap: 2, placeItems: "center", border: `1px solid ${COLORS.turquoiseDark}`, borderRadius: 7, background: "#FFFFFF", color: COLORS.text, fontSize: 8, cursor: "pointer", transition: ".18s ease" },
  envMapStreetSelected: { transform: "scale(1.04)", zIndex: 2, background: "#FFF3BF", borderColor: "#F59E0B", boxShadow: "0 0 0 3px rgba(245,158,11,.25)" },
  envMapStreetFaded: { opacity: .18, filter: "grayscale(.8)" },
  envDetailHeader: { padding: 18, display: "grid", gridTemplateColumns: "auto minmax(260px,1fr) auto", alignItems: "center", gap: 18, borderBottom: `1px solid ${COLORS.border}`, background: "linear-gradient(135deg,#FFFFFF,#F7FFFF)" },
  envDetailIdentity: { minWidth: 0, display: "grid", gap: 4 },
  envDetailSkuRow: { display: "flex", alignItems: "center", gap: 8 },
  envNavArrow: { width: 30, height: 30, display: "grid", placeItems: "center", border: `1px solid ${COLORS.turquoise}`, borderRadius: 9, background: "#E7FBFB", color: COLORS.turquoiseDark, fontSize: 22, lineHeight: 1, cursor: "pointer" },
  envDetailTitle: { margin: 0, fontSize: 24, color: COLORS.text },
  envSkuEditButton: { padding: 0, display: "flex", alignItems: "center", gap: 7, border: 0, background: "transparent", color: COLORS.text, cursor: "pointer" },
  envSkuEditInput: { width: 150, padding: "5px 8px", border: `2px solid ${COLORS.turquoise}`, borderRadius: 9, color: COLORS.text, fontSize: 24, fontWeight: 900, outline: "none" },
  envProductData: { display: "flex", alignItems: "stretch", gap: 8, flexWrap: "wrap" },
  envProductDataItem: { display: "grid", gap: 2 },
  envDetailDescription: { margin: "4px 0 0", color: COLORS.muted, fontSize: 12, fontWeight: 600 },
  envDetailStats: { display: "grid", gridTemplateColumns: "repeat(5,minmax(70px,auto))", gap: 7 },
  envSelectionToolbar: { padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", borderBottom: `1px solid ${COLORS.border}`, background: "#F7FFFF", fontSize: 11 },
    envDetailMetric: { padding: "8px 10px", display: "grid", gap: 2, border: `1px solid ${COLORS.border}`, borderRadius: 10, background: "#FFFFFF", textAlign: "center" },
  envNewStreetForm: { margin: 14, padding: 12, display: "flex", alignItems: "end", gap: 10, flexWrap: "wrap", border: `1px solid ${COLORS.turquoise}`, borderRadius: 12, background: "#F7FFFF" },
  envStreetIdentity: { display: "grid", gap: 3 },
  envStructureDanger: { padding: "5px 7px", border: "1px solid rgba(255,255,255,.8)", borderRadius: 7, background: "#B42318", color: "#FFFFFF", fontSize: 9, fontWeight: 800, cursor: "pointer" },
    envDetailGrid: { padding: 16, display: "grid", gap: 14, background: "#F3F6F8" },
  envLayout: { border: `1px solid ${COLORS.border}`, borderRadius: 16, overflow: "hidden", background: "#FFFFFF" },
  envCanvas: { padding: 18, display: "grid", gap: 20, background: "#F3F6F8" },
  envZone: { padding: 14, border: `1px solid ${COLORS.border}`, borderRadius: 14, background: "#FFFFFF" },
  envZoneHeader: { marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", color: COLORS.turquoiseDark },
  envLandmarks: { display: "flex", gap: 6, flexWrap: "wrap" },
  envLandmarks: { display: "flex", gap: 6, flexWrap: "wrap" },
  envStreetGrid: { display: "grid", gridTemplateColumns: "repeat(2,minmax(480px,1fr))", gap: 14, overflowX: "auto" },
  envStreet: { minWidth: 480, border: `1.5px solid ${COLORS.turquoiseDark}`, borderRadius: 14, overflow: "hidden", background: "#FFFFFF" },
  envStreetHeaderActions: { display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },
  envStructureButton: { padding: "5px 7px", border: "1px solid rgba(255,255,255,.65)", borderRadius: 7, background: "rgba(255,255,255,.16)", color: "#FFFFFF", fontSize: 9, fontWeight: 800, cursor: "pointer" },
  envSaveState: { marginTop: 3, display: "block", color: COLORS.muted, fontSize: 9 },
  envDesignActive: { boxShadow: "inset 0 0 0 2px #00C1C2", cursor: "crosshair" },
  envDesignBlocked: { border: "2px dashed #00C1C2", color: COLORS.turquoiseDark, cursor: "pointer" },
    envStreetHeader: { padding: "9px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", background: COLORS.turquoise, color: "#FFFFFF" },
  envReference: { padding: "5px 10px", background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 9, fontWeight: 800 },
  envMatrix: { display: "grid", overflowX: "auto" },
  envCorner: { minHeight: 28, display: "grid", placeItems: "center", background: COLORS.turquoiseDark, color: "#FFFFFF", fontSize: 9, fontWeight: 900 },
  envPositionHeader: { minHeight: 28, display: "grid", placeItems: "center", borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 9, fontWeight: 900 },
  envLevelLabel: { minHeight: 37, display: "grid", placeItems: "center", borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, background: "#F7FFFF", color: COLORS.turquoiseDark, fontWeight: 900 },
  envCell: { width: "100%", minWidth: 0, height: 37, padding: "3px", border: 0, borderRight: `1px solid ${COLORS.turquoiseDark}`, borderBottom: `1px solid ${COLORS.turquoiseDark}`, outline: "none", boxSizing: "border-box", textAlign: "center", fontSize: 9, fontWeight: 700 },
  envBlocked: { minHeight: 37, display: "grid", placeItems: "center", borderRight: `1px solid #98A2B3`, borderBottom: `1px solid #98A2B3`, background: "repeating-linear-gradient(135deg,#D0D5DD,#D0D5DD 5px,#EAECF0 5px,#EAECF0 10px)", color: "#475467", fontSize: 8, fontWeight: 900 },
  placeholder: { minHeight: 220, padding: 28, display: "flex", alignItems: "flex-start", gap: 16, border: `1px dashed ${COLORS.border}`, borderRadius: 14, background: "#FBFDFE" },
  placeholderCode: { width: 50, height: 50, flex: "0 0 50px", display: "grid", placeItems: "center", borderRadius: 14, background: COLORS.turquoise, color: "#fff", fontWeight: 850 },
  pending: { marginTop: 18, color: COLORS.turquoiseDark, fontSize: 13, fontWeight: 750 },
};
