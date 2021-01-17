import pool from "../config/db";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import emailVerified from "../utils/isAccountVerified";
import verifyEmail from "../utils/emailVerification";
import isRegistered from "../utils/isRegistered";

const sendMail = new verifyEmail().send;

class UserController {
  // REGISTER CONTROLLER
  public register = async (req: Request, res: Response) => {
    try {
      const { full_name, email_id, password } = req.body;

      // check if user exists
      if (await isRegistered(email_id)) {
        res.status(404).json({
          status: "failed",
          message: "Account already exists!",
        });
      } else {
        // hash password
        const hashedPass = await bcrypt.hash(password, 10);

        // else validate inputs and add to DB
        const result = await pool.query(
          `INSERT INTO users (full_name, email_id, password) VALUES ($1, $2, $3) RETURNING *;`,
          [full_name, email_id, hashedPass],
        );

        sendMail(email_id);

        // send success response
        res.status(200).json({
          status: "success",
          message: `Successfully registered ${result.rows[0].full_name}! Please verify your email id to login.`,
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error,
      });
    }
  };

  // LOGIN CONTROLLER
  public login = async (req: Request, res: Response) => {
    try {
      // get user details
      const { email_id, password } = req.body;
      const user = await isRegistered(email_id);
      if (user) {
        if (await emailVerified(email_id)) {
          const hashPass = user.rows[0].password;
          const user_id = user.rows[0].user_id;
          // verify passwords
          const passMatch = await bcrypt.compare(password, hashPass);
          if (passMatch) {
            // login
            const jwt_token = jwt.sign(
              { user_id, email_id },
              process.env.SECRET!,
              {
                expiresIn: "1d",
              },
            );

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
            message: "Your account is not verified yet!",
          });
        }
      } else {
        res.status(404).json({
          status: "failed",
          message: "User doesn't exists! Create a new account",
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error,
      });
    }
  };

  // USER DETAILS CONTROLLER
  public users = async (req: Request, res: Response) => {
    try {
      if (req.error) {
        res.status(404).json({
          status: "error",
          message: req.error,
        });
      } else {
        const { user_id } = req.user;

        // retreive user data from DB
        const userData = await pool.query(
          "SELECT full_name, email_id, is_verified FROM users WHERE user_id = $1;",
          [user_id],
        );

        res.status(200).json({
          status: "success",
          data: userData.rows[0],
        });
      }
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error,
      });
    }
  };
}

export default UserController;
