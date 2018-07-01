'use strict'

module.exports = {
  error: {
    InternalServerError: 'An internal server error occurred!',
    NotFoundError: 'The resource could not be found!',
    UnauthorizedError: 'Authorization failed!',
    JsonWebTokenError: 'Authorization failed: Invalid token!',
    TokenExpiredError: 'Your authorization has been expired!',
    RenewTokenError: 'Your authorization cannot be refreshed!',
    MissingParamsError: 'Missing mandatory fields!',
    AccountCreationError: 'The account could not be created!',
    AccountUpdateError: 'The account could not be updated!',
    AccountNotFoundError: 'Authorization failed: Could not find an associated account!',
    AccountNotActivatedError: 'Authorization failed: The account is not activated!',
    ValidationError: 'Validation failed!',
    UniqueValidationError: {
      username: 'The username is already taken',
      email: 'The email address is already in use',
      wallet: 'The wallet address is already in use'
    },
    RequiredValidationError: {
      username: 'The username is mandatory',
      email: 'The email address is mandatory',
      address: 'The wallet address is mandatory'
    },
    FormatValidationError: {
      email: 'The email address is invalid',
      password: 'The password must be at least 8 characters long'
    },
    InvalidValidationError: {
      username: 'The username is unknown',
      password: 'The password did not match',
      transferToken: 'The token amount must be between 0 and 1000000'
    }
  },

  success: {
    AccountSignUpSuccess: 'The account has been successfully created.',
    AccountUpdateSuccess: 'The account has been successfully updated.',
    MarketTokenReleaseSuccess: 'The token has been successfully released for trading.',
    MarketTradeSuccess: 'The trading transaction was successfully mined.',
    MarketRevokeOfferSuccess: 'The offer was successfully revoked.'
  }
}
