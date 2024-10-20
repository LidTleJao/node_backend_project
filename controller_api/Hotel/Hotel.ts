import express from "express";
import { conn } from "../../app";
import mysql from "mysql";
import { HotelPostReq } from "../../model/Request/Hotel/HotelPostReq";
import { HotelUrlPostReq } from "../../model/Request/Hotel/HotelUrlPostReq";
import { HotelImagePostReq } from "../../model/Request/Hotel/HotelImagePostReq";
import { HotelRoomPostReq } from "../../model/Request/Hotel/HotelRoomPostReq";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import multer from "multer";
import { storage } from "../../firebase";
import { UpdateHotelPostReq } from "../../model/Request/Hotel/UpdateHotelPostReq";

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

router.get("/allHotel", (req, res) => {
  conn.query(
    "SELECT Hotel.HID, Hotel.hotel_user_ID,User.name_user, Hotel.hotel_type_ID, Type_Hotel.typename_hotel, Hotel.name,Hotel.province, Hotel.address, Hotel.detail, Hotel.latitude, Hotel.longtitude, Hotel.datetime_addhotel FROM Hotel INNER JOIN Type_Hotel ON Type_Hotel.THID = Hotel.hotel_type_ID INNER JOIN User ON User.UID = Hotel.hotel_user_ID",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/:hid", (req, res) => {
  const HID = +req.params.hid;
  conn.query(
    "SELECT Hotel.HID, Hotel.hotel_user_ID,User.name_user, Hotel.hotel_type_ID, Type_Hotel.typename_hotel, Hotel.name,Hotel.province, Hotel.address, Hotel.detail, Hotel.latitude, Hotel.longtitude, Hotel.datetime_addhotel FROM Hotel INNER JOIN Type_Hotel ON Type_Hotel.THID = Hotel.hotel_type_ID INNER JOIN User ON User.UID = Hotel.hotel_user_ID WHERE Hotel.HID = ?",
      
    [HID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/hotelUrl/:hid", (req, res) => {
  const HID = +req.params.hid;
  conn.query(
    "SELECT Hotel_Channel.HCID, Hotel_Channel.hotel_ID, Hotel_Channel.url FROM Hotel_Channel INNER JOIN Hotel ON Hotel.HID = Hotel_Channel.hotel_ID WHERE Hotel_Channel.hotel_ID  = ?",
    [HID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/hotelImage/:hid", (req, res) => {
  const HID = +req.params.hid;
  conn.query(
    "SELECT Hotel_Image.HIMGID, Hotel_Image.hotel_ID, Hotel_Image.url_image FROM Hotel_Image INNER JOIN Hotel ON Hotel.HID = Hotel_Image.hotel_ID WHERE Hotel_Image.hotel_ID = ?",
    [HID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/hotelByUser/:uid", (req, res) => {
  const UID = +req.params.uid;
  conn.query(
    "SELECT Hotel.HID, Hotel.hotel_user_ID,User.name_user, Hotel.hotel_type_ID, Type_Hotel.typename_hotel, Hotel.name, Hotel.address, Hotel.detail, Hotel.latitude, Hotel.longtitude, Hotel.datetime_addhotel FROM Hotel INNER JOIN Type_Hotel ON Type_Hotel.THID = Hotel.hotel_type_ID INNER JOIN User ON User.UID = Hotel.hotel_user_ID WHERE Hotel.hotel_user_ID = ?",
      
    [UID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.post("/updateHotel/:hid", async (req, res) =>{
  const hid = parseInt(req.params.hid);
  const hotel : UpdateHotelPostReq = req.body;

  conn.query(
    "SELECT * FROM Type_Hotel WHERE THID = ?",
    [hotel.hotel_type_ID],
    (err, result) =>{
      if (err) {
        res.status(500).send("Error finding hotel type");
      } else {
        if (result[0] === null) {
          res.status(500).send("Error finding hotel type");
        }  else {
          conn.query(
            "SELECT * FROM Hotel WHERE HID = ?",
            [hid],
            (err, result) =>{
              if (err) {
                res.status(500).send("Not Found Hotel");
              } else {
                if (result[0] == null) {
                  res.status(500).send("Not Found Hotel");
                } else {
                  let sql =
                  "UPDATE Hotel SET hotel_type_ID = ?, address = ?, detail = ? WHERE HID =?";
                  sql = mysql.format(sql, [
                    hotel.hotel_type_ID,
                    hotel.address,
                    hotel.detail,
                    hid,
                  ]);
                  
                  conn.query(sql, (err, result) => {
                    if (err) {
                      res.status(500).json({
                        affected_row: 0,
                        result: err.sqlMessage,
                      });
                    } else {
                      res.status(200).json({
                        affected_row: result.affectedRows,
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
});

router.post("/addHotel/:uid", (req, res) => {
  const uid = parseInt(req.params.uid);
  const hotel: HotelPostReq = req.body;

  conn.query(
    "SELECT * FROM User WHERE UID = ? AND type_user = 2",
    [uid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found User");
      } else {
        // res.status(200).json(result[0]);
        if (result[0] == null) {
          res.status(500).send("Not Found User");
        } else {
          // res.status(200).send("Found User!");
          let sql =
            "INSERT INTO Hotel (`hotel_user_ID`,`hotel_type_ID`,`name`,`province`,`address`,`detail`,`latitude`,`longtitude`,`datetime_addhotel`) VALUES (?,?,?,?,?,?,?,?,NOW())";
          sql = mysql.format(sql, [
            (hotel.hotel_user_ID = uid),
            hotel.hotel_type_ID,
            hotel.name,
            hotel.province,
            hotel.address,
            hotel.detail,
            hotel.latitude,
            hotel.longtitude,
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

router.post("/addurl/:hid", (req, res) => {
  const hid = parseInt(req.params.hid);
  const hotel: HotelUrlPostReq = req.body;

  conn.query(
    "SELECT * FROM Hotel WHERE HID = ?",
    [hid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found Hotel");
      } else {
        // res.status(200).json(result[0]);
        if (result[0] == null) {
          res.status(500).send("Not Found Hotel");
        } else {
          let sql =
            "INSERT INTO Hotel_Channel (`hotel_ID`, `url`) VALUES (?,?)";
          sql = mysql.format(sql, [(hotel.hotel_ID = hid), hotel.url]);

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
  "/addhotelimage/:hid",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    const hid = parseInt(req.params.hid);
    const hotel: HotelImagePostReq = req.body;
    const file = req.file;

    conn.query(
      "SELECT * FROM Hotel WHERE HID = ?",
      [hid],
      async (err, result) => {
        if (err) {
          res.status(500).send("Not Found Hotel");
        } else {
          if (result[0] == null) {
            res.status(500).send("Not Found Hotel");
          } else {
            try {
              const url = await firebaseUpload(file!);
              hotel.url_image = url;

              let sql =
                "INSERT INTO Hotel_Image (`hotel_ID`, `url_image`) VALUES (?,?)";
              sql = mysql.format(sql, [
                (hotel.hotel_ID = hid),
                hotel.url_image,
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
            } catch (error) {
              res.status(500).json({
                error: "An error occurred during file processing",
              });
            }
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
  const storageRef = ref(storage, "/Hotelimages/" + filename);
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
    "/Hotelimages/" + path.split("F")[1].split("?")[0]
  );
  const snapshost = await deleteObject(storageRef);
}
