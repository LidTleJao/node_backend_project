import express from "express";
import { conn } from "../../app";
import mysql from "mysql";
import { PacketPostReq } from "../../model/Request/Packet/Packet/PacketPostReq";

export const router = express.Router();

router.get("/allPacket", (req, res) => {
  conn.query(
    "SELECT Packet.PID, Packet.deals_ID, Deals.concert_deal_ID, Concert_Deals.ticket_ID, Concert_Ticket.ticket_zone, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Deals.hotel_deal_ID, Hotel_Deals.room_ID, Hotel_Room.room_type_ID, Room_Type.type_room, Hotel_Room.room_view_type_ID, Room_Type_View.type_view_name_room, Hotel_Deals.number_of_rooms, Hotel_Deals.hotel_deal_price, Packet.s_deadline_package, Packet.deadline_package FROM Packet INNER JOIN Deals ON Deals.DID = Packet.deals_ID INNER JOIN Concert_Deals ON Concert_Deals.CDID = Deals.concert_deal_ID INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Hotel_Deals ON Hotel_Deals.HDID = Deals.hotel_deal_ID INNER JOIN Hotel_Room ON Hotel_Room.HRID = Hotel_Deals.room_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/PacketByPID/:pid", (req, res) => {
  const pid = +req.params.pid;
  conn.query(
    "SELECT Packet.PID, Packet.deals_ID, Deals.concert_deal_ID, Concert_Deals.ticket_ID, Concert_Ticket.ticket_zone, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Deals.number_of_tickets, Concert_Deals.concert_deal_price, Deals.hotel_deal_ID, Hotel_Deals.room_ID, Hotel_Room.room_type_ID, Room_Type.type_room, Hotel_Room.room_view_type_ID, Room_Type_View.type_view_name_room, Hotel_Deals.number_of_rooms, Hotel_Deals.hotel_deal_price, Packet.s_deadline_package, Packet.deadline_package FROM Packet INNER JOIN Deals ON Deals.DID = Packet.deals_ID INNER JOIN Concert_Deals ON Concert_Deals.CDID = Deals.concert_deal_ID INNER JOIN Concert_Ticket ON Concert_Ticket.CTID = Concert_Deals.ticket_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID INNER JOIN Hotel_Deals ON Hotel_Deals.HDID = Deals.hotel_deal_ID INNER JOIN Hotel_Room ON Hotel_Room.HRID = Hotel_Deals.room_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID WHERE Packet.PID = ?",
    [pid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

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
