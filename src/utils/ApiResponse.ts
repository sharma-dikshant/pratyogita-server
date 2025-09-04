import { Response } from "express";
class ApiResponse {
  constructor(
    private status: number,
    private message: string,
    private data: any
  ) {}

  send(res: Response) {
    res.status(this.status).json({
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
