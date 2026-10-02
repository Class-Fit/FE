export class ApiError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
