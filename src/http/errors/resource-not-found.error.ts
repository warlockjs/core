export class ResourceNotFoundError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ResourceNotFoundError";
  }
}

export class UnAuthorizedError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "UnAuthorizedError";
  }
}

export class ForbiddenError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}
