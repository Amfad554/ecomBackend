require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Import your routers here
const userRouter = require('./routers/userRouter'); 

const app = express();

// --- MIDDLEWARES ---
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));

app.use(express.json());

// --- ROUTES ---

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).send("🚀 Server is booming and healthy!");
});

// User Routes
app.use('/api/users', userRouter);

// --- GLOBAL ERROR HANDLER ---
// This prevents the "clean exit" if a specific route fails
app.use((err, req, res, next) => {
    console.error("❌ GLOBAL ERROR:", err.stack);
    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server is booming on port ${PORT}`);
    console.log(`🔗 Local link: http://localhost:${PORT}`);
});