import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [reservations, setReservations] = useState([]);

  // Reservationen beim Laden holen
  useEffect(() => {
    fetchReservations();

    // Realtime-Channel für neue Reservationen
    const channel = supabase
      .channel("public:reservations")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservations" },
        (payload) => {
          setReservations((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReservations = async () => {
    const { data, error } = await supabase
      .from("reservations")
      .select("*")
      .order("id", { ascending: true });
    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }
    setReservations(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("reservations")
      .insert([{ name, date }]);

    if (error) {
      console.error("Insert error:", error.message);
      alert("Fehler: " + error.message);
    } else {
      setName("");
      setDate("");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Reservationen</h1>
      <form onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <button type="submit">Reservieren</button>
      </form>

      <h2>Liste</h2>
      <ul>
        {reservations.map((r) => (
          <li key={r.id}>
            {r.name} – {r.date}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

