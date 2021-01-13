import pool from "../config/db";
import { Request, Response } from "express";

class DiaryController {
  public getAllDiaries = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        // send that error
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
        });
      } else {
        const user_id = res.locals.user_id;

        const diariesData = await pool.query(
          `SELECT * FROM diary WHERE user_id='${user_id}';`,
        );

        res.status(200).json({
          status: "success",
          results: diariesData.rowCount,
          data: diariesData.rows,
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "failed",
        message: error,
      });
    }
  };

  public getDiary = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
        });
      } else {
        // const user_id = res.locals.user_id;

        const diary_id = req.params.id;

        const diaryData = await pool.query(
          `SELECT * FROM diary WHERE diary_id='${diary_id}';`,
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
          status: "failed",
          message: error,
        });
      }
      // console.log(error);
    }
  };

  public createDiary = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        // send that error
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
        });
      } else {
        const user_id = res.locals.user_id;
        const { diary_title, diary_body, diary_mood } = req.body;

        const result = await pool.query(
          `INSERT INTO diary (user_id, diary_title, diary_body, diary_created_at, diary_updated_at, diary_mood) VALUES ('${user_id}', '${diary_title}', '${diary_body}', NOW(), NOW(), '${diary_mood}') RETURNING diary_id, diary_title;`,
        );

        res.status(201).json({
          status: "success",
          data: result.rows[0],
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "failed",
        message: error,
      });
    }
  };

  public updateDiary = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
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
              `UPDATE diary SET ${key}='${req.body[key]}', diary_updated_at=NOW() WHERE diary_id='${diary_id}';`,
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
          status: "failed",
          message: error,
        });
      }
    }
  };

  public deleteDiary = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
        });
      } else {
        const diary_id = req.params.id;

        const result = await pool.query(
          `DELETE FROM diary WHERE diary_id='${diary_id}' RETURNING 1;`,
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
          status: "failed",
          message: error,
        });
      }
    }
  };
}

export default DiaryController;
