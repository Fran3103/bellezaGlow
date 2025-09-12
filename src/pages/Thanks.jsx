
export default function Thanks() {
  const p = new URLSearchParams(location.search);
  const paymentId = p.get('payment_id');
  const status     = p.get('status');
  const prefId     = p.get('preference_id');

  return (
    <main className="container">
      <h1>¡Pago recibido!</h1>
      <p><b>Estado:</b> {status}</p>
      <p><b>Payment ID:</b> {paymentId}</p>
      <p><b>Preference ID:</b> {prefId}</p>
      <p>En minutos recibirás tu e-book por email.</p>
    </main>
  );
}
