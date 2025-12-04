const express = require("express");
const dotenv = require("dotenv");
const userRouter = require("./routers/userRouter");
const { categoryRouter } = require("./routers/categoryRouter");
const productRouter = require("./routers/productRouter");
const cartRouter = require("./routers/cartRouter");
const paymentRouter = require("./routers/paymentRouter");
const cors = require("cors")
dotenv.config();
const app = express();

app.use(
  cors({
    origin:['http://localhost:5173','https://granduer.vercel.app/'],
    methods:['GET', 'POST', 'PATCH', 'DELETE'],
    credentials:true
  })
)

// app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRouter);
app.use("/", categoryRouter)
app.use("/", productRouter)
app.use("/", cartRouter)
app.use("/", paymentRouter)

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Listening at port ${port}`);
});