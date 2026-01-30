import {ImageSpec} from "./image-spec";

export class User {


      constructor(public id: string = "",
                  public username: string = "",
                  public name: string = "",
                  public gender: number = 0,
                  public dob: string = "",
                  public avatar: ImageSpec = new ImageSpec(),
                  public role: string = "ROLE_USER",
      ) {
      }
}
