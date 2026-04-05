const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routers/userRouter");
const { categoryRouter } = require("./routers/categoryRouter");
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const paymentRouter = require("./routers/paymentRouter");
const cors = require("cors");
const { swaggerUi, swaggerSpec } = require("./swagger/swagger");
dotenv.config();
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('JWT exists:', !!process.env.JWT_SECRET_KEY);

const app = express();
app.use(
  cors({
    origin: ['http://localhost:5173', 'https://granduer.vercel.app'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'], // <--- ADD PUT HERE
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.status(200).send("🚀 Server is booming and healthy!");
});

app.use("/", userRouter);
app.use("/", categoryRouter);
app.use("/", productRouter);
app.use("/", cartRouter);
app.use("/", paymentRouter);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`🚀 Server is booming on port ${port}`);
  console.log(`🔗 Local link: http://localhost:${port}`);
});