import {ListRepository} from "./repository";
import {Injectable} from "@angular/core";
import {HttpClient, HttpParams} from "@angular/common/http";
import {environment} from "../../environments";
import {map, Observable, of, switchMap} from "rxjs";
import {Conversation} from "../../model/dto/Conversation";
import CacheService from "../cache/data/cache-service";
import {MessageState} from "../../model/dto/message-state";

@Injectable()
export class ConversationRepository implements ListRepository<Number, Conversation> {

    constructor(private readonly httpClient: HttpClient, private readonly cacheService: CacheService) {
    }

    list(revisionNumber?: number): Observable<Conversation[]> {
        let params = new HttpParams();
        if (revisionNumber) {
            params = params.set("anchorRevisionNumber", revisionNumber);
        }
        return this.httpClient.get<Conversation[]>(environment.API_URL + "/conversations", {
            observe: 'body',
            params: params,
        }).pipe(map(conversations => this.truncateFirstOne(conversations))
            , switchMap(conversations => this.resolveStaleness(conversations)));
    }

    private truncateFirstOne(conversations: Conversation[], revisionNumber?: number): Conversation[] {
        if (conversations.length != 0 && revisionNumber === conversations[0].revisionNumber)
            return conversations.slice(1)

        return conversations;
    }

    private resolveStaleness(conversations: Conversation[], index = 0): Observable<Conversation[]> {
        if (index == conversations.length)
            return of(conversations)
        const conversation = conversations[index];

        let stale = false;
        for (let message in conversation.recents) {
            if (message == null) {
                stale = true;
                break;
            }
        }
        if (stale) {
            const chatId = conversation.identifier
            const newest = conversation.recents[0];
            const params = new HttpParams()
                .set("anchorSequenceNumber",
                    newest?.sequenceNumber ?? Number.MAX_SAFE_INTEGER);
            return this.httpClient.get<MessageState[]>(environment.API_URL + `/chats/${encodeURIComponent(chatId)}/messages`, {
                observe: 'body',
                params: params,
            })
                .pipe(switchMap(recents => {
                    conversations[index] = {
                        ...conversation,
                        recents: recents
                    }

                    return this.resolveStaleness(conversations, index)
                }))
        }
        return this.resolveStaleness(conversations, index + 1);

    }
}