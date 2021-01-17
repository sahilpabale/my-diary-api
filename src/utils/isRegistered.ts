import e from "express";
import pool from "../config/db";

const isRegistered = async (email: string): Promise<any> => {
  try {
    const result = await pool.query(`SELECT * FROM users WHERE email_id=$1;`, [
      email,
    ]);
    if (result.rowCount) {
      return result.rows[0];
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default isRegistered;
