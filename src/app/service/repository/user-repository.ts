import {Injectable} from "@angular/core";
import {ListRepository} from "./repository";
import {map, Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {Conversation} from "../../model/dto/conversation";
import {DialogRepository} from "./dialog-repository";
import {IDialog} from "../../model/IDialog";
import {User} from "../../model/dto/user";
import ProfileService from "../profile-service";

@Injectable()
export class UserRepository implements ListRepository<string, IDialog> {
      private readonly me: User;

      constructor(
              private readonly httpClient: HttpClient,
              private readonly profileService: ProfileService,
              private readonly dialogRepository: DialogRepository) {
            this.me = this.profileService.getProfile();
      }

      list(name: string): Observable<IDialog[]> {
            const params = new HttpParams().set('query', name);
            return this.httpClient.get<User[]>(environment.API_URL + "/users", {
                  observe: 'body',
                  params: params,
            }).pipe(map(users => {
                  return users.map((user) => this.dialogRepository.find(Conversation.fromPartner(this.me, user)))
            }))
      }
}