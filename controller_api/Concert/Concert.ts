import express from "express";
import { conn } from "../../app";
import mysql from "mysql";
import multer from "multer";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { storage } from "../../firebase";
import { ConcertPostReq } from "../../model/Request/Concert/ConcertPostReq";
import { ConcertUrlPostReq } from "../../model/Request/Concert/ConcertUrlPostReq";
import { ConcertShowTimePostReq } from "../../model/Request/Concert/ConcertShowTimePostReq";
import { ConcertTicketPostReq } from "../../model/Request/Concert/ConcertTicketPostReq";
import { UpdateConcertPostReq } from "../../model/Request/Concert/UpdateConcertPostReq";
import { UpdateConcertChannelPostReq } from "../../model/Request/Concert/UpdateConcertChannel";
import { UpdateConcertShowPostReq } from "../../model/Request/Concert/UpdateConcertShowPostReq";
import { UpdateConcertTicketPostReq } from "../../model/Request/Concert/UpdateConcertTicketPostReq";

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

router.get("/allConcert", (req, res) => {
  conn.query(
    "SELECT Concert.CID, Concert.user_ID, Concert.concert_type_ID, Concert_Type.name_type_concert, Concert.poster_concert, Concert.performance_chart, Concert.show_schedule_concert, Concert.name_concert, Concert.lineup, Concert.address_concert, Concert.province, Concert.detail_concert, Concert.datetime_add_concert FROM Concert INNER JOIN Concert_Type ON Concert_Type.CTID = Concert.concert_type_ID",
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/:cid", (req, res) => {
  const CID = +req.params.cid;
  conn.query(
    "SELECT Concert.CID, Concert.user_ID, Concert.concert_type_ID, Concert_Type.name_type_concert, Concert.poster_concert, Concert.performance_chart, Concert.show_schedule_concert, Concert.name_concert, Concert.lineup, Concert.address_concert, Concert.province, Concert.detail_concert, Concert.datetime_add_concert FROM Concert INNER JOIN Concert_Type ON Concert_Type.CTID = Concert.concert_type_ID WHERE Concert.CID = ?",
    [CID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/concertByUser/:uid", (req, res) => {
  const UID = +req.params.uid;
  conn.query(
    "SELECT Concert.CID, Concert.user_ID, User.name_user, Concert.concert_type_ID, Concert_Type.name_type_concert, Concert.poster_concert, Concert.performance_chart, Concert.show_schedule_concert, Concert.name_concert, Concert.lineup, Concert.address_concert, Concert.province, Concert.detail_concert, Concert.datetime_add_concert FROM Concert INNER JOIN Concert_Type ON Concert_Type.CTID = Concert.concert_type_ID INNER JOIN User ON User.UID = Concert.user_ID WHERE Concert.user_ID = ?",
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

router.get("/concertChannel/:cid", (req, res) => {
  const CID = +req.params.cid;
  conn.query(
    "SELECT Concert_Channel.CCID, Concert_Channel.concert_ID, Concert_Channel.channel FROM Concert_Channel INNER JOIN Concert ON Concert.CID = Concert_Channel.concert_ID WHERE Concert_Channel.concert_ID = ?",
    [CID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/concertShow/:cid", (req, res) => {
  const CID = +req.params.cid;
  conn.query(
    "SELECT Concert_ShowTime.CSTID, Concert_ShowTime.concert_ID, Concert_ShowTime.show_concert, Concert_ShowTime.time_show_concert FROM Concert_ShowTime INNER JOIN Concert ON Concert.CID = Concert_ShowTime.concert_ID WHERE Concert_ShowTime.concert_ID = ?",
    [CID],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.get("/concertTicket/:cid", (req, res) => {
  const cid = +req.params.cid;
  conn.query(
    "SELECT Concert_Ticket.CTID, Concert_Ticket.concert_ID, Concert.name_concert, Concert_Ticket.show_ID, Concert_ShowTime.show_concert, Concert_ShowTime.time_show_concert, Concert_Ticket.type_ticket_ID, Concert_Ticket_Type.name_type_ticket, Concert_Ticket.ticket_zone, Concert_Ticket.price FROM Concert_Ticket INNER JOIN Concert ON Concert.CID = Concert_Ticket.concert_ID INNER JOIN Concert_ShowTime ON Concert_ShowTime.CSTID = Concert_Ticket.show_ID INNER JOIN Concert_Ticket_Type ON Concert_Ticket_Type.CTTID = Concert_Ticket.type_ticket_ID WHERE Concert_Ticket.concert_ID = ?",
    [cid],
    (err, result) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json(result);
      }
    }
  );
});

router.post("/updateConcert/:cid", async (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: UpdateConcertPostReq = req.body;

  conn.query(
    "SELECT * FROM Concert_Type WHERE CTID = ?",
    [concert.concert_type_ID],
    (err, result) => {
      if (err) {
        res.status(500).send("Error finding concert type");
      } else {
        if (result[0] === null) {
          res.status(500).send("Error finding concert type");
        } else {
          conn.query(
            "SELECT * FROM Concert WHERE CID = ?",
            [cid],
            (err, result) => {
              if (err) {
                res.status(500).send("Not Found Concert");
              } else {
                if (result[0] == null) {
                  res.status(500).send("Not Found Concert");
                } else {
                  let sql =
                    "UPDATE Concert SET concert_type_ID = ?, show_schedule_concert = ?, lineup = ?, address_concert = ?,  detail_concert = ? WHERE CID = ?";
                  sql = mysql.format(sql, [
                    concert.concert_type_ID,
                    concert.show_schedule_concert,
                    concert.lineup,
                    concert.address_concert,
                    concert.detail_concert,
                    cid,
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

router.post("/updateConcertChannel/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: UpdateConcertChannelPostReq = req.body;

  // ค้นหาคอนเสิร์ตด้วย CID ก่อน
  conn.query("SELECT * FROM Concert WHERE CID = ?", [cid], (err, result) => {
    if (err) {
      res.status(500).send("Error finding concert");
    } else {
      if (result[0] === null) {
        res.status(500).send("Error finding concert");
      } else {
        // ค้นหา Concert_Channel ด้วย CCID
        conn.query(
          "SELECT * FROM Concert_Channel WHERE CCID = ?",
          [concert.CCID],
          (err, result) => {
            if (err) {
              res.status(500).send("Error finding concert channel");
            } else {
              if (result.length === 0) {
                // ถ้าไม่เจอข้อมูลของ CCID ในตาราง Concert_Channel ให้ทำการ INSERT
                let insertSql =
                  "INSERT INTO Concert_Channel (concert_ID, channel) VALUES (?, ?)";
                insertSql = mysql.format(insertSql, [cid, concert.channel]);

                conn.query(insertSql, (err, result) => {
                  if (err) {
                    res.status(500).json({
                      affected_row: 0,
                      result: err.sqlMessage,
                    });
                  } else {
                    res.status(200).json({
                      affected_row: result.affectedRows,
                      message: "Concert channel inserted successfully",
                      result: result,
                    });
                  }
                });
              } else {
                // ถ้าเจอข้อมูล CCID ใน Concert_Channel ให้ทำการ UPDATE
                let updateSql =
                  "UPDATE Concert_Channel SET concert_ID = ?, channel = ? WHERE CCID = ?";
                updateSql = mysql.format(updateSql, [
                  cid,
                  concert.channel,
                  concert.CCID,
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
                      message: "Concert channel updated successfully",
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
  });
});

router.post("/updateConcertShow/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: UpdateConcertShowPostReq = req.body;

  conn.query("SELECT * FROM Concert WHERE CID = ?", [cid], (err, result) => {
    if (err) {
      res.status(500).send("Error finding concert");
    } else {
      if (result[0] == null) {
        res.status(500).send("Error finding concert");
      } else {
        conn.query(
          "SELECT * FROM Concert_ShowTime WHERE CSTID = ?",
          [concert.CSTID],
          (err, result) => {
            if (err) {
              res.status(500).send("Error finding concert showtime");
            } else {
              if (result[0] == null) {
                res.status(500).send("Error finding concert showtime");
              } else {
                let updateSql =
                  "UPDATE Concert_ShowTime SET concert_ID = ?, show_concert = ?, time_show_concert = ? WHERE CSTID = ?";
                updateSql = mysql.format(updateSql, [
                  cid,
                  concert.show_concert,
                  concert.time_show_concert,
                  concert.CSTID,
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
                      message: "Concert showtime updated successfully",
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
  });
});

router.post("/updateConcertTicket/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: UpdateConcertTicketPostReq = req.body;

  conn.query("SELECT * FROM Concert WHERE CID = ?", [cid], (err, result) => {
    if (err) {
      res.status(500).send("Error finding concert");
    } else {
      if (result[0] === null) {
        res.status(500).send("Error finding concert");
      } else {
        conn.query(
          "SELECT * FROM Concert_Ticket_Type WHERE CTTID = ?",
          [concert.type_ticket_ID],
          (err, result) => {
            if (err) {
              res.status(500).send("Error finding concert ticket type");
            } else {
              if (result[0] === null) {
                res.status(500).send("Error finding concert ticket type");
              } else {
                let updateSql =
                  "UPDATE Concert_Ticket SET concert_ID = ?, type_ticket_ID = ?, ticket_zone = ?, price = ? WHERE CTID = ?";
                updateSql = mysql.format(updateSql, [
                  (concert.concert_ID = cid),
                  concert.type_ticket_ID,
                  concert.ticket_zone,
                  concert.price,
                  concert.CTID,
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
                      message: "Concert tickket updated successfully",
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
  });
});

router.post(
  "/addconcert/:uid",
  // fileUpload.diskLoader.single("file"),
  fileUpload.diskLoader.fields([
    { name: "poster_concert", maxCount: 1 },
    { name: "performance_chart", maxCount: 1 },
  ]),
  async (req, res) => {
    const uid = parseInt(req.params.uid);
    const concert: ConcertPostReq = req.body;
    const filePoster = (
      req.files as { [fieldname: string]: Express.Multer.File[] }
    ).poster_concert?.[0];
    const filePerformance = (
      req.files as { [fieldname: string]: Express.Multer.File[] }
    ).performance_chart?.[0];

    if (!filePoster || !filePerformance) {
      return res.status(400).json({ error: "Missing file(s)" });
    }

    conn.query(
      "SELECT * FROM User WHERE UID = ? AND type_user = 2",
      [uid],
      async (err, result) => {
        if (err) {
          res.status(500).send("Not Found User");
        } else {
          if (result[0] == null) {
            res.status(500).send("Not Found User");
          } else {
            try {
              const url_poster = await firebaseUpload(filePoster!);
              const url_performance = await firebaseUpload(filePerformance!);
              concert.poster_concert = url_poster;
              concert.performance_chart = url_performance;

              let sql =
                "INSERT INTO Concert (`user_ID`,`concert_type_ID`,`poster_concert`,`performance_chart`,`show_schedule_concert`,`name_concert`,`lineup`,`address_concert`,`province`,`detail_concert`,`datetime_add_concert`) VALUES (?,?,?,?,?,?,?,?,?,?,NOW())";
              sql = mysql.format(sql, [
                (concert.user_ID = uid),
                concert.concert_type_ID,
                concert.poster_concert,
                concert.performance_chart,
                concert.show_schedule_concert,
                concert.name_concert,
                concert.lineup,
                concert.address_concert,
                concert.province,
                concert.detail_concert,
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

router.post("/addurl/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: ConcertUrlPostReq = req.body;

  conn.query(
    "SELECT * FROM Concert WHERE CID = ?",
    [cid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found Concert" + err);
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Concert");
        } else {
          let sql =
            "INSERT INTO Concert_Channel (`concert_ID`,`channel`) VALUES (?,?)";
          sql = mysql.format(sql, [
            (concert.concert_ID = cid),
            concert.channel,
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

router.post("/addshowtime/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: ConcertShowTimePostReq = req.body;

  conn.query(
    "SELECT * FROM Concert WHERE CID = ?",
    [cid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found Concert");
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Concert");
        } else {
          let sql =
            "INSERT INTO Concert_ShowTime (`concert_ID`,`show_concert`,`time_show_concert`) VALUES (?,?,?)";
          sql = mysql.format(sql, [
            (concert.concert_ID = cid),
            concert.show_concert,
            concert.time_show_concert,
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

router.post("/addticket/:cid", (req, res) => {
  const cid = parseInt(req.params.cid);
  const concert: ConcertTicketPostReq = req.body;

  conn.query(
    "SELECT * FROM Concert WHERE CID = ?",
    [cid],
    async (err, result) => {
      if (err) {
        res.status(500).send("Not Found Concert");
      } else {
        if (result[0] == null) {
          res.status(500).send("Not Found Concert");
        } else {
          let sql =
            "INSERT INTO Concert_Ticket (`concert_ID`,`show_ID`,`type_ticket_ID`,`ticket_zone`,`price`) VALUES (?,?,?,?,?)";
          sql = mysql.format(sql, [
            (concert.concert_ID = cid),
            concert.show_ID,
            concert.type_ticket_ID,
            concert.ticket_zone,
            concert.price,
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

async function firebaseUpload(file: Express.Multer.File) {
  // Upload to firebase storage
  const filename = Date.now() + "-" + Math.round(Math.random() * 1000) + ".png";
  // Define locations to be saved on storag
  const storageRef = ref(storage, "/Concertimages/" + filename);
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
    "/Concertimages/" + path.split("F")[1].split("?")[0]
  );
  const snapshost = await deleteObject(storageRef);
}
