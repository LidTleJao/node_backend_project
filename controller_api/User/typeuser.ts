import express from "express";
import { conn } from "../../app";
import { TypeUserPostReq } from "../../model/Request/User/TypeUserPostReq";
import mysql from "mysql";

export const router = express.Router();

router.get("/alltypeUser", (req, res) => {
  conn.query("SELECT * FROM Type_User", (err, result, fields) => {
    if (err) {
      console.error("Error fetching data:", err); // เพิ่มการพิมพ์ข้อผิดพลาด
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

router.post("/typeput", (req, res) => {
  let type_user: TypeUserPostReq = req.body;

  // Validation
  if (!type_user.typename_user || typeof type_user.typename_user !== "string") {
    return res.status(400).json({ error: "Invalid typename_user" });
  }

  let sql = "INSERT INTO `Type_User`(`typename_user`) VALUES (?)";
  sql = mysql.format(sql, [type_user.typename_user]);

  conn.query(sql, (err, result) => {
    if (err) {
      console.error("Error inserting data:", err); // เพิ่มการพิมพ์ข้อผิดพลาด
      return res
        .status(500)
        .json({ affected_row: 0, last_idx: 0, result: err.sqlMessage });
    }
    res.status(201).json({
      affected_row: result.affectedRows,
      last_idx: result.insertId,
      result: "",
    });
  });
});
