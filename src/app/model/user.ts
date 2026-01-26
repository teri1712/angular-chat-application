import {ImageSpec} from "./image-spec";

export class User {

      static from(raw: any): User {
            const id = raw.id ?? "";
            const username = raw.username ?? "";
            const name = raw.name ?? "";
            const gender = typeof raw.gender === 'number' ? raw.gender : 0;
            const avatar = raw.avatar ? ImageSpec.from(raw.avatar) : new ImageSpec();
            const role = raw.role ?? "";
            return new User(id, username, name, gender, avatar, role);
      }

      constructor(public id: string = "",
                  public username: string = "",
                  public name: string = "",
                  public gender: number = 0,
                  public avatar: ImageSpec = new ImageSpec(),
                  public role: string = "",
      ) {
      }
}
