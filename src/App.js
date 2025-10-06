
// src/App.js
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Alle Reservationen laden & Realtime-Subscription einrichten
  useEffect(() => {
    fetchReservations();

    const subscription = supabase
      .channel('public:reservations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, payload => {
        fetchReservations(); // Liste neu laden bei Änderungen
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Clean-up beim Verlassen
    };
  }, []);

  async function fetchReservations() {
    setLoading(true);
    const { data, error } = await supabase.from("reservations").select("*").order("id", { ascending: true });
    if (error) {
      console.error("Fehler beim Laden der Reservationen:", error.message);
    } else {
      setReservations(data);
    }
    setLoading(false);
  }

  async function addReservation() {
    if (!name || !date) return;

    const { data, error } = await supabase
      .from("reservations")
      .insert([{ name, date }]);

    if (error) {
      console.error("Fehler beim Hinzufügen:", error.message);
    } else {
      setName("");
      setDate("");
      // fetchReservations(); // Nicht nötig, Realtime übernimmt
    }
  }

  return (
    <div style={{ maxWidth: "600px", margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>Reservierungen</h1>

      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          style={{ padding: "0.5rem", marginRight: "0.5rem" }}
        />
        <button onClick={addReservation} style={{ padding: "0.5rem 1rem" }}>Reservieren</button>
      </div>

      {loading ? (
        <p>Lädt...</p>
      ) : reservations.length === 0 ? (
        <p>Keine Reservationen vorhanden.</p>
      ) : (
        <ul>
          {reservations.map(r => (
            <li key={r.id}>{r.name} – {r.date}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
