import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {environment} from "../environments";
import {from, map, Observable, switchMap} from "rxjs";

export type PresignedUpload = {
      presignedUploadUrl: string;
      downloadUrl: string;
};

export type DownloadUrl = {
      path: string;
};


@Injectable()
export class UploadService {
      constructor(private readonly httpClient: HttpClient) {
      }

      upload(filename: string, file: File): Observable<DownloadUrl> {
            const presignUrl = environment.API_URL + '/files/upload-urls?filename=' + encodeURIComponent(filename);
            return this.httpClient.post<PresignedUpload>(presignUrl, {observe: 'body'}).pipe(
                    switchMap((presigned: PresignedUpload) => {
                          return from(fetch(presigned.presignedUploadUrl, {
                                method: 'PUT',
                                body: file,
                                headers: {
                                      'Content-Type': 'application/octet-stream'
                                }
                          })).pipe(map(() => presigned.downloadUrl));
                    }),
                    map((downloadUrl: string) => {
                          return {
                                path: downloadUrl
                          }
                    })
            );
      }
}