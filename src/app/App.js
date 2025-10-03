import { useState, useEffect } from "react";

function App() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    fetch("/api/reservations")
      .then(res => res.json())
      .then(data => setReservations(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, date }),
    });
    const data = await res.json();
    setReservations(prev => [...prev, data.reservation]);
    setName("");
    setDate("");
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
        {reservations.map((r, i) => (
          <li key={i}>{r.name} – {r.date}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
