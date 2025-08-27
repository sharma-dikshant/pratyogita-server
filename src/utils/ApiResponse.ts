class ApiResponse {
  constructor(
    private status: Number,
    private message: string,
    private data: any
  ) {}

  send(res) {
    res.status(this.status).json({
      message: this.message,
      data: this.data,
    });
  }
}

export default ApiResponse;
