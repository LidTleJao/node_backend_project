import express from "express";
import { conn } from "../../../app";
import mysql from "mysql";
import { DealPostReq } from "../../../model/Request/Packet/Deals/DealPostReq";

export const router = express.Router();

router.post("/addDeals/:hdid/:cdid", (req, res) => {
  const hdid = parseInt(req.params.hdid);
  const cdid = parseInt(req.params.cdid);
  const deals: DealPostReq = req.body;

  conn.query(
    "SELECT * FROM Hotel_Deals WHERE HDID = ?",
    [hdid],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.length === 0) {
        return res.status(404).send("Not Found Hotel_Deals");
      }

      conn.query(
        "SELECT * FROM Concert_Deals WHERE CDID = ?",
        [cdid],
        (err, result) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }

          if (result.length === 0) {
            return res.status(404).send("Not Found Concert_Deals");
          }

          // Update Hotel_Deals status
          let sql = "UPDATE Hotel_Deals SET status_ID = ? WHERE HDID = ?";
          sql = mysql.format(sql, [deals.status_ID, hdid]);

          conn.query(sql, (err, result) => {
            if (err) {
              return res.status(500).json({
                affected_row: 0,
                result: err.sqlMessage,
              });
            }

            // Update Concert_Deals status
            let sql = "UPDATE Concert_Deals SET status_ID = ? WHERE CDID = ?";
            sql = mysql.format(sql, [deals.status_ID, cdid]);

            conn.query(sql, (err, result) => {
              if (err) {
                return res.status(500).json({
                  affected_row: 0,
                  result: err.sqlMessage,
                });
              }

              // Insert into Deals table
              let sql =
                "INSERT INTO Deals (`concert_deal_ID`,`hotel_deal_ID`,`datetime_Match`) VALUES (?,?,NOW())";
              sql = mysql.format(sql, [
                (deals.concert_deal_ID = cdid),
                (deals.hotel_deal_ID = hdid),
              ]);

              conn.query(sql, (err, result) => {
                if (err) {
                  return res.status(401).json({
                    affected_row: 0,
                    last_idx: 0,
                    result: err.sqlMessage,
                  });
                }

                res.status(201).json({
                  affected_row: result.affectedRows,
                  last_idx: result.insertId,
                  result: "",
                });
              });
            });
          });
        }
      );
    }
  );
});
