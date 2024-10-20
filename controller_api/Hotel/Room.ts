import express from "express";
import { conn } from "../../app";
import mysql from "mysql";
import { HotelRoomPostReq } from "../../model/Request/Hotel/HotelRoomPostReq";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import multer from "multer";
import { storage } from "../../firebase";
import { RoomImagePostReq } from "../../model/Request/Hotel/RoomImagePostReq";
import { UpdateRoomPostReq } from "../../model/Request/Hotel/UpdateRoomPostReq";

export const router = express.Router();

class FileMiddleware {
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

const fileUpload = new FileMiddleware();

router.get("/Allroom", (req, res) => {
  conn.query(
    "SELECT Hotel_Room.HRID,Hotel_Room.hotel_ID,Hotel.name,Hotel_Room.price,Hotel_Room.Number_of_guests,Hotel_Room.Number_of_rooms,Hotel_Room.room_type_ID,Room_Type.type_room,Hotel_Room.room_view_type_ID,Room_Type_View.type_view_name_room,Hotel_Room.room_status_ID,Room_Status.status_name_room FROM Hotel_Room INNER JOIN Hotel ON Hotel.HID = Hotel_Room.hotel_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID INNER JOIN Room_Status ON Room_Status.RSID = Hotel_Room.room_status_ID",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/roomAllByHid/:hid", (req, res) => {
  const hid = +req.params.hid;

  conn.query(
    "SELECT Hotel_Room.HRID,Hotel_Room.hotel_ID,Hotel.name,Hotel_Room.price,Hotel_Room.Number_of_guests,Hotel_Room.Number_of_rooms,Hotel_Room.room_type_ID,Room_Type.type_room,Hotel_Room.room_view_type_ID,Room_Type_View.type_view_name_room,Hotel_Room.room_status_ID,Room_Status.status_name_room FROM Hotel_Room INNER JOIN Hotel ON Hotel.HID = Hotel_Room.hotel_ID INNER JOIN Room_Type ON Room_Type.RTID = Hotel_Room.room_type_ID INNER JOIN Room_Type_View ON Room_Type_View.RTVID = Hotel_Room.room_view_type_ID INNER JOIN Room_Status ON Room_Status.RSID = Hotel_Room.room_status_ID WHERE Hotel_Room.hotel_ID = ?",
    [hid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.post("updateRoom/:hid", (req, res) =>{
  const hid = +req.params.hid;
  const hotel: UpdateRoomPostReq = req.body;

  conn.query(
    "SELECT * FROM Hotel WHERE HID = ?",[hid]
    ,(err, result)=>{
      if (err) {
        res.status(500).send("Error finding hotel");
      } else {
        if(result === null){
          res.status(500).send("Error finding hotel");
        }else{
          conn.query(
            "SELECT * FROM Room_Type WHERE RTID = ?",
            [hotel.room_type_ID],
            (err, result) =>{
              if (err) {
                res.status(500).send("Error finding room type");
              } else {
                if (result[0] === null) {
                  res.status(500).send("Error finding room type");
                } else {
                  conn.query(
                    "SELECT * FROM Room_Type_View WHERE RTVID = ?",
                    [hotel.room_view_type_ID],
                    (err, result) =>{
                      if (err) {
                        res.status(500).send("Error finding room view type");
                      } else {
                        if (result[0] === null) {
                          res.status(500).send("Error finding room view type");
                        } else {
                          conn.query(
                            "SELECT * FROM Room_Status WHERE RSID = ?",
                            [hotel.room_status_ID],
                            (err, result) =>{
                              if (err) {
                                res.status(500).send("Error finding room status");
                              } else {
                                if (result[0] === null) {
                                  res.status(500).send("Error finding room status");
                                } else {
                                  let updateSql =
                                  "UPDATE Hotel_Room SET hotel_ID = ?, price = ?, Number_of_guests = ?, Number_of_rooms = ?, room_type_ID = ?, room_view_type_ID = ?, room_status_ID = ? WHERE HRID = ?";
                                  updateSql = mysql.format(updateSql,[
                                    (hotel.hotel_ID = hid),
                                    hotel.price,
                                    hotel.Number_of_guests,
                                    hotel.Number_of_rooms,
                                    hotel.room_type_ID,
                                    hotel.room_view_type_ID,
                                    hotel.room_status_ID,
                                    hotel.HRID,
                                  ]);

                                  conn.query(updateSql, (err, result) => {
                                    if (err) {
                                      res.status(500).json({
                                        affected_row: 0,
                                        result: err.sqlMessage,
                                      });
                                    } else {
                                      res.status(200).json({
                                        affected_row: result.affectedRows,
                                        message: "Hotel Room updated successfully",
                                        result: result,
                                      });
                                    }
                                  });
                                }
                              }
                            }
                          );
                        }
                      }
                    }
                  );
                }
              }
            }
          );
        }
      }
    }
  );
});

router.post("/addRoom/:hid", (req, res) => {
  const hid = parseInt(req.params.hid);
  const hotel_room: HotelRoomPostReq = req.body;

  conn.query(
    "SELECT * FROM Hotel WHERE HID = ?",
    [hid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found Hotel Because " + err);
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Hotel Because " + err);
        } else {
          let sql =
            "INSERT INTO Hotel_Room (`hotel_ID`,`price`,`Number_of_guests`,`Number_of_rooms`,`room_type_ID`,`room_view_type_ID`,`room_status_ID`) VALUES (?,?,?,?,?,?,?)";
          sql = mysql.format(sql, [
            (hotel_room.hotel_ID = hid),
            hotel_room.price,
            hotel_room.Number_of_guests,
            hotel_room.Number_of_rooms,
            hotel_room.room_type_ID,
            hotel_room.room_view_type_ID,
            hotel_room.room_status_ID,
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

router.post(
  "/addroomimage/:hrid",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    const hrid = parseInt(req.params.hrid);
    const room: RoomImagePostReq = req.body;
    const file = req.file;

    conn.query(
      "SELECT * FROM Hotel_Room WHERE HRID = ?",
      [hrid],
      async (err, result) => {
        if (err) {
          res.status(500).send("Not Found Room");
        } else {
          try {
            const url = await firebaseUpload(file!);
            room.url_image = url;

            let sql =
              "INSERT INTO Room_Image (`room_ID`,`url_image`) VALUES(?,?)";
            sql = mysql.format(sql, [(room.room_ID = hrid), room.url_image]);

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
          } catch (error) {
            res.status(500).json({
              error: "An error occurred during file processing",
            });
          }
        }
      }
    );
  }
);

async function firebaseUpload(file: Express.Multer.File) {
  // Upload to firebase storage
  const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
  // Define locations to be saved on storag
  const storageRef = ref(storage, "/Roomimages/" + filename);
  // define file detail
  const metaData = { contentType: file.mimetype };
  // Start upload
  const snapshost = await uploadBytesResumable(
    storageRef,
    file.buffer,
    metaData
  );
  // Get url image from storage
  const url = await getDownloadURL(snapshost.ref);

  return url;
}

// ลบรูปภาพใน firebase
async function firebaseDelete(path: string) {
  const storageRef = ref(
    storage,
    "/Roomimages/" + path.split("F")[1].split("?")[0]
  );
  const snapshost = await deleteObject(storageRef);
}
