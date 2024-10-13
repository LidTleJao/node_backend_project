import express from "express";
import { conn } from "../../../app";
import mysql from "mysql";
import { ConcertDealPostReq } from "../../../model/Request/Packet/Concert/ConcertDealPostReq";

export const router = express.Router();

router.get("/allConcertDeal", (req, res) =>{
  conn.query(
    "SELECT Concert_Deals.CDID , "
  );
})

router.post("/appConcertDeal/:ctid", (req, res) =>{
    const ctid = parseInt(req.params.ctid);
    const concertDeal: ConcertDealPostReq = req.body;

    conn.query(
        "SELECT * FROM Concert_Ticket WHERE CTID = ?",
        [ctid],
        async (err, result) =>{
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                if (result[0] == null) {
                    res.status(500).send("Not Found Concert Because " + err);
                } else {
                    let sql = 
                    "INSERT INTO Concert_Deals (`ticket_ID`,`status_ID`,`number_of_tickets`,`price`,`s_datetime`,`e_datetime`) VALUES(?,?,?,?,?,?)";
                    sql = mysql.format(sql, [
                        (concertDeal.ticket_ID = ctid),
                        concertDeal.status_ID,
                        concertDeal.number_of_tickets,
                        concertDeal.price,
                        concertDeal.s_datetime,
                        concertDeal.e_datetime,
                    ]);

                    conn.query(sql, (err, result) => {
                        if (err) {
                          res.status(401).json({
                            affected_row: 0,
                            last_idx: 0,
                            result: err.sqlMessage,
                          });
                        } else {
                          res.status(201).json({
                            affected_row: result.affectedRows,
                            last_idx: result.insertId,
                            result: "",
                          });
                        }
                      });
                }
            }
        }
    );
})