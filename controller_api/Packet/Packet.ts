import express from "express";
import { conn } from "../../app";
import mysql from "mysql";
import { PacketPostReq } from "../../model/Request/Packet/Packet/PacketPostReq";

export const router = express.Router();

router.post("/addPacket/:did", (req, res) => {
  const did = parseInt(req.params.did);
  const packets: PacketPostReq = req.body;

  conn.query("SELECT * FROM Deals WHERE DID = ?", [did], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      if (result[0] == null) {
        res.status(500).send("Not Found Deals Because " + err);
      } else {
        let sql =
          "INSERT INTO Packet (`deals_ID`,`s_deadline_package`,`deadline_package`) VALUES (?,NOW(),DATE_ADD(NOW(), INTERVAL 15 DAY))";
        sql = mysql.format(sql, [(packets.deals_ID = did)]);

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
  });
});
