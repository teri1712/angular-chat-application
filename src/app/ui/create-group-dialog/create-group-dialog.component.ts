import {Component, OnDestroy, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';
import {catchError, of, Subject, Subscription} from 'rxjs';
import {debounceTime, distinctUntilChanged, switchMap, tap} from 'rxjs/operators';
import {User} from '../../model/dto/user';
import {UserRepository} from '../../service/repository/user-repository';
import GroupService from '../../service/group-service';
import ProfileService from "../../service/profile-service";

@Component({
    selector: 'app-create-group-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
        MatListModule,
        MatChipsModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        FormsModule,
    ],
    templateUrl: './create-group-dialog.component.html',
    styleUrl: './create-group-dialog.component.css'
})
export class CreateGroupDialogComponent implements OnInit, OnDestroy {

    protected searchQuery: string = '';
    protected groupName: string = '';
    protected recommendations: User[] = [];
    protected selectedUsers: User[] = [];
    protected isLoading: boolean = false;
    protected isCreating: boolean = false;
    protected errorMessage: string = '';

    private searchSubject = new Subject<string>();
    private searchSubscription?: Subscription;

    constructor(
        private userRepository: UserRepository,
        private groupService: GroupService,
        private profileService: ProfileService,
        public dialogRef: MatDialogRef<CreateGroupDialogComponent>
    ) {
    }

    ngOnInit(): void {
        this.searchSubscription = this.searchSubject.pipe(
            tap(() => {
                this.isLoading = true;
                this.recommendations = [];
            }),
            debounceTime(300),
            distinctUntilChanged(),
            switchMap(query => {
                if (!query.trim()) {
                    this.isLoading = false;
                    return of([]);
                }
                return this.userRepository.list(query).pipe(
                    catchError(() => of([]))
                );
            })
        ).subscribe({
            next: (users) => {
                this.recommendations = users.filter(
                    u => !this.selectedUsers.some(s => s.id === u.id) &&
                        !this.profileService.thatsMe(u)
                );
                this.isLoading = false;
            }
        });
    }

    ngOnDestroy(): void {
        this.searchSubscription?.unsubscribe();
    }

    onSearchChange(query: string): void {
        this.searchSubject.next(query);
    }

    selectUser(user: User): void {
        if (!this.selectedUsers.some(u => u.id === user.id)) {
            this.selectedUsers = [...this.selectedUsers, user];
        }
        this.recommendations = this.recommendations.filter(u => u.id !== user.id);
        this.searchQuery = '';
        this.searchSubject.next('');
    }

    removeUser(user: User): void {
        this.selectedUsers = this.selectedUsers.filter(u => u.id !== user.id);
    }

    get canCreate(): boolean {
        return this.groupName.trim().length > 0 && this.selectedUsers.length >= 1 && !this.isCreating;
    }

    createGroup(): void {
        if (!this.canCreate) return;
        this.isCreating = true;
        this.errorMessage = '';

        this.groupService.create({
            name: this.groupName.trim(),
            members: this.selectedUsers.map(u => u.id)
        }).subscribe({
            next: () => {
                this.dialogRef.close(true);
            },
            error: () => {
                this.errorMessage = 'Failed to create group. Please try again.';
                this.isCreating = false;
            }
        });
    }
}

