import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>('Dashboard');
  title$ = this.titleSubject.asObservable();

  private searchSubject = new BehaviorSubject<boolean>(false);
  search$ = this.searchSubject.asObservable();

  setTitle(title: string) {
    this.titleSubject.next(title);
  }

  setSearch(show: boolean) {
    this.searchSubject.next(show);
  }
}
