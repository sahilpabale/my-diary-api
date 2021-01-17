import pool from "../config/db";
import { Request, Response } from "express";

class DiaryController {
  public getAllDiaries = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        // send that error
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        const user_id = req.user.user_id;

        const diariesData = await pool.query(
          `SELECT * FROM diary WHERE user_id=$1;`,
          [user_id],
        );

        res.status(200).json({
          status: "success",
          results: diariesData.rowCount,
          data: diariesData.rows,
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error,
      });
    }
  };

  public getDiary = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        // const user_id = res.locals.user_id;

        const diary_id = req.params.id;

        const diaryData = await pool.query(
          `SELECT * FROM diary WHERE diary_id=$1;`,
          [diary_id],
        );

        res.status(200).json({
          status: "success",
          data: diaryData.rows,
        });
      }
    } catch (error) {
      if (error.code === "22P02") {
        res.status(404).json({
          status: "failed",
          message: "No diary available with that ID",
        });
      } else {
        res.status(404).json({
          status: "error",
          message: error,
        });
      }
      // console.log(error);
    }
  };

  public createDiary = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        // send that error
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        const { user_id, email_id } = req.user;
        const { diary_title, diary_body, diary_mood } = req.body;

        const result = await pool.query(
          "INSERT INTO diary (user_id, user_email, diary_title, diary_body, diary_updated_at, diary_mood) VALUES($1, $2, $3, $4, NOW(), $5) RETURNING *;",
          [user_id, email_id, diary_title, diary_body, diary_mood],
        );

        res.status(201).json({
          status: "success",
          data: result.rows[0],
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error,
      });
    }
  };

  public updateDiary = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        const diary_id = req.params.id;

        if (!Object.keys(req.body).length) {
          // nothing to update
          res.status(404).json({
            status: "failed",
            message: "No data provided to update the diary.",
          });
        } else {
          let updatedStack: string[] = [];
          for (let key in req.body) {
            // update individual item
            let updated = await pool.query(
              `UPDATE diary SET $1=$2, diary_updated_at=NOW() WHERE diary_id=$3;`,
              [key, req.body[key], diary_id],
            );

            updatedStack.push(key);
          }

          res.status(200).json({
            status: "success",
            message: `${updatedStack} fields updated!`,
          });
        }
      }
    } catch (error) {
      if (error.code === "22P02") {
        res.status(404).json({
          status: "failed",
          message: "No diary available with that ID",
        });
      } else {
        res.status(404).json({
          status: "error",
          message: error,
        });
      }
    }
  };

  public deleteDiary = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        const diary_id = req.params.id;

        const result = await pool.query(
          `DELETE FROM diary WHERE diary_id=$1 RETURNING 1;`,
          [diary_id],
        );
        if (!result.rowCount) {
          res.status(200).json({
            status: "failed",
            message: "Diary with that ID doesn't exist!",
          });
        } else {
          res.status(200).json({
            status: "success",
            message: "Diary deleted successfully",
          });
        }
      }
    } catch (error) {
      if (error.code === "22P02") {
        res.status(404).json({
          status: "failed",
          message: "No diary available with that ID",
        });
      } else {
        res.status(404).json({
          status: "error",
          message: error,
        });
      }
    }
  };
}

export default DiaryController;
