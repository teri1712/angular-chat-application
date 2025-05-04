import {ImageSpec} from "./image-spec";

export class User {

      static from(raw: any): User {
            const id = raw.id ?? "";
            const username = raw.username ?? "";
            const name = raw.name ?? "";
            const gender = raw.gender ?? "";
            const avatar = raw.avatar ? ImageSpec.from(raw.avatar) : new ImageSpec();
            const role = raw.role ?? "";
            return new User(id, username, name, gender, avatar, role);
      }

      constructor(public id: string = "",
                  public username: string = "",
                  public name: string = "",
                  public gender: string = "",
                  public avatar: ImageSpec = new ImageSpec(),
                  public role: string = "",
      ) {
      }
}
