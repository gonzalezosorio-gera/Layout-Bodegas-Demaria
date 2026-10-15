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

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>DEMARÍA</p>
          <h1 style={styles.title}>Layout de Bodegas</h1>
          <p style={styles.subtitle}>Gestión visual de ubicaciones, materiales y productos.</p>
        </div>
        <div style={styles.version}>V3.1</div>
      </header>

      <nav style={styles.mainNav} aria-label="Navegación principal">
        <Tab active={mainTab === "b70"} onClick={() => setMainTab("b70")}>Bodega 70</Tab>
        <Tab active={mainTab === "b60"} onClick={() => setMainTab("b60")}>Bodega 60</Tab>
        <Tab active={mainTab === "master"} onClick={() => setMainTab("master")}>Maestro de Productos</Tab>
      </nav>

      <main style={styles.content}>
        {mainTab === "b70" && <Bodega70 activeTab={sub70} onTabChange={setSub70} />}
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
        <span style={styles.status}>V3.1 operativa</span>
      </div>
      {children}
    </section>
  );
}

function Bodega70({ activeTab, onTabChange }) {
  return (
    <Section title="Bodega 70" description="Racks selectivos y almacenamiento compacto Drive In.">
      <SubNav
        tabs={[{ id: "racks", label: "Racks Selectivos" }, { id: "drive", label: "Racks Drive In" }]}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
      {activeTab === "racks" && <RacksSelectivos />}
      {activeTab === "drive" && <Placeholder code="DI" title="Racks Drive In" text="Aquí construiremos las 23 calles Drive In." />}
    </Section>
  );
}

function RacksSelectivos() {
  const [cells, setCells] = useState({});
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
  header: { maxWidth: 1280, margin: "0 auto 22px", display: "flex", justifyContent: "space-between", gap: 20 },
  eyebrow: { margin: "0 0 6px", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800, letterSpacing: ".16em" },
  title: { margin: 0, fontSize: "clamp(28px,4vw,42px)", lineHeight: 1.1 },
  subtitle: { margin: "10px 0 0", color: COLORS.muted, fontSize: 15 },
  version: { padding: "8px 12px", height: "fit-content", borderRadius: 999, background: "#DDF9F8", color: COLORS.turquoiseDark, fontSize: 12, fontWeight: 800 },
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
  placeholder: { minHeight: 220, padding: 28, display: "flex", alignItems: "flex-start", gap: 16, border: `1px dashed ${COLORS.border}`, borderRadius: 14, background: "#FBFDFE" },
  placeholderCode: { width: 50, height: 50, flex: "0 0 50px", display: "grid", placeItems: "center", borderRadius: 14, background: COLORS.turquoise, color: "#fff", fontWeight: 850 },
  pending: { marginTop: 18, color: COLORS.turquoiseDark, fontSize: 13, fontWeight: 750 },
};
