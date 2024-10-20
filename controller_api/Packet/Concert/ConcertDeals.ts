import express from "express";
import { conn } from "../../../app";
import mysql from "mysql";
import { ConcertDealPostReq } from "../../../model/Request/Packet/Concert/ConcertDealPostReq";

export const router = express.Router();

router.get("/allConcertDeal", (req, res) => {
  conn.query(
    "SELECT Concert_Deals.CDID , Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert_Deals.status_ID = 1 AND Concert_Deals.e_datetime >= NOW()",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/ConcertDealByCDID/:cdid", (req, res) => {
  const cdid = +req.params.cdid;
  conn.query(
    "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert_Deals.CDID = ? AND Concert_Deals.status_ID = 1 AND Concert_Deals.e_datetime >= NOW()",
    [cdid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/ConcertDealByUser/:uid", (req, res) => {
  const uid = +req.params.uid;
  conn.query(
    "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert.user_ID = ? AND Concert_Deals.status_ID = 1 AND Concert_Deals.e_datetime >= NOW()",
    [uid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/ConcertDealType1ByUser/:uid", (req, res) => {
  const uid = +req.params.uid;
  conn.query(
    "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert.user_ID = ? AND Concert_Deals.status_ID = 1",
    [uid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/ConcertDealType2ByUser/:uid", (req, res) => {
  const uid = +req.params.uid;
  conn.query(
    "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert.user_ID = ? AND Concert_Deals.status_ID = 2",
    [uid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/ConcertDealType3ByUser/:uid", (req, res) => {
  const uid = +req.params.uid;
  conn.query(
    "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert.user_ID = ? AND Concert_Deals.status_ID = 1",
    [uid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        // res.status(200).json(result);
        let updateSql =
          "UPDATE Concert_Deals SET status_ID = 3 WHERE status_ID = 1 AND e_datetime <= NOW()";
        updateSql = mysql.format(updateSql);

        conn.query(updateSql, (err, result)=>{
          if (err) {
            res.status(500).json({
              affected_row: 0,
              result: err.sqlMessage,
            });
          } else {
            conn.query(
              "SELECT Concert_Deals.CDID , Concert.user_ID, Concert_Deals.ticket_ID, Concert.name_concert, Concert.province, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.status_ID, Status_Deals.name_status, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Concert_Deals.s_datetime, Concert_Deals.e_datetime FROM Concert_Deals INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Concert_Deals.status_ID WHERE Concert.user_ID = ? AND Concert_Deals.status_ID = 3",
              [uid],
              (err, result) => {
                if (err) {
                  res.status(500).json({ error: err.message });
                } else {
                  res.status(200).json(result);
                }
              }
            );
          }
        });
      }
    }
  );
});

router.post("/appConcertDeal/:ctid", (req, res) => {
  const ctid = parseInt(req.params.ctid);
  const concertDeal: ConcertDealPostReq = req.body;

  conn.query(
    "SELECT * FROM Concert_Ticket WHERE CTID = ?",
    [ctid],
    async (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Concert Because " + err);
        } else {
          let sql =
            "INSERT INTO Concert_Deals (`ticket_ID`,`status_ID`,`number_of_tickets`,`concert_deal_price`,`s_datetime`,`e_datetime`) VALUES(?,?,?,?,?,?)";
          sql = mysql.format(sql, [
            (concertDeal.ticket_ID = ctid),
            concertDeal.status_ID,
            concertDeal.number_of_tickets,
            concertDeal.concert_deal_price,
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
});
