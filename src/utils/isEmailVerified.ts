import pool from "../config/db";

const verify = async (email: string): Promise<boolean> => {
  try {
    const result = await pool.query(
      `SELECT is_verified FROM users WHERE email_id='${email}';`,
    );
    return result.rows[0].is_verified;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default verify;
