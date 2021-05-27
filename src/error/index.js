class CustomError extends Error {
  constructor(name, message) {
    super(name)
    this.name = name
    this.message = message
  }
}

const UNAUTHORIZED_ERROR_NAME = 'UNAUTHORIZED_ERROR'
export class UNAUTHORIZED_ERROR extends CustomError {
  constructor() {
    super(UNAUTHORIZED_ERROR_NAME, { user: `user is unauthorized` })
  }
}

const TOKEN_INVALID_ERROR_NAME = 'TOKEN_INVALID_ERROR'
export class TOKEN_INVALID_ERROR extends CustomError {
  constructor() {
    super(TOKEN_INVALID_ERROR_NAME, { token: `token is invalid` })
  }
}

const INVALID_MONGOID_ERROR_NAME = 'INVALID_MONGOID_ERROR'
export class INVALID_MONGOID_ERROR extends CustomError {
  constructor() {
    super(INVALID_MONGOID_ERROR_NAME, { MID: `Mongo id is invalid` })
  }
}

const DUPLICATED_VALUE_ERROR_NAME = 'DUPLICATED_VALUE_ERROR'
export class DUPLICATED_VALUE_ERROR extends CustomError {
  constructor(value) {
    super(DUPLICATED_VALUE_ERROR_NAME, { [value]: `${value} is duplicated` })
  }
}

const NOT_FOUND_ERROR_NAME = 'NOT_FOUND_ERROR'
export class NOT_FOUND_ERROR extends CustomError {
  constructor(value) {
    super(NOT_FOUND_ERROR_NAME, { [value]: `${value} is not found` })
  }
}

const REGISTER_FAIL_ERROR_NAME = 'REGISTER_FAIL_ERROR'
export class REGISTER_FAIL_ERROR extends CustomError {
  constructor(values) {
    const message = values.reduce((result, value) => ({ ...result, [value]: `${value} is invalid` }), {})
    super(REGISTER_FAIL_ERROR_NAME, message)
  }
}

const LOGIN_FAIL_ERROR_NAME = 'LOGIN_FAIL_ERROR'
export class LOGIN_FAIL_ERROR extends CustomError {
  constructor(values) {
    const message = values.reduce((result, value) => ({ ...result, [value]: `${value} is invalid` }), {})
    super(LOGIN_FAIL_ERROR_NAME, message)
  }
}

export function onError(err, req, res, next) {
  switch (err.name) {
    case INVALID_MONGOID_ERROR_NAME:
    case DUPLICATED_VALUE_ERROR_NAME:
    case REGISTER_FAIL_ERROR_NAME:
    case LOGIN_FAIL_ERROR_NAME:
    case TOKEN_INVALID_ERROR_NAME:
      return res.status(400).send(err)

    case NOT_FOUND_ERROR_NAME:
      return res.status(404).send(err)

    case UNAUTHORIZED_ERROR_NAME:
      return res.status(401).json(err)

    default:
      console.log(err)
      return res.status(500).send(err)
  }
}
