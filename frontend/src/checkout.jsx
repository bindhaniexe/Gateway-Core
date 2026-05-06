import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function Checkout() {
    const [amount, setAmount] = useState("");
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);

    const handlePay = useCallback(async () => {
        setStatus(null);
        const parsedAmount = parseFloat(amount);

        if (!amount || isNaN(parsedAmount) || parsedAmount < 1) {
            setStatus({ type: "error", message: "Please enter a valid amount (minimum ₹1)." });
            return;
        }

        setLoading(true);

        try {
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) throw new Error("Failed to load Razorpay. Check your internet connection.");

            const res = await fetch(`${API_URL}/create-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: parsedAmount }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to initiate payment.");

            const options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: "Your Store",
                description: "Secure Checkout",
                order_id: data.orderId,
                handler: (response) => {
                    setStatus({
                        type: "success",
                        message: `Payment successful! ID: ${response.razorpay_payment_id}`,
                    });
                },
                theme: { color: "#c84b31" },
                modal: {
                    ondismiss: () => {
                        setStatus({ type: "error", message: "Payment cancelled." });
                        setLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response) => {
                setStatus({ type: "error", message: `Payment failed: ${response.error.description}` });
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            setStatus({ type: "error", message: err.message });
        } finally {
            setLoading(false);
        }
    }, [amount]);

    return (
        <div className="fade-up" style={{
            background: "white", border: "1px solid var(--border)",
            borderRadius: "2px", padding: "48px 40px",
            width: "100%", maxWidth: "420px", position: "relative",
        }}>
            <div style={{
                position: "absolute", top: 0, left: 0,
                width: "4px", height: "48px", background: "var(--accent)",
            }} />

            <div className="fade-up fade-up-delay-1">
                <p style={{
                    fontSize: "11px", letterSpacing: "0.15em", color: "var(--muted)",
                    textTransform: "uppercase", margin: "0 0 8px 0"
                }}>
                    Secure Payment
                </p>
                <h1 style={{
                    fontFamily: "DM Serif Display", fontSize: "32px",
                    fontWeight: 400, margin: "0 0 36px 0", color: "var(--ink)"
                }}>
                    Checkout
                </h1>
            </div>

            <div className="fade-up fade-up-delay-2" style={{ marginBottom: "24px" }}>
                <label htmlFor="amount" style={{
                    display: "block", fontSize: "11px",
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "var(--muted)", marginBottom: "10px"
                }}>
                    Amount (INR)
                </label>
                <div style={{ position: "relative" }}>
                    <span style={{
                        position: "absolute", left: "14px", top: "50%",
                        transform: "translateY(-50%)", fontSize: "16px",
                        color: "var(--muted)", fontFamily: "DM Serif Display"
                    }}>₹</span>
                    <input
                        id="amount" type="number" min="1" step="0.01"
                        placeholder="0.00" value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handlePay()}
                        disabled={loading}
                        style={{
                            width: "100%", padding: "14px 14px 14px 32px",
                            fontSize: "20px", fontFamily: "DM Serif Display",
                            border: "1px solid var(--border)", borderRadius: "2px",
                            outline: "none", background: "var(--paper)", color: "var(--ink)"
                        }}
                    />
                </div>
            </div>

            <div className="fade-up fade-up-delay-3">
                <button onClick={handlePay} disabled={loading}
                    style={{
                        width: "100%", padding: "16px",
                        background: loading ? "var(--muted)" : "var(--ink)",
                        color: "white", border: "none", borderRadius: "2px",
                        fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase",
                        fontFamily: "DM Mono", cursor: loading ? "not-allowed" : "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
                    }}>
                    {loading ? <><span className="spinner" /> Processing...</> : "Pay Now →"}
                </button>

                {status && (
                    <div style={{
                        marginTop: "20px", padding: "14px 16px", borderRadius: "2px",
                        fontSize: "12px", lineHeight: 1.5,
                        background: status.type === "success" ? "#f0faf4" : "#fdf2f0",
                        color: status.type === "success" ? "#166534" : "#991b1b",
                        border: `1px solid ${status.type === "success" ? "#bbf7d0" : "#fecaca"}`
                    }}>
                        {status.type === "success" ? "✓ " : "✕ "}{status.message}
                    </div>
                )}

                <p style={{
                    marginTop: "20px", fontSize: "10px", letterSpacing: "0.08em",
                    color: "var(--muted)", textAlign: "center", textTransform: "uppercase"
                }}>
                    🔒 Secured by Razorpay
                </p>
            </div>
        </div>
    );
}