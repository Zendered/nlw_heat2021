import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface IPayload {
  sub: string;
}

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.headers.authorization;

  if (!authToken) return res.status(401).json({ ErrorCode: "Token invalid!" });

  const [, token] = authToken.split(" ");

  try {
    const { sub } = verify(token, `${process.env.JWT_SECRET}`) as IPayload;
    req.user_id = sub;
    next();
  } catch (error) {
    return res.status(401).json({ ErrorCode: "Token expired!" });
  }
};
