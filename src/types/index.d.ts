import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    role_id: number;
    email: string;
  };
}
