import express from "express";
import { conn } from "../../../app";
import mysql from "mysql";
import { HotelDealPostReq } from "../../../model/Request/Packet/Hotel/HotelDealPostReq";

export const router = express.Router();

router.get("/allHotelDeal", (req, res) =>{
  conn.query(
    "SELECT Hotel_Deals.HDID, Hotel_Deals.room_ID, Hotel.name, Hotel_Room.room_type_ID, Room_Type.type_room, Hotel_Room.room_view_type_ID, Room_Type_View.type_view_name_room, Hotel_Deals.status_ID, Status_Deals.name_status, Hotel_Deals.price, Hotel_Deals.number_of_rooms, Hotel_Deals.s_datetime, Hotel_Deals.e_datetime FROM Hotel_Deals INNER JOIN Hotel_Room ON Hotel_Room.HRID = Hotel_Deals.room_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Hotel_Deals.status_ID INNER JOIN Hotel ON Hotel.HID = Hotel_Room.hotel_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER  JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID WHERE Hotel_Deals.status_ID = 1 AND Hotel_Deals.e_datetime >= NOW()",
    (err, result)=>{
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
})

router.get("/HotelDealByHDID/:hdid",(req, res)=>{
  const hdid = +req.params.hdid;
  conn.query(
    "SELECT Hotel_Deals.HDID,Hotel.hotel_user_ID, Hotel_Deals.room_ID, Hotel.name, Hotel_Room.room_type_ID, Room_Type.type_room, Hotel_Room.room_view_type_ID, Room_Type_View.type_view_name_room, Hotel_Deals.status_ID, Status_Deals.name_status, Hotel_Deals.price, Hotel_Deals.number_of_rooms, Hotel_Deals.s_datetime, Hotel_Deals.e_datetime FROM Hotel_Deals INNER JOIN Hotel_Room ON Hotel_Room.HRID = Hotel_Deals.room_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Hotel_Deals.status_ID INNER JOIN Hotel ON Hotel.HID = Hotel_Room.hotel_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER  JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID WHERE Hotel_Deals.HDID = ? AND Hotel_Deals.status_ID = 1 AND Hotel_Deals.e_datetime >= NOW()",
    [hdid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
})

router.get("/HotelDealByUser/:uid",(req, res)=>{
  const uid = +req.params.uid;
  conn.query(
    "SELECT Hotel_Deals.HDID,Hotel.hotel_user_ID, Hotel_Deals.room_ID, Hotel.name, Hotel_Room.room_type_ID, Room_Type.type_room, Hotel_Room.room_view_type_ID, Room_Type_View.type_view_name_room, Hotel_Deals.status_ID, Status_Deals.name_status, Hotel_Deals.price, Hotel_Deals.number_of_rooms, Hotel_Deals.s_datetime, Hotel_Deals.e_datetime FROM Hotel_Deals INNER JOIN Hotel_Room ON Hotel_Room.HRID = Hotel_Deals.room_ID INNER JOIN Status_Deals ON Status_Deals.SDID = Hotel_Deals.status_ID INNER JOIN Hotel ON Hotel.HID = Hotel_Room.hotel_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER  JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID WHERE Hotel.hotel_user_ID = ? AND Hotel_Deals.status_ID = 1 AND Hotel_Deals.e_datetime >= NOW()",
    [uid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
})

router.post("/appHotelDeal/:rid/:nbr", (req, res) => {
  const rid = parseInt(req.params.rid);
  const nbr = parseInt(req.params.nbr);
  const hotelDeal: HotelDealPostReq = req.body;

  conn.query(
    "SELECT * FROM Hotel_Room WHERE HRID = ? AND Number_of_rooms >= ?",
    [rid, nbr],
    async (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Room Because " + err);
        } else {
          let sql =
            "INSERT  INTO Hotel_Deals (`room_ID`,`status_ID`,`price`,`number_of_rooms`,`s_datetime`,`e_datetime`) VALUES(?,?,?,?,?,?)";
          sql = mysql.format(sql, [
            (hotelDeal.room_ID = rid),
            hotelDeal.status_ID,
            hotelDeal.price,
            (hotelDeal.number_of_rooms = nbr),
            hotelDeal.s_datetime,
            hotelDeal.e_datetime,
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
