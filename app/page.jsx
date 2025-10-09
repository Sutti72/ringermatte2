
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function Ringermatte() {
  const [rows] = useState(16);
  const [cols] = useState(16);
  const [preis] = useState(100); // Preis pro Quadratmeter
  const [reservierungen, setReservierungen] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // ✅ Daten laden und Realtime abonnieren
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("reservierungen").select("*");
      if (error) console.error("Fehler beim Laden:", error.message);
      else setReservierungen(data);
      setLoading(false);
    };

    fetchData();

    // 🟢 Realtime-Listener hinzufügen
    const channel = supabase
      .channel("reservierungen-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservierungen" },
        () => {
          fetchData(); // Tabelle neu laden
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const toggleCell = (r, c) => {
    const key = `${r}-${c}`;
    const updated = new Set(selected);
    updated.has(key) ? updated.delete(key) : updated.add(key);
    setSelected(updated);
  };

  const reservieren = async (form) => {
    if (!form.vorname || !form.name || !form.adresse || !form.ort) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const neue = Array.from(selected).map((key) => {
      const [r, c] = key.split("-").map(Number);
      return { reihe: r, spalte: c, ...form };
    });

    const { error } = await supabase.from("reservierungen").insert(neue);
    if (error) {
      alert("Fehler beim Speichern: " + error.message);
    } else {
      alert("Reservierung erfolgreich!");
      setSelected(new Set());
    }
  };

  if (loading) return <p style={{ padding: 20 }}>Lade Reservierungen...</p>;

  const isReserved = (r, c) =>
    reservierungen.some((res) => res.reihe === r && res.spalte === c);

  // Berechnung der Gesamtsumme
  const gesamt = selected.size * preis;

  return (
    <div style={{ padding: 16 }}>
      <h1>Ringermatte Reservierungen</h1>
      <p>Preis pro Quadratmeter: {preis} CHF</p>
      <p>Gesamtsumme der Auswahl: {gesamt} CHF</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 4,
          width: "90vw",
          maxWidth: 600,
          marginBottom: 16,
        }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const key = `${r}-${c}`;
            const reserved = isReserved(r, c);
            const selectedCell = selected.has(key);
            return (
              <div
                key={key}
                onClick={() => !reserved && toggleCell(r, c)}
                style={{
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  background: reserved
                    ? "#ef4444"
                    : selectedCell
                    ? "#93c5fd"
                    : "#86efac",
                  border: "1px solid #ccc",
                  borderRadius: 6,
                  cursor: reserved ? "not-allowed" : "pointer",
                }}
              >
                {reserved ? "X" : ""}
              </div>
            );
          })
        )}
      </div>
      <ReservierenForm onSubmit={reservieren} disabled={selected.size === 0} />
    </div>
  );
}

function ReservierenForm({ onSubmit, disabled }) {
  const [form, setForm] = useState({
    vorname: "",
    name: "",
    adresse: "",
    ort: "",
    mail: "",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <div style={{ marginTop: 16 }}>
      <h3>Reservierung</h3>
      <input name="vorname" placeholder="Vorname" value={form.vorname} onChange={handleChange} style={{ display: "block", marginBottom: 8 }} />
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} style={{ display: "block", marginBottom: 8 }} />
      <input name="adresse" placeholder="Adresse" value={form.adresse} onChange={handleChange} style={{ display: "block", marginBottom: 8 }} />
      <input name="ort" placeholder="Ort" value={form.ort} onChange={handleChange} style={{ display: "block", marginBottom: 8 }} />
      <input name="mail" placeholder="E-Mail (optional)" value={form.mail} onChange={handleChange} style={{ display: "block", marginBottom: 12 }} />
      <button disabled={disabled} onClick={() => onSubmit(form)}>Reservieren</button>
    </div>
  );
}
