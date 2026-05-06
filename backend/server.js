require("dotenv").config();
const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const app = express();
const PORT = process.env.PORT || 4000;

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
}));

// Raw body for webhook signature verification — must come BEFORE express.json()
app.use("/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ status: "Razorpay backend is running." });
});

// Endpoint 1: Create Payment Order
app.post("/create-payment", async (req, res) => {
    try {
        const { amount } = req.body;

        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            return res.status(400).json({ error: "Invalid amount. Must be a positive number." });
        }

        const amountInPaise = Math.round(Number(amount) * 100);

        if (amountInPaise < 100) {
            return res.status(400).json({ error: "Minimum amount is ₹1.00." });
        }

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        });

        console.log(`Order created: ${order.id} | Amount: ₹${amount}`);

        res.status(200).json({
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        res.status(500).json({ error: "Failed to create payment order. Please try again." });
    }
});

// Endpoint 2: Webhook Handler
app.post("/webhook", (req, res) => {
    try {
        const webhookSecret = process.env.RAZORPAY_KEY_SECRET;
        const razorpaySignature = req.headers["x-razorpay-signature"];

        if (!razorpaySignature) {
            return res.status(400).json({ error: "Missing Razorpay signature." });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.status(400).json({ error: "Invalid webhook signature." });
        }

        const event = JSON.parse(req.body.toString());

        switch (event.event) {
            case "payment.captured":
                const payment = event.payload.payment.entity;
                console.log("✅ Payment Successful");
                console.log(`   Payment ID: ${payment.id}`);
                console.log(`   Amount: ₹${payment.amount / 100}`);
                break;
            case "payment.failed":
                console.log("❌ Payment Failed:", event.payload.payment.entity.error_description);
                break;
            case "order.paid":
                console.log("🎉 Order Paid:", event.payload.order.entity.id);
                break;
            default:
                console.log("Unhandled event:", event.event);
        }

        res.status(200).json({ received: true });
    } catch (err) {
        console.error("Webhook error:", err.message);
        res.status(500).json({ error: "Webhook handler error." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Backend running at http://localhost:${PORT}`);
});