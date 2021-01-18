declare namespace Express {
  interface Request {
    user: {
      user_id: string;
      email_id: string;
    };
    error: any;
  }
}
