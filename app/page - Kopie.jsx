"use client";

import React, { useEffect, useMemo, useState } from "react";

const cellId = (r, c) => `${r}-${c}`;
const parseCellId = (id) => id.split("-").map(Number);
const STORAGE_KEY = "ringermatte-reservierungen-v5";
const ADMIN_SETTINGS_KEY = "ringermatte-admin-settings-v1";
const ADMIN_PASSWORD = "rs-sense-2025";

export default function RingermattePage() {
  // Admin Einstellungen persistent
  const [rows, setRows] = useState(12);
  const [cols, setCols] = useState(12);
  const [preis, setPreis] = useState(20);

  const [reserved, setReserved] = useState({});
  const [selection, setSelection] = useState(new Set());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [tab, setTab] = useState("neu");

  // Eingabefelder für Reservierung
  const [vorname, setVorname] = useState("");
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ort, setOrt] = useState("");
  const [mail, setMail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [userPw, setUserPw] = useState("");

  // Admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [pwInput, setPwInput] = useState("");

  // Lade Reservierungen
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setReserved(JSON.parse(raw));
    } catch {}
  }, []);

  // Lade Admin-Einstellungen
  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADMIN_SETTINGS_KEY);
      if (raw) {
        const { rows: r, cols: c, preis: p } = JSON.parse(raw);
        setRows(r);
        setCols(c);
        setPreis(p);
      }
    } catch {}
  }, []);

  // Speichere Reservierungen
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reserved));
    } catch {}
  }, [reserved]);

  // Speichere Admin-Einstellungen
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify({ rows, cols, preis }));
    } catch {}
  }, [rows, cols, preis]);

  const ausgewählteFreieZellen = useMemo(
    () => Array.from(selection).filter((id) => !reserved[id]),
    [selection, reserved]
  );

  const totalPreis = ausgewählteFreieZellen.length * preis;

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
    if (!vorname.trim() || !name.trim() || !adresse.trim() || !ort.trim() || !userPw.trim()) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const now = Date.now();
    setReserved((prev) => {
      const copy = { ...prev };
      for (const id of ausgewählteFreieZellen) {
        copy[id] = {
          vorname: vorname.trim(),
          name: name.trim(),
          adresse: adresse.trim(),
          ort: ort.trim(),
          mail: mail.trim(),
          telefon: telefon.trim(),
          when: now,
          userPw: userPw.trim(),
        };
      }
      return copy;
    });

    setVorname("");
    setName("");
    setAdresse("");
    setOrt("");
    setMail("");
    setTelefon("");
    setUserPw("");
    clearSelection();
    setIsDialogOpen(false);
  };

  const removeReservation = (id) => {
    const pw = prompt("Bitte Passwort eingeben, um diese Reservierung zu löschen:");
    if (pw === reserved[id]?.userPw) {
      setReserved((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      alert("Falsches Passwort!");
    }
  };

  const exportCSV = () => {
    const header = [
      "Reihe",
      "Spalte",
      "Vorname",
      "Name",
      "Adresse",
      "Ort",
      "Mail",
      "Telefon",
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
        r.mail,
        r.telefon,
        new Date(r.when).toISOString(),
        preis.toString(),
      ];
    });
    const csv = [header, ...rowsCsv].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservierungen.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Ringermatte Reservierung</h1>

      {/* Admin Login */}
      {!isAdmin && (
        <div className="mb-6">
          <input
            type="password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            placeholder="Admin Passwort"
            className="border p-1 mr-2"
          />
          <button
            onClick={() => {
              if (pwInput === ADMIN_PASSWORD) {
                setIsAdmin(true);
                setPwInput("");
              } else {
                alert("Falsches Passwort!");
              }
            }}
            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition"
          >
            Login
          </button>
        </div>
      )}

      {/* Admin-Konfiguration */}
      {isAdmin && (
        <>
          <div className="mb-4">
            <label className="mr-2">Laenge (m): </label>
            <input
              type="number"
              min={1}
              value={rows}
              onChange={(e) => setRows(parseInt(e.target.value || "1"))}
              className="border p-1 mr-4"
            />
            <label className="mr-2">Breite (m): </label>
            <input
              type="number"
              min={1}
              value={cols}
              onChange={(e) => setCols(parseInt(e.target.value || "1"))}
              className="border p-1"
            />
          </div>

          <div className="mb-4">
            <label className="mr-2">Preis pro m² (CHF): </label>
            <input
              type="number"
              min={0}
              value={preis}
              onChange={(e) => setPreis(parseFloat(e.target.value || "0"))}
              className="border p-1"
            />
          </div>
        </>
      )}

      {/* Reservierungsknöpfe */}
      <div className="mb-4">
        <button
          onClick={() => {
            setIsDialogOpen(true);
            setTab("neu");
          }}
          disabled={ausgewählteFreieZellen.length === 0}
          className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600 transition"
        >
          Reservieren ({ausgewählteFreieZellen.length} m² / CHF {totalPreis})
        </button>
        <button
          onClick={clearSelection}
          className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400 transition"
        >
          Auswahl zurücksetzen
        </button>
      </div>

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          width: "100%",
          maxWidth: "600px",
          aspectRatio: "1 / 1",
          margin: "0 auto",
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
                onClick={() =>
                  isReserved ? removeReservation(id) : toggleSelection(id)
                }
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  border: "1px solid #ccc",
                  backgroundColor: isReserved
                    ? "#f56565"
                    : isSelected
                    ? "#63b3ed"
                    : "#9ae6b4",
                  cursor: "pointer",
                }}
              >
                {isReserved ? reserved[id].name : ""}
              </div>
            );
          })
        )}
      </div>

      {/* Popup für Reservierung */}
      {isDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-[400px] max-w-full">
            <h2 className="text-lg font-bold mb-4">Reservierung</h2>

            <div className="flex border-b mb-4">
              <button
                onClick={() => setTab("neu")}
                className={`px-3 py-2 ${
                  tab === "neu" ? "border-b-2 border-blue-500 font-semibold" : ""
                }`}
              >
                Neue Reservierung
              </button>
              <button
                onClick={() => setTab("meine")}
                className={`px-3 py-2 ${
                  tab === "meine" ? "border-b-2 border-blue-500 font-semibold" : ""
                }`}
              >
                Meine Reservierungen
              </button>
            </div>

            {tab === "neu" && (
              <div>
                <input
                  placeholder="Vorname *"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  placeholder="Name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  placeholder="Adresse *"
                  value={adresse}
                  onChange={(e) => setAdresse(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  placeholder="Ort *"
                  value={ort}
                  onChange={(e) => setOrt(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  placeholder="Mail (optional)"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  placeholder="Telefon (optional)"
                  value={telefon}
                  onChange={(e) => setTelefon(e.target.value)}
                  className="border p-1 w-full mb-2"
                />
                <input
                  type="password"
                  placeholder="Passwort für Löschung *"
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  className="border p-1 w-full mb-4"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsDialogOpen(false)}
                    className="px-3 py-1 border rounded hover:bg-gray-200"
                  >
                    Abbrechen
                  </button>
                  <button
                    onClick={confirmReservation}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Reservieren
                  </button>
                </div>
              </div>
            )}

            {tab === "meine" && (
              <div>
                <p className="mb-2 text-sm">
                  Klicke auf ein rotes Feld, um deine Reservierung mit Passwort zu löschen.
                </p>
                <ul className="text-sm max-h-40 overflow-y-auto">
                  {Object.entries(reserved).map(([id, r]) => (
                    <li key={id} className="mb-1">
                      {r.vorname} {r.name} – {r.ort}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Legende + CSV nur für Admin */}
      {isAdmin && (
        <div className="mt-4">
          <h2 className="font-bold mb-2">Legende</h2>
          <div className="flex gap-4 mb-2">
            <div className="w-6 h-6 bg-green-300 border" /> <span>Frei</span>
            <div className="w-6 h-6 bg-blue-300 border" /> <span>Ausgewählt</span>
            <div className="w-6 h-6 bg-red-500 border" /> <span>Reserviert</span>
          </div>
          <button
            onClick={exportCSV}
            className="mt-2 px-3 py-1 border rounded hover:bg-gray-200 transition"
          >
            CSV exportieren
          </button>
        </div>
      )}
    </div>
  );
}
