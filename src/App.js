// src/App.js
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  const [reservations, setReservations] = useState([]);
  const [name, setName] = useState("");
  const [date, setDate] = useState("");

  // Funktion, um alle Reservations aus Supabase zu laden
  const fetchReservations = async () => {
    const { data, error } = await supabase.from("reservations").select("*").order("id");
    if (error) console.error("Fehler beim Laden:", error);
    else setReservations(data);
  };

  // Neue Reservation hinzufügen
  const addReservation = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("reservations")
      .insert([{ name, date }]);
    if (error) console.error("Fehler beim Hinzufügen:", error);
    else {
      setName("");
      setDate("");
      // fetchReservations(); // nicht nötig, Realtime kümmert sich darum
    }
  };

  useEffect(() => {
    fetchReservations(); // initial laden

    // Realtime-Subscription einrichten
    const subscription = supabase
      .from("reservations")
      .on("INSERT", (payload) => {
        setReservations((prev) => [...prev, payload.new]);
      })
      .subscribe();

    // Aufräumen bei unmount
    return () => {
      supabase.removeSubscription(subscription);
    };
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h1>Reservations</h1>

      <form onSubmit={addReservation} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={{ marginRight: "10px" }}
        />
        <button type="submit">Add Reservation</button>
      </form>

      {reservations.length === 0 ? (
        <p>No Reservations yet.</p>
      ) : (
        <ul>
          {reservations.map((r) => (
            <li key={r.id}>
              {r.name} - {r.date}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
