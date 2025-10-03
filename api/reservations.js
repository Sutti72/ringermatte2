let reservations = [];

export default function handler(req, res) {
  if (req.method === "GET") {
    res.status(200).json(reservations);
  } else if (req.method === "POST") {
    const reservation = req.body;
    if (!reservation.name || !reservation.date) {
      return res.status(400).json({ error: "Name und Datum erforderlich" });
    }
    reservations.push(reservation);
    res.status(201).json({ message: "Reservation gespeichert", reservation });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
