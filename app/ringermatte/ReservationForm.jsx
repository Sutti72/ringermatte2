"use client";

import { useState } from "react";

export default function ReservationForm({ onSuccess }) {
  const [vorname, setVorname] = useState("");
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [ort, setOrt] = useState("");
  const [mail, setMail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!vorname || !name || !adresse || !ort) {
      alert("Bitte alle Pflichtfelder ausfüllen!");
      return;
    }

    const reservation = {
      vorname,
      name,
      adresse,
      ort,
      mail,
      created_at: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservation)
      });

      if (!res.ok) throw new Error("Fehler beim Speichern");

      setVorname("");
      setName("");
      setAdresse("");
      setOrt("");
      setMail("");
      onSuccess && onSuccess(); // Refresh LiveReservations
    } catch (error) {
      console.error(error);
      alert("Fehler beim Speichern der Reservierung");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <input placeholder="Vorname (Pflicht)" value={vorname} onChange={e => setVorname(e.target.value)} />
      <input placeholder="Name (Pflicht)" value={name} onChange={e => setName(e.target.value)} />
      <input placeholder="Adresse (Pflicht)" value={adresse} onChange={e => setAdresse(e.target.value)} />
      <input placeholder="Ort (Pflicht)" value={ort} onChange={e => setOrt(e.target.value)} />
      <input placeholder="Mail (optional)" value={mail} onChange={e => setMail(e.target.value)} />
      <button type="submit">Reservieren</button>
    </form>
  );
}
