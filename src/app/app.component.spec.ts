import {TestBed} from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BehaviorSubject} from 'rxjs';
import {AppComponent} from './app.component';
import {AccountService} from './usecases/service/auth/account.service';

describe('AppComponent', () => {
      let accountSubject: BehaviorSubject<any>;

      beforeEach(async () => {
            accountSubject = new BehaviorSubject<any>(null);
            await TestBed.configureTestingModule({
                  imports: [
                        RouterTestingModule
                  ],
                  declarations: [
                        AppComponent
                  ],
                  providers: [
                        {
                              provide: AccountService,
                              useValue: {
                                    accountObservable: accountSubject
                              }
                        }
                  ]
            }).compileComponents();
      });

      it('should create the app', () => {
            const fixture = TestBed.createComponent(AppComponent);
            const app = fixture.componentInstance;
            expect(app).toBeTruthy();
      });

      it('should mark ready after account observable emits', () => {
            const fixture = TestBed.createComponent(AppComponent);
            const app = fixture.componentInstance;
            fixture.detectChanges();
            expect(app.ready).toBeTrue();
      });
});
