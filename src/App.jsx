import React, { useState } from "react";

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
  const [mainTab, setMainTab] = useState("b70");
  const [sub70, setSub70] = useState("racks");
  const [sub60, setSub60] = useState("envases");
  const [searchSku, setSearchSku] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [rackCells, setRackCells] = useState({
    "1-3-1": "10601105",
    "4-2-3": "10601105",
  });
  const [driveCells, setDriveCells] = useState({
    "1-3-1": "10601105",
  });

  const normalizedSearch = searchSku.trim().toLowerCase();
  const searchResults = normalizedSearch
    ? [
        ...Object.entries(rackCells)
          .filter(([, sku]) => String(sku).toLowerCase().includes(normalizedSearch))
          .map(([key, sku]) => {
            const [rack, level, position] = key.split("-");
            return {
              id: `rack-${key}`,
              sku,
              area: "Racks Selectivos",
              coordinate: `RACK ${rack} · N${level} · P${position}`,
              target: "racks",
            };
          }),
        ...Object.entries(driveCells)
          .filter(([, sku]) => String(sku).toLowerCase().includes(normalizedSearch))
          .map(([key, sku]) => {
            const [street, level, depth] = key.split("-");
            return {
              id: `drive-${key}`,
              sku,
              area: "Racks Drive In",
              coordinate: `CALLE ${String(street).padStart(2, "0")} · N${level} · PROF. ${depth}`,
              target: "drive",
            };
          }),
      ]
    : [];

  function navigateToResult(result) {
    setMainTab("b70");
    setSub70(result.target);
    setSearchOpen(false);
  }

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
              <input
                value={searchSku}
                onChange={(event) => {
                  setSearchSku(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Buscar SKU"
                aria-label="Buscar SKU"
                style={styles.searchInput}
              />
              {searchSku && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchSku("");
                    setSearchOpen(false);
                  }}
                  style={styles.clearSearch}
                  aria-label="Limpiar búsqueda"
                >
                  ×
                </button>
              )}
            </div>

            {searchOpen && searchSku.trim() && (
              <div style={styles.searchPanel}>
                <div style={styles.searchSummary}>
                  <div>
                    <span style={styles.searchSummaryLabel}>SKU buscado</span>
                    <strong style={styles.searchSkuValue}>{searchSku.trim()}</strong>
                  </div>
                  <div style={styles.positionCount}>
                    <strong>{searchResults.length}</strong>
                    <span>{searchResults.length === 1 ? "posición" : "posiciones"}</span>
                  </div>
                </div>

                <div style={styles.resultList}>
                  {searchResults.length ? (
                    searchResults.map((result) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => navigateToResult(result)}
                        style={styles.resultItem}
                      >
                        <span style={styles.resultMarker}>●</span>
                        <span style={styles.resultText}>
                          <strong>{result.coordinate}</strong>
                          <small>{result.area}</small>
                        </span>
                        <span style={styles.resultArrow}>›</span>
                      </button>
                    ))
                  ) : (
                    <div style={styles.noResults}>No hay posiciones asignadas a este SKU.</div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div style={styles.userCard}>
            <div style={styles.userAvatar}>AD</div>
            <div style={styles.userText}>
              <strong>Administrador</strong>
              <span>Usuario activo</span>
            </div>
            <span style={styles.onlineDot} />
          </div>
        </div>
      </header>

      <nav style={styles.mainNav} aria-label="Navegación principal">
        <Tab active={mainTab === "b70"} onClick={() => setMainTab("b70")}>Bodega 70</Tab>
        <Tab active={mainTab === "b60"} onClick={() => setMainTab("b60")}>Bodega 60</Tab>
        <Tab active={mainTab === "master"} onClick={() => setMainTab("master")}>Maestro de Productos</Tab>
      </nav>

      <main style={styles.content}>
        {mainTab === "b70" && (
          <Bodega70
            activeTab={sub70}
            onTabChange={setSub70}
            rackCells={rackCells}
            setRackCells={setRackCells}
            driveCells={driveCells}
            setDriveCells={setDriveCells}
          />
        )}
        {mainTab === "b60" && <Bodega60 activeTab={sub60} onTabChange={setSub60} />}
        {mainTab === "master" && <MaestroProductos />}
      </main>
    </div>
  );
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
        <span style={styles.status}>V3.3 operativa</span>
      </div>
      {children}
    </section>
  );
}

function Bodega70({ activeTab, onTabChange, rackCells, setRackCells, driveCells, setDriveCells }) {
  return (
    <Section title="Bodega 70" description="Racks selectivos y almacenamiento compacto Drive In.">
      <SubNav
        tabs={[{ id: "racks", label: "Racks Selectivos" }, { id: "drive", label: "Racks Drive In" }]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      {activeTab === "racks" && <RacksSelectivos cells={rackCells} setCells={setRackCells} />}
      {activeTab === "drive" && <DriveIn cells={driveCells} setCells={setDriveCells} />}
    </Section>
  );
}

function DriveIn({ cells, setCells }) {
  const [activeCell, setActiveCell] = useState("");
  const streets = Array.from({ length: 23 }, (_, index) => index + 1);

  function updateCell(street, level, depth, value) {
    const key = `${street}-${level}-${depth}`;
    setCells((current) => ({ ...current, [key]: value }));
  }

  return (
    <div style={styles.driveArea}>
      <div style={styles.layoutToolbar}>
        <div>
          <h3 style={styles.areaTitle}>Racks Drive In</h3>
          <p style={styles.areaDescription}>
            23 calles independientes, cada una con 5 posiciones de profundidad y 3 niveles de altura. Todas las celdas son editables.
          </p>
        </div>
        <span style={styles.summaryBadge}>345 celdas editables</span>
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
          />
        ))}
      </div>
    </div>
  );
}

