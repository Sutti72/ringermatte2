import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [reservations, setReservations] = useState([]);

  // Alle Reservationen beim Laden holen
  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("id", { ascending: true });
    if (!error) setReservations(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from("reservations")
      .insert([{ name, date }]);
    if (!error) {
      setReservations(prev => [...prev, data[0]]);
      setName("");
      setDate("");
    }
  };

  return (
    <div>
      <h1>Reservationen</h1>
      <form onSubmit={handleSubmit}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        <button type="submit">Reservieren</button>
      </form>

      <ul>
        {reservations.map((r) => (
          <li key={r.id}>{r.name} – {r.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
