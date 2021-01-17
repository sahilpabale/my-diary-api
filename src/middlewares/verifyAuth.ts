import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";

const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.headers.authorization) {
      res.status(404).json({
        status: "failed",
        message: "There is no token to authorize!",
      });
    } else {
      const bearerToken = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(bearerToken, process.env.SECRET!);

      const { user_id, email_id } = decoded as any;

      // res.locals.user = { user_id, email_id };
      req.user = { user_id, email_id };
      next();
    }
  } catch (error) {
    req.error = error;
    next();
  }
};

export default verifyAuth;
