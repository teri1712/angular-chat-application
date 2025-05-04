import {Injectable} from "@angular/core";
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse} from "@angular/common/http";
import {delay, Observable, of} from "rxjs";
import {environment} from "../environments";

class MockResponseInterceptor implements HttpInterceptor {
      constructor(
              private readonly endpoint: string,
              private readonly responseBody: any) {
      }

      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            return of(new HttpResponse({
                  status: 200,
                  body: this.responseBody
            })).pipe(
                    delay(200)
            );

      }

      support(request: HttpRequest<any>): boolean {
            return request.url.endsWith(this.endpoint)
      }


}

const mocks: MockResponseInterceptor[] = [
      // new MockResponseInterceptor("/account", new AccountEntry(account))
]

@Injectable()
export class DevelopmentModeInterceptor implements HttpInterceptor {

      intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
            if (!environment.production) {
                  const headers = req.headers
                          .set('Cache-Control', 'no-cache, no-store, must-revalidate')
                          .set('Pragma', 'no-cache')
                          .set('Expires', '0')
            }
            if (!environment.testing) {
                  return next.handle(req);
            }
            for (let mock of mocks) {
                  if (mock.support(req)) {
                        return mock.intercept(req, next)
                  }
            }
            return next.handle(req);
      }

}