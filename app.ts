import express from "express";
import { router as user } from "./controller_api/User/user";
import { router as hotel } from "./controller_api/Hotel/Hotel";
import { router as room } from "./controller_api/Hotel/Room";
import { router as typeuser } from "./controller_api/User/typeuser";
import { router as type_hotel } from "./controller_api/Hotel/Type_Hotel";
import { router as concert } from "./controller_api/Concert/Concert";
import { router as hotel_deals } from "./controller_api/Packet/Hotel/HotelDeals";
import { router as concert_deals } from "./controller_api/Packet/Concert/ConcertDeals";
import bodyParser from "body-parser";
import mysql from "mysql";
import cors from "cors";

export const conn = mysql.createPool({
    connectionLimit: 10,
    host: "191.101.230.103",
    user: "u528477660_webteemi",
    password: "Bv1cVAKd",
    database: "u528477660_webteemi",
});

export const app = express();

app.use(
    cors({
        origin: "*",
    })
);

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use("/user", user);
app.use("/hotel", hotel);
app.use("/room", room);
app.use("/type_user", typeuser);
app.use("/type_hotel", type_hotel);
app.use("/concert", concert);
app.use("/hoteldeals", hotel_deals);
app.use("/concertdeals", concert_deals);
// app.use("/",(req, res) =>{
//     res.send("Hello World!!!");
// });