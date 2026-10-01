export class ApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

