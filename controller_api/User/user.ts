import express from "express";
import { conn } from "../../app";
import { UserPostReq } from "../../model/Request/User/UserPostReq";
import mysql from "mysql";
import multer from "multer";
import * as crypto from "crypto";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { storage } from "../../firebase";
import { LoginPostReq } from "../../model/Request/User/LoginPostReq";
import { UpdateUserPostReq } from "../../model/Request/User/UpdateUserPostReq";

export const router = express.Router();

class FileMiddleware {
  public readonly diskLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 67108864, // 64 MByte
    },
  });
}

// ใช้ crypto เพื่อเข้ารหัสรหัสผ่านของผู้ใช้
function hashPassword(password: string): string {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
}

router.get("/allUser", (req, res) => {
  conn.query("SELECT * FROM User", (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result);
    }
  });
});

router.get("/:uid", (req, res) => {
  const UID = +req.params.uid;
  conn.query(
    "SELECT User.UID, User.image_user, User.name_user, User.nickname_user, User.province, User.gmail_user, User.password_user, User.phone, User.facebook, User.lineID, User.datetime_register, User.type_user, Type_User.typename_user FROM User INNER JOIN Type_User ON Type_User.TUID = User.type_user WHERE User.UID = ?",
    [UID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result[0]);
      }
    }
  );
});

router.post("/register", (req, res) => {
  const user: UserPostReq = req.body;

  if (!user.password_user) {
    return res.status(400).json({ error: "Password is required" });
  }

  let sql =
    "INSERT INTO User (image_user, name_user, nickname_user, province, gmail_user, password_user, datetime_register, facebook, phone, type_user) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?)";
  sql = mysql.format(sql, [
    user.image_user,
    user.name_user,
    user.nickname_user,
    user.province,
    user.gmail_user,
    hashPassword(user.password_user),
    user.facebook,
    user.phone,
    user.type_user,
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
});

router.post("/login", (req, res) => {
  const login: LoginPostReq = req.body;
  conn.query(
    "SELECT User.UID, User.image_user, User.name_user, User.nickname_user, User.province, User.gmail_user, User.password_user, User.phone, User.facebook, User.lineID, User.datetime_register, User.type_user, Type_User.typename_user FROM User INNER JOIN Type_User ON Type_User.TUID = User.type_user WHERE User.gmail_user = ? AND User.password_user = ?",
    [login.gmail_user, hashPassword(login.password_user)],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.sqlMessage });
      } else {
        if (result.length > 0) {
          res.status(200).json(result);
        } else {
          res.status(401).json({ error: "Invalid credentials" });
        }
      }
    }
  );
});

const fileUpload = new FileMiddleware();

router.post(
  "/update/:uid",
  fileUpload.diskLoader.single("file"),
  async (req, res) => {
    const uid = parseInt(req.params.uid);
    const user: UpdateUserPostReq = req.body;
    const file = req.file;

    conn.query(
      "SELECT * FROM User WHERE UID = ?",
      [uid],
      async (err, result) => {
        if (err) {
          res.status(500).send("Not Found User");
        } else {
          try {
            if (file) {
              // ลบรูปภาพเดิมถ้ามีอยู่ใน Firebase Storage
              if (result[0].image_user) {
                await firebaseDelete(result[0].image_user);
              }
              // อัปโหลดรูปภาพใหม่ไปยัง Firebase Storage
              const url = await firebaseUpload(file);
              user.image_user = url;
            }

            let sql =
              "UPDATE User SET image_user = ?, name_user = ?, nickname_user = ?, province = ?, phone = ?, facebook = ?, lineID = ? WHERE UID = ?";
            sql = mysql.format(sql, [
              user.image_user || result[0].image_user,
              user.name_user || result[0].name_user,
              user.nickname_user || result[0].nickname_user,
              user.province || result[0].province,
              user.phone || result[0].phone,
              user.facebook || result[0].facebook,
              user.lineID || result[0].lineID,
              uid,
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
  const storageRef = ref(storage, "/images/" + filename);
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
    "/images/" + path.split("F")[1].split("?")[0]
  );
  const snapshost = await deleteObject(storageRef);
}