import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../environments";


export interface GroupRequest {
      name: string;
      members: string[];
}

@Injectable()
export default class GroupService {

      constructor(private httpClient: HttpClient) {
      }


      create(request: GroupRequest) {

            let params = new HttpParams()
                    .set('roomName', request.name);
            request.members.forEach(member => {
                  params = params.append("partnerId", member)
            })
            return this.httpClient.post(environment.API_URL + "/groups", params.toString(), {
                  headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                  }
            });
      }

}