import {Injectable} from "@angular/core";
import {ListRepository} from "./repository";
import {map, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../../environments";
import {Conversation} from "../../../model/conversation";
import {DialogRepository} from "./dialog-repository";
import {Dialog} from "../../../model/dialog";
import {User} from "../../../model/user";
import {AccountManager} from "../auth/account-manager";

@Injectable()
export class UserRepository implements ListRepository<string, Dialog> {
      private readonly account: User;

      constructor(
              private readonly httpClient: HttpClient,
              private readonly accountManager: AccountManager,
              private readonly dialogRepository: DialogRepository) {
            this.account = this.accountManager.user;
      }

      list(name: string): Observable<Dialog[]> {
            const params = new HttpParams().set('query', name);
            return this.httpClient.get<User[]>(environment.API_URL + "/users", {
                  observe: 'body',
                  params: params,
            }).pipe(map(users => {
                  return users.map((user) => this.dialogRepository.get(Conversation.fromPartner(this.account, User.from(user))))
            }))
      }
}