# 💳 Razorpay Payment Integration

A clean, production-ready full-stack payment integration built with **Razorpay**, **Node.js/Express**, and **Vite + React + Tailwind CSS**.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-Payment-0C2651?style=flat-square&logo=razorpay&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

---

## ✨ Features

- 🔐 **Secure** — Webhook signature verified with HMAC-SHA256
- 💸 **Razorpay Checkout Modal** — Native, mobile-friendly payment UI
- ⚡ **Fast** — Vite-powered frontend with instant HMR
- 🧾 **Order Validation** — Server-side amount validation before order creation
- 🔄 **Webhook Support** — Handles `payment.captured`, `payment.failed`, `order.paid`
- 🌐 **CORS Protected** — Restricted to your frontend origin
- 🎨 **Minimalist UI** — Clean checkout component with loading states and status messages
- 🔑 **Env-based Config** — All secrets safely stored in `.env` files

---

## 🖼️ Preview

```
┌────────────────────────────┐
│  Secure Payment            │
│                            │
│  Checkout                  │
│                            │
│  Amount (INR)              │
│  ┌──────────────────────┐  │
│  │ ₹  500               │  │
│  └──────────────────────┘  │
│                            │
│  ┌──────────────────────┐  │
│  │      PAY NOW →       │  │
│  └──────────────────────┘  │
│                            │
│    🔒 Secured by Razorpay  │
└────────────────────────────┘
```

---

## 🗂️ Project Structure

```
payment-app/
├── backend/
│   ├── server.js          # Express server (API + Webhook)
│   ├── .env.example       # Environment variable template
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── App.jsx
        ├── Checkout.jsx   # Main checkout component
        ├── main.jsx
        └── index.css
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A [Razorpay account](https://dashboard.razorpay.com) (free to sign up)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/razorpay-payment-integration.git
cd razorpay-payment-integration
```

---

### 2. Get Your Razorpay API Keys

1. Log in to [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy your **Key ID** and **Key Secret**

> ⚠️ Use **Test Mode** keys during development. They start with `rzp_test_`.

---

### 3. Set Up the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```env
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_ID_HERE
RAZORPAY_KEY_SECRET=YOUR_KEY_SECRET_HERE
PORT=4000
FRONTEND_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

✅ Backend running at `http://localhost:4000`

---

### 4. Set Up the Frontend

Open a **new terminal**:

```bash
cd frontend
npm install
cp .env.example .env
```

The default `.env` works out of the box:

```env
VITE_API_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev
```

✅ Frontend running at `http://localhost:5173`

---

## 🧪 Testing Payments

Use Razorpay's test credentials — no real money involved:

| Field | Value |
|-------|-------|
| Card Number | `4111 1111 1111 1111` |
| Expiry | Any future date (e.g. `12/26`) |
| CVV | Any 3 digits (e.g. `123`) |
| OTP | `1234` (if prompted) |

More test cards at [Razorpay Docs →](https://razorpay.com/docs/payments/payments/test-card-upi-details/)

---

## 🔌 API Reference

### `POST /create-payment`

Creates a Razorpay order and returns the order ID to the frontend.

**Request Body:**
```json
{
  "amount": 500
}
```

**Response:**
```json
{
  "orderId": "order_XXXXXXXXXXXXXXXX",
  "amount": 50000,
  "currency": "INR",
  "keyId": "rzp_test_XXXXXXXXXXXXXXXX"
}
```

**Errors:**
| Status | Reason |
|--------|--------|
| `400` | Invalid or missing amount |
| `400` | Amount below ₹1 minimum |
| `500` | Razorpay API error |

---

### `POST /webhook`

Handles asynchronous payment events from Razorpay. Verifies HMAC-SHA256 signature before processing.

**Supported Events:**
| Event | Action |
|-------|--------|
| `payment.captured` | Logs ✅ Payment Successful with payment ID and amount |
| `payment.failed` | Logs ❌ Payment Failed with error reason |
| `order.paid` | Logs 🎉 Order fully paid |

---

## 🔒 Security

- All API keys stored in `.env` files — never hardcoded
- `.env` files are git-ignored by default
- Webhook requests verified using **HMAC-SHA256** signature
- Express raw body parser used specifically for webhook route to preserve signature integrity
- CORS restricted to the configured frontend origin only

---

## 🌐 Payment Flow

```
User enters amount
        │
        ▼
Frontend → POST /create-payment
        │
        ▼
Backend validates amount
        │
        ▼
Backend → Razorpay API (create order)
        │
        ▼
Backend returns orderId + keyId
        │
        ▼
Frontend opens Razorpay Modal
        │
        ▼
User completes payment
        │
        ├── Success → handler() fires → show success message
        │
        └── Razorpay → POST /webhook → verify signature → log "Payment Successful"
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `RAZORPAY_KEY_ID` | Your Razorpay Key ID | `rzp_test_abc123` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay Key Secret | `secretXYZ` |
| `PORT` | Port for the Express server | `4000` |
| `FRONTEND_URL` | Frontend origin for CORS | `http://localhost:5173` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:4000` |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Backend Framework | Express.js 4 |
| Payment Gateway | Razorpay |
| Webhook Security | Node.js `crypto` (HMAC-SHA256) |
| Environment Config | `dotenv` |

---

## 📦 Deployment

### Backend (e.g. Railway, Render, Fly.io)

1. Set all environment variables from `backend/.env` in your hosting dashboard
2. Set start command to `node server.js`
3. Update `FRONTEND_URL` to your production frontend URL

### Frontend (e.g. Vercel, Netlify)

1. Set `VITE_API_URL` to your production backend URL
2. Build command: `npm run build`
3. Output directory: `dist`

### Webhooks (Production)

In Razorpay Dashboard → **Settings → Webhooks**:
- URL: `https://your-backend-domain.com/webhook`
- Events: `payment.captured`, `payment.failed`, `order.paid`

---

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use it in personal and commercial projects.

---

## 🙋 Support

- 📖 [Razorpay Docs](https://razorpay.com/docs/)
- 💬 [Razorpay Support](https://razorpay.com/support/)
- 🐛 [Open an Issue](https://github.com/your-username/razorpay-payment-integration/issues)

---

<p align="center">Built with ❤️ using Razorpay + React + Node.js</p>
