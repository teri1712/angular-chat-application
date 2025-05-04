export class AccessToken {
      constructor(
              public accessToken: string,
              public refreshToken: string,
              public expiresIn: number,
              public createdAt: Date,
      ) {
      }
}
