import {Observable} from "rxjs";

export interface ListRepository<Index, T> {
      list(index?: Index): Observable<T[]> | T[];
}

export interface GetRepository<Index, T> {
      get(index: Index): Observable<T> | T;
}

export interface Repository<Index, T>
        extends ListRepository<Index, T>,
                GetRepository<Index, T> {
}