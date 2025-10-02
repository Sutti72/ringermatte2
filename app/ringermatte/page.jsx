"use client";

import React, { useEffect, useMemo, useState } from "react";

const cellId = (r, c) => `${r}-${c}`;
const parseCellId = (id) => id.split("-").map(Number);

const STORAGE_KEY_RES = "ringermatte-reservierungen-v1";
const STORAGE_KEY_ADMIN = "ringermatte-admin-settings-v1";
const ADMIN_PASSWORD = "geheim123"; // Passwort hier anpassen

export default function RingermattePage() {
  // Admin-Einstellungen
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(12);
  const [preis, setPreis] = useState(20);

  // Reservierungen
  const [reserved, setReserved] = useState({});
  const [selection, setSelection] = useState(new Set());

  // Eingaben beim Reservieren
  const [vorname, setVorname] = useState("");
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ort, setOrt] = useState("");
  const [mail, setMail] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Admin Login
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");

  // === Daten aus LocalStorage laden ===
  useEffect(() => {
    try {
      const rawRes = localStorage.getItem(STORAGE_KEY_RES);
      if (rawRes) setReserved(JSON.parse(rawRes));

      const rawAdmin = localStorage.getItem(STORAGE_KEY_ADMIN);
      if (rawAdmin) {
        const settings = JSON.parse(rawAdmin);
        if (settings.rows) setRows(settings.rows);
        if (settings.cols) setCols(settings.cols);
        if (settings.preis) setPreis(settings.preis);
      }
    } catch {}
  }, []);

  // === Reservierungen speichern ===
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RES, JSON.stringify(reserved));
    } catch {}
  }, [reserved]);

  // === Admin-Einstellungen speichern ===
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_ADMIN,
        JSON.stringify({ rows, cols, preis })
      );
    } catch {}
  }, [rows, cols, preis]);

  // Auswahl
  const ausgewaehlteFreieZellen = useMemo(
    () => Array.from(selection).filter((id) => !reserved[id]),
    [selection, reserved]
  );
  const totalPreis = ausgewaehlteFreieZellen.length * preis;

  const toggleSelection = (id) => {
    if (reserved[id]) return;
    setSelection((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const clearSelection = () => setSelection(new Set());

  const confirmReservation = () => {
    if (!vorname.trim() || !name.trim() || !adresse.trim() || !ort.trim()) {
      alert("Vorname, Name, Adresse und Ort müssen ausgefüllt sein!");
      return;
    }
    const now = Date.now();
    setReserved((prev) => {
      const copy = { ...prev };
      for (const id of ausgewaehlteFreieZellen) {
        copy[id] = {
          vorname: vorname.trim(),
          name: name.trim(),
          adresse: adresse.trim(),
          ort: ort.trim(),
          mail: mail.trim(),
          when: now,
        };
      }
      return copy;
    });

    // Felder zurücksetzen
    setVorname("");
    setName("");
    setAdresse("");
    setOrt("");
    setMail("");
    clearSelection();
    setIsDialogOpen(false);
  };

  const removeReservation = (id) => {
    setReserved((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const exportCSV = () => {
    if (!isAdmin) return;
    const header = [
      "Reihe",
      "Spalte",
      "Vorname",
      "Name",
      "Adresse",
      "Ort",
      "Mail",
      "Zeitpunkt (ISO)",
      "Preis CHF",
    ];
    const rowsCsv = Object.entries(reserved).map(([id, r]) => {
      const [ri, ci] = parseCellId(id);
      return [
        ri + 1,
        ci + 1,
        r.vorname,
        r.name,
        r.adresse,
        r.ort,
        r.mail || "",
        new Date(r.when).toISOString(),
        preis.toString(),
      ];
    });
    const csv = [header, ...rowsCsv].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservierungen.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setPassword("");
    } else {
      alert("Falsches Passwort!");
    }
  };

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
          />
          <label style={{ marginLeft: 16 }}>Preis pro m² (CHF): </label>
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
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
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
                {isReserved ? `${reserved[id].vorname} ${reserved[id].name}` : ""}
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
        <div
          style={{ width: 18, height: 18, background: "#86efac", borderRadius: 4 }}
        ></div>
        <span>Frei</span>
        <div
          style={{ width: 18, height: 18, background: "#93c5fd", borderRadius: 4 }}
        ></div>
        <span>Ausgewählt</span>
        <div
          style={{ width: 18, height: 18, background: "#ef4444", borderRadius: 4 }}
        ></div>
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
            style={{ background: "#fff", padding: 16, borderRadius: 8, width: 320 }}
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
        {isAdmin && (
          <div style={{ marginTop: 8 }}>
            <button onClick={exportCSV}>CSV exportieren</button>
          </div>
        )}
      </div>
    </div>
  );
}

