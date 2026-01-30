import {Observable} from "rxjs";

export default interface Expander<T> {
      expand(): Observable<T[]>;

      isEnd(): boolean;
}