function DriveStreet({ street, cells, activeCell, setActiveCell, updateCell }) {
  const depths = [1, 2, 3, 4, 5];
  const levels = [3, 2, 1];

  return (
    <article style={styles.driveStreet}>
      <div style={styles.driveStreetHeader}>
        Calle {String(street).padStart(2, "0")}
      </div>

      <div style={styles.driveMatrixWrap}>
        <div style={styles.driveMatrix}>
          <div style={styles.driveCorner}>NIVEL</div>
          {depths.map((depth) => (
            <div key={`depth-${depth}`} style={styles.driveDepthHeader}>
              PROF. {depth}
            </div>
          ))}

          {levels.flatMap((level) => [
            <div key={`label-${level}`} style={styles.driveLevelLabel}>
              N{level}
            </div>,
            ...depths.map((depth) => {
              const key = `${street}-${level}-${depth}`;
              return (
                <input
                  key={key}
                  value={cells[key] || ""}
                  onFocus={() => setActiveCell(key)}
                  onChange={(event) => updateCell(street, level, depth, event.target.value)}
                  aria-label={`Calle ${street}, nivel ${level}, profundidad ${depth}`}
                  placeholder="SKU"
                  style={{
                    ...styles.driveCell,
                    ...(level === 3 ? styles.levelThree : {}),
                    ...(level === 2 ? styles.levelTwo : {}),
                    ...(level === 1 ? styles.levelOne : {}),
                    ...(activeCell === key ? styles.driveCellActive : {}),
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

function RacksSelectivos({ cells, setCells }) {
  const [activeCell, setActiveCell] = useState("");

  function updateCell(rack, level, position, value) {
    const key = `${rack}-${level}-${position}`;
    setCells((current) => ({ ...current, [key]: value }));
  }

  return (
    <div style={styles.fullLayoutArea}>
      <div style={styles.layoutToolbar}>
        <div>
          <h3 style={styles.areaTitle}>Plano completo de Racks Selectivos</h3>
          <p style={styles.areaDescription}>Racks 1 al 11. Haz clic en cualquier celda para escribir, modificar o borrar el SKU.</p>
        </div>
        <span style={styles.summaryBadge}>Celdas editables</span>
      </div>

      <div style={styles.canvasScroller}>
        <div style={styles.warehouseCanvas}>
          {RACKS.map((rack) => (
            <div key={rack.number} className={rack.className} style={{ ...styles.rackPlacement, ...rackPlacements[rack.className] }}>
              <WarehouseRack rack={rack} cells={cells} activeCell={activeCell} setActiveCell={setActiveCell} updateCell={updateCell} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WarehouseRack({ rack, cells, activeCell, setActiveCell, updateCell }) {
  const positions = Array.from({ length: rack.positions }, (_, index) => index + 1);
  const levels = [3, 2, 1];

  return (
    <div style={styles.warehouseRack}>
      <div style={styles.rackName}>RACK {rack.number}</div>
      <div style={styles.rackMatrixWrap}>
        <div style={{ ...styles.rackMatrix, gridTemplateColumns: `repeat(${rack.positions}, minmax(0, 1fr))` }}>
          {positions.map((position) => <div key={`h-${position}`} style={styles.matrixPositionHeader}>P{position}</div>)}
          {levels.flatMap((level) => positions.map((position) => {
            const key = `${rack.number}-${level}-${position}`;
            return (
              <input
                key={key}
                value={cells[key] || ""}
                onFocus={() => setActiveCell(key)}
                onChange={(event) => updateCell(rack.number, level, position, event.target.value)}
                aria-label={`Rack ${rack.number}, nivel ${level}, posición ${position}`}
                style={{
                  ...styles.matrixCell,
                  ...(level === 3 ? styles.levelThree : {}),
                  ...(level === 2 ? styles.levelTwo : {}),
                  ...(level === 1 ? styles.levelOne : {}),
                  ...(activeCell === key ? styles.matrixCellActive : {}),
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

function MaestroProductos() {
  return (
    <Section title="Maestro de Productos" description="SKU, stock, palletizado, ubicaciones y diferencias.">
      <Placeholder code="MP" title="Maestro de Productos" text="Módulo preparado para la siguiente etapa." />
    </Section>
  );
}

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
  userCard: { minHeight: 46, padding: "5px 10px 5px 6px", display: "flex", alignItems: "center", gap: 9, border: `1px solid ${COLORS.border}`, borderRadius: 13, background: "#FFFFFF", boxShadow: "0 7px 22px rgba(16,24,40,.06)" },
  userAvatar: { width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 10, background: COLORS.turquoise, color: "#FFFFFF", fontSize: 11, fontWeight: 900 },
  userText: { display: "grid", gap: 2, minWidth: 105, fontSize: 12 },
  onlineDot: { width: 8, height: 8, borderRadius: 999, background: "#22C55E", boxShadow: "0 0 0 3px #DCFCE7" },
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
  placeholder: { minHeight: 220, padding: 28, display: "flex", alignItems: "flex-start", gap: 16, border: `1px dashed ${COLORS.border}`, borderRadius: 14, background: "#FBFDFE" },
  placeholderCode: { width: 50, height: 50, flex: "0 0 50px", display: "grid", placeItems: "center", borderRadius: 14, background: COLORS.turquoise, color: "#fff", fontWeight: 850 },
  pending: { marginTop: 18, color: COLORS.turquoiseDark, fontSize: 13, fontWeight: 750 },
};
