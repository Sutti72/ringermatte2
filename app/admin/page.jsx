"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminPage() {
  const [reservierungen, setReservierungen] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const { data, error } = await supabase.from("reservierungen").select("*");
      if (error) alert("Fehler beim Laden: " + error.message);
      else setReservierungen(data);
      setLoading(false);
    };
    loadData();
  }, []);

  const deleteRow = async (id) => {
    if (!confirm("Reservierung wirklich löschen?")) return;
    const { error } = await supabase.from("reservierungen").delete().eq("id", id);
    if (error) alert(error.message);
    else setReservierungen(reservierungen.filter((r) => r.id !== id));
  };

  const exportCSV = () => {
    const header = "Vorname,Name,Reihe,Spalte,Ort,Mail\n";
    const rows = reservierungen
      .map((r) => `${r.vorname},${r.name},${r.reihe},${r.spalte},${r.ort},${r.mail}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservierungen.csv";
    a.click();
  };

  if (loading) return <p style={{ padding: 20 }}>Lade Daten...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin-Bereich</h1>

      <button onClick={exportCSV} style={{ marginBottom: 10 }}>
        📄 CSV exportieren
      </button>

      <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead style={{ background: "#e5e7eb" }}>
          <tr>
            <th>ID</th>
            <th>Vorname</th>
            <th>Name</th>
            <th>Reihe</th>
            <th>Spalte</th>
            <th>Adresse</th>
            <th>Ort</th>
            <th>Mail</th>
            <th>Aktion</th>
          </tr>
        </thead>
        <tbody>
          {reservierungen.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.vorname}</td>
              <td>{r.name}</td>
              <td>{r.reihe}</td>
              <td>{r.spalte}</td>
              <td>{r.adresse}</td>
              <td>{r.ort}</td>
              <td>{r.mail}</td>
              <td>
                <button onClick={() => deleteRow(r.id)}>🗑️ Löschen</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

