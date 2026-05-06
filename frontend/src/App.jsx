import Checkout from "./checkout.jsx";

export default function App() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      background: "var(--paper)",
    }}>
      <Checkout />
    </div>
  );
}