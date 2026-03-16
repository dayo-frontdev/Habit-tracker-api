import express from "express";
import cors from 'cors';
import helmet from "helmet";
import morgan from 'morgan';
import userRoute from './Routes/userRoute.ts';
import authRoute from "./Routes/authRoute.ts";
import habitsRoute from "./Routes/habitRoute.ts";

const app = express();

app.use(helmet());
app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({extends: true}))

app.get('/health', (req, res) => {
    res.json({ message: 'hello' }).status(200);
});

app.use('/api/auth/', authRoute);
app.use('/api/', userRoute);
app.use('/api/habits', habitsRoute)

export {app};
export default app;
