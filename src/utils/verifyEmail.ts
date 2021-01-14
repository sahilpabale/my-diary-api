import * as jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { Request, Response } from "express";
import pool from "../config/db";
import emailVerify from "./isEmailVerified";

class verifyEmail {
  public send = (email: string) => {
    const token = jwt.sign({ email }, process.env.SECRET!, { expiresIn: "1d" });

    const verifyUrl: string = `${process.env.APP_URL}/api/confirm/${token}`;

    const transporter = nodemailer.createTransport({
      pool: true,
      host: process.env.MAIL_HOST,
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const mailContent = {
      from: "MyDiary Support<mydiary@sahilpabale.me>",
      to: email,
      subject: "Verify your Account to Login!",
      html: `
      <p>Click on the link below to verify your email address</p>
      <a href='${verifyUrl}'>Click here to verify.</a> <br><br>
      <small>This link will expire in 24 hrs.</small>
      `,
    };

    transporter.sendMail(mailContent, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
  };

  public verify = async (req: Request, res: Response) => {
    try {
      const token = req.params.token;

      const decoded = jwt.verify(token, process.env.SECRET!);

      interface DecodedMail {
        email: string;
      }

      const email_id = (decoded as DecodedMail).email;

      if (await emailVerify(email_id)) {
        res.status(404).json({
          status: "failed",
          message: "Your account is already verified!",
        });
      } else {
        const result = await pool.query(
          `UPDATE users SET is_verified=true WHERE email_id='${email_id}';`,
        );

        res.status(200).json({
          status: "success",
          message: "Email Verified Successfully!",
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

export default verifyEmail;
