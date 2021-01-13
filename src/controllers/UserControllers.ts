import pool from "../config/db";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

class UserController {
  // REGISTER CONTROLLER
  public register = async (req: Request, res: Response) => {
    try {
      const { full_name, email_id, password } = req.body;

      // check if user exists
      // if yes then respond with error
      const checkEmail = await pool.query(
        `SELECT 1 FROM users WHERE email_id='${email_id}';`,
      );
      if (checkEmail.rowCount) {
        res.status(404).json({
          status: "failed",
          message: "Account already exists!",
        });
      } else {
        // hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // else validate inputs and add to DB
        const result = await pool.query(
          `INSERT INTO users (full_name, email_id, password) VALUES ('${full_name}', '${email_id}', '${hashedPass}') RETURNING *;`,
        );
        // send success response
        res.status(200).json({
          status: "success",
          message: `Successfully registered ${result.rows[0].full_name}!`,
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "failed",
        message: error,
      });
    }
  };

  // LOGIN CONTROLLER
  public login = async (req: Request, res: Response) => {
    try {
      // get user details
      const { email_id, password } = req.body;

      const checkUser = await pool.query(
        `SELECT * FROM users WHERE email_id='${email_id}';`,
      );
      if (checkUser.rowCount) {
        const hashPass = checkUser.rows[0].password;
        const user_id = checkUser.rows[0].user_id;
        // verify passwords
        const passMatch = await bcrypt.compare(password, hashPass);
        if (passMatch) {
          // login
          const jwt_token = jwt.sign({ user_id }, process.env.SECRET!, {
            expiresIn: "1d",
          });

          res.status(200).json({
            status: "success",
            data: {
              token: jwt_token,
            },
          });
        } else {
          // error
          res.status(404).json({
            status: "failed",
            message: "User credentials don't match! Try again.",
          });
        }
      } else {
        // user not present throw error
        res.status(404).json({
          status: "failed",
          message: "User doesn't exists! Create a new account",
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "failed",
        message: error,
      });
    }
  };

  // USER DETAILS CONTROLLER
  public users = async (req: Request, res: Response) => {
    try {
      if (res.locals.auth_error) {
        res.status(404).json({
          status: "failed",
          message: res.locals.auth_error,
        });
      } else {
        const user_id = res.locals.user_id;

        // retreive user data from DB
        const userData = await pool.query(
          `SELECT full_name, email_id, is_verified FROM users WHERE user_id='${user_id}';`,
        );

        res.status(200).json({
          status: "success",
          data: userData.rows[0],
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "failed",
        message: error,
      });
    }
  };
}

export default UserController;
