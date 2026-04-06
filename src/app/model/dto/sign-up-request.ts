export type SignUpRequest = {
      username: string,
      password: string,
      name: string,
      gender: number,
      dob: string,
      avatar: File | undefined,
}