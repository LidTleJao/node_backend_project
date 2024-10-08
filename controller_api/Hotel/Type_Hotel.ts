import express from "express";
import { conn } from "../../app";


export const router = express.Router();

router.get("/allTypeHotel", (req, res) =>{
    conn.query("SELECT * FROM Type_Hotel", (err, result, fields) =>{
        if (err) {
            console.error("Error fetching data:", err);
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});