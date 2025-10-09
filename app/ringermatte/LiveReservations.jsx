"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const LiveReservations = () => {
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(16);
  const [price, setPrice] = useState(100);
  const [reservations, setReservations] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    vorname: "",
    name: "",
    adresse: "",
    ort: "",
    mail: "",
  });

  // Hilfsfunktionen
  const cellId = (r, c) => `${r}-${c}`;
  const parseCell = id => id.split("-").map(Number);

  // Laden der Reservierungen aus Supabase
  useEffect(() => {
    async function fetchReservations() {
      const { data, error } = await supabase.from("reservations").select("*");
      if (error) console.error(error);
      else {
        const mapped = data.reduce((acc, r) => {
          acc[cellId(r.reihe, r.spalte)] = r;
          return acc;
        }, {});
        setReservations(mapped);
      }
    }
    fetchReservations();
  }, []);

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("reservations")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        payload => {
          const key = cellId(payload.new.reihe, payload.new.spalte);
          setReservations(prev => ({
            ...prev,
            [key]: payload.new,
          }));
          setSelected(prev => {
            const newSet = new Set(prev);
            newSet.delete(key);
            return newSet;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  // Auswahl einer Zelle
  const toggleSelect = id => {
    if (reservations[id]) return;
    const newSet = new Set(selected);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSelected(newSet);
  };

  // Reservierung speichern
  const saveReservation = async () => {
    const entries = Array.from(selected).map(id => {
      const [reihe, spalte] = parseCell(id);
      return {
        ...formData,
        reihe,
        spalte,
      };
    });

    const { error } = await supabase.from("reservations").insert(entries);
    if (error) console.error(error);
    else {
      setSelected(new Set());
      setFormData({ vorname: "", name: "", adresse: "", ort: "", mail: "" });
      setShowForm(false);
    }
  };

  const selectedCount = selected.size;
  const totalPrice = selectedCount * price;

  return (
    <div style={{ padding: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <label>Laenge (m): </label>
        <input type="number" min={1} value={rows} onChange={e => setRows(parseInt(e.target.value || "1"))} />
        <label>Breite (m): </label>
        <input type="number" min={1} value={cols} onChange={e => setCols(parseInt(e.target.value || "1"))} />
        <label>Preis pro m² (CHF): </label>
        <input type="number" min={0} value={price} onChange={e => setPrice(parseFloat(e.target.value || "0"))} />
      </div>

      <div style={{ display: "grid", gap: 4, gridTemplateColumns: `repeat(${cols},1fr)`, maxWidth: 600 }}>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const id = cellId(r, c);
            const reserved = reservations[id];
            const isSelected = selected.has(id);
            return (
              <div
                key={id}
                onClick={() => toggleSelect(id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.8rem",
                  borderRadius: 6,
                  cursor: reserved ? "not-allowed" : "pointer",
                  background: reserved ? "#ef4444" : isSelected ? "#93c5fd" : "#86efac",
                  color: reserved ? "#fff" : "#000",
                  width: "100%",
                  aspectRatio: "1 / 1",
                  border: "1px solid #ccc",
                  textAlign: "center",
                  overflow: "hidden",
                  wordBreak: "break-word",
                }}
              >
                {reserved ? `${reserved.vorname} ${reserved.name}` : ""}
              </div>
            );
          })
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => setShowForm(true)} disabled={selectedCount === 0}>
          Reservieren ({selectedCount} m² / CHF {totalPrice})
        </button>
        <button onClick={() => setSelected(new Set())} style={{ marginLeft: 8 }}>
          Auswahl zurücksetzen
        </button>
      </div>

      {showForm && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)" }}>
          <div style={{ background: "#fff", padding: 16, borderRadius: 8, width: 320 }}>
            <h3>Reservierung</h3>
            <input placeholder="Vorname" value={formData.vorname} onChange={e => setFormData({ ...formData, vorname: e.target.value })} />
            <input placeholder="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
            <input placeholder="Adresse" value={formData.adresse} onChange={e => setFormData({ ...formData, adresse: e.target.value })} />
            <input placeholder="Ort" value={formData.ort} onChange={e => setFormData({ ...formData, ort: e.target.value })} />
            <input placeholder="Mail" value={formData.mail} onChange={e => setFormData({ ...formData, mail: e.target.value })} />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <button onClick={() => setShowForm(false)}>Abbrechen</button>
              <button onClick={saveReservation}>Reservieren</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveReservations;

