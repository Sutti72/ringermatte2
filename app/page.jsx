"use client";
import { useState, useEffect } from "react";

// 🔑 Admin Passwort
const ADMIN_PASSWORD = "geheim123";

// LocalStorage Keys
const STORAGE_KEY_SETTINGS = "ringermatte-admin-settings";
const STORAGE_KEY_RES = "ringermatte-reservierungen";

export default function RingermattePage() {
  // ==========================
  // Admin-Einstellungen
  // ==========================
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(16);
  const [preis, setPreis] = useState(100);
  const [isAdmin, setIsAdmin] = useState(false);

  // ==========================
  // Reservierungen
  // ==========================
  const [reserved, setReserved] = useState({});
  const [loaded, setLoaded] = useState(false); // WICHTIG: verhindert Überschreiben beim Start

  // ==========================
  // UI States
  // ==========================
  const [selection, setSelection] = useState(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [vorname, setVorname] = useState("");
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ort, setOrt] = useState("");
  const [mail, setMail] = useState("");

  const [password, setPassword] = useState("");

  // ==========================
  // Hilfsfunktionen
  // ==========================
  const cellId = (r, c) => `${r}-${c}`;
  const parseCellId = (id) => id.split("-").map(Number);

  // ==========================
  // Lade Admin Settings
  // ==========================
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setRows(parsed.rows ?? 16);
        setCols(parsed.cols ?? 16);
        setPreis(parsed.preis ?? 100);
      } catch (e) {
        console.error("Fehler beim Laden der Admin-Settings", e);
      }
    }
  }, []);

  // Speichere Admin Settings
  useEffect(() => {
    const settings = { rows, cols, preis };
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [rows, cols, preis]);

  // ==========================
  // Lade Reservierungen
  // ==========================
  useEffect(() => {
    const rawRes = localStorage.getItem(STORAGE_KEY_RES);
    if (rawRes) {
      console.log("📂 Lade Reservierungen aus LocalStorage:", rawRes);
      setReserved(JSON.parse(rawRes));
    }
    setLoaded(true);
  }, []);

  // Speichere Reservierungen (nur nach Load)
  useEffect(() => {
    if (!loaded) return;
    console.log("💾 Speichere Reservierungen in LocalStorage:", reserved);
    localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(reserved));
  }, [reserved, loaded]);

  // ==========================
  // Auswahl-Handling
  // ==========================
  const toggleSelection = (id) => {
    if (reserved[id]) return;
    const newSel = new Set(selection);
    newSel.has(id) ? newSel.delete(id) : newSel.add(id);
    setSelection(newSel);
  };

  const clearSelection = () => setSelection(new Set());

  // ==========================
  // Reservierung bestätigen
  // ==========================
  const confirmReservation = () => {
    if (!vorname || !name || !adresse || !ort) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const newReserved = { ...reserved };
    selection.forEach((id) => {
      newReserved[id] = { vorname, name, adresse, ort, mail };
    });

    setReserved(newReserved);
    setSelection(new Set());
    setIsDialogOpen(false);

    // Felder zurücksetzen
    setVorname("");
    setName("");
    setAdresse("");
    setOrt("");
    setMail("");
  };

  // ==========================
  // Admin Funktionen
  // ==========================
  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("Falsches Passwort!");
    }
    setPassword("");
  };

  const removeReservation = (id) => {
    const newReserved = { ...reserved };
    delete newReserved[id];
    setReserved(newReserved);
  };

  const exportCSV = () => {
    let csv = "Vorname,Name,Adresse,Ort,Mail,Reihe,Spalte\n";
    Object.entries(reserved).forEach(([id, r]) => {
      const [ri, ci] = parseCellId(id);
      csv += `${r.vorname},${r.name},${r.adresse},${r.ort},${r.mail},${ri + 1},${ci + 1}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservierungen.csv";
    a.click();
  };

  // ==========================
  // Preisberechnung
  // ==========================
  const ausgewaehlteFreieZellen = Array.from(selection).filter(
    (id) => !reserved[id]
  );
  const totalPreis = ausgewaehlteFreieZellen.length * preis;

  // ==========================
  // Render
  // ==========================
  return (
    <div style={{ padding: 16 }}>
      {/* Admin Login */}
      {!isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Admin Passwort"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginRight: 8 }}
	    autoComplete="new-password"
          />
          <button onClick={handleAdminLogin}>Anmelden</button>
        </div>
      )}

      {/* Admin Einstellungen */}
      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <label>Laenge (m): </label>
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value || "1"))}
            style={{ marginRight: 16 }}
          />
          <label>Breite (m): </label>
          <input
            type="number"
            min={1}
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value || "1"))}
            style={{ marginRight: 16 }}
          />
          <label>Preis pro m² (CHF): </label>
          <input
            type="number"
            min={0}
            value={preis}
            onChange={(e) => setPreis(parseFloat(e.target.value || "0"))}
          />
        </div>
      )}

      {/* Aktionen */}
      <div style={{ marginBottom: 16 }}>
        <button
          onClick={() => setIsDialogOpen(true)}
          disabled={ausgewaehlteFreieZellen.length === 0}
          style={{ marginRight: 8 }}
        >
          Reservieren ({ausgewaehlteFreieZellen.length} m² / CHF {totalPreis})
        </button>
        <button onClick={clearSelection} style={{ marginRight: 8 }}>
          Auswahl zurücksetzen
        </button>
      </div>

      {/* Matte Grid */}
      <div
        style={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: `repeat(${cols},1fr)`,
          width: "90vw",
          maxWidth: 600,
          marginBottom: 16,
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((__, c) => {
            const id = cellId(r, c);
            const isReserved = Boolean(reserved[id]);
            const isSelected = selection.has(id);
            return (
              <div
                key={id}
                onClick={() => toggleSelection(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  borderRadius: 6,
                  cursor: isReserved ? "not-allowed" : "pointer",
                  background: isReserved
                    ? "#ef4444"
                    : isSelected
                    ? "#93c5fd"
                    : "#86efac",
                  color: isReserved ? "#fff" : "#000",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  border: "1px solid #ccc",
                  textAlign: "center",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {isReserved
                  ? `${reserved[id].vorname} ${reserved[id].name}`
                  : ""}
              </div>
            );
          })
        )}
      </div>

      {/* Legende */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div style={{ width: 18, height: 18, background: "#86efac", borderRadius: 4 }}></div>
        <span>Frei</span>
        <div style={{ width: 18, height: 18, background: "#93c5fd", borderRadius: 4 }}></div>
        <span>Ausgewählt</span>
        <div style={{ width: 18, height: 18, background: "#ef4444", borderRadius: 4 }}></div>
        <span>Reserviert</span>
      </div>

      {/* Reservierungsdialog */}
      {isDialogOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 8,
              width: 320,
            }}
          >
            <h3>Reservierung</h3>
            <input
              placeholder="Vorname (Pflicht)"
              value={vorname}
              onChange={(e) => setVorname(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              placeholder="Name (Pflicht)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              placeholder="Adresse (Pflicht)"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              placeholder="Ort (Pflicht)"
              value={ort}
              onChange={(e) => setOrt(e.target.value)}
              style={{ width: "100%", marginBottom: 8 }}
            />
            <input
              placeholder="Mail (optional)"
              value={mail}
              onChange={(e) => setMail(e.target.value)}
              style={{ width: "100%", marginBottom: 12 }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setIsDialogOpen(false)}>Abbrechen</button>
              <button onClick={confirmReservation}>Reservieren</button>
            </div>
          </div>
        </div>
      )}

      {/* Reservierungen */}
      <div style={{ marginTop: 16 }}>
        <h3>Reservierungen</h3>
        {Object.keys(reserved).length === 0 ? (
          <p>Keine Reservierungen</p>
        ) : (
          <ul>
            {Object.entries(reserved).map(([id, r]) => {
              const [ri, ci] = parseCellId(id);
              return (
                <li key={id}>
                  {r.vorname} {r.name} - Reihe {ri + 1}, Spalte {ci + 1} - CHF {preis}{" "}
                  {isAdmin && (
                    <button onClick={() => removeReservation(id)}>Löschen</button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {isAdmin && <button onClick={exportCSV}>CSV exportieren</button>}
      </div>
    </div>
  );
}



