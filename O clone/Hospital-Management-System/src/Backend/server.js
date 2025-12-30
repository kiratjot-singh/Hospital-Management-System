import dotenv from 'dotenv'
dotenv.config({});
import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import connection  from './db.js';
import router from './routes.js';
connection();
const app=express();
app.use(express.json());
app.use(urlencoded({extended:true}));
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));
app.use("/api", router);
const port=process.env.PORT||5000;


app.listen(5000, "0.0.0.0");


//  app.listen(port,()=>{console.log(`server listening at port ${port}`)})

