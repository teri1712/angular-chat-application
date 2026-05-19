import {Component, computed, inject, signal} from '@angular/core';
import {MatDialogModule, MatDialogRef} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatChipsModule} from '@angular/material/chips';
import {MatButtonModule} from '@angular/material/button';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {FormsModule} from '@angular/forms';
import {catchError, of} from 'rxjs';
import {debounceTime, distinctUntilChanged} from 'rxjs/operators';
import {User} from '../../model/dto/user';
import {UserRepository} from '../../service/repository/user-repository';
import GroupService from '../../service/group-service';
import ProfileService from "../../service/profile-service";
import {rxResource, toObservable, toSignal} from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-create-group-dialog',
    standalone: true,
    imports: [
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
export class CreateGroupDialogComponent {
    private userRepository = inject(UserRepository);
    private groupService = inject(GroupService);
    private profileService = inject(ProfileService);
    public dialogRef = inject(MatDialogRef<CreateGroupDialogComponent>);

    protected searchQuery = signal('');
    protected groupName = signal('');
    protected selectedUsers = signal<User[]>([]);
    protected isCreating = signal(false);
    protected errorMessage = signal('');

    private debouncedSearchQuery = toSignal(
        toObservable(this.searchQuery).pipe(
            debounceTime(300),
            distinctUntilChanged()
        ),
        { initialValue: '' }
    );

    protected recommendationsResource = rxResource({
        params: () => this.debouncedSearchQuery(),
        stream: ({params: query}) => {
            if (!query?.trim()) return of([]);
            return this.userRepository.list(query).pipe(
                catchError(() => of([]))
            );
        }
    });

    protected recommendations = computed(() => {
        const users = this.recommendationsResource.value() ?? [];
        return users.filter(
            u => !this.selectedUsers().some(s => s.id === u.id) &&
                !this.profileService.thatsMe(u)
        );
    });

    protected isLoading = computed(() => this.recommendationsResource.isLoading());

    protected canCreate = computed(() =>
        this.groupName().trim().length > 0 &&
        this.selectedUsers().length >= 1 &&
        !this.isCreating()
    );

    selectUser(user: User): void {
        this.selectedUsers.update(users => {
            if (!users.some(u => u.id === user.id)) {
                return [...users, user];
            }
            return users;
        });
        this.searchQuery.set('');
    }

    removeUser(user: User): void {
        this.selectedUsers.update(users => users.filter(u => u.id !== user.id));
    }

    createGroup(): void {
        if (!this.canCreate()) return;
        this.isCreating.set(true);
        this.errorMessage.set('');

        this.groupService.create({
            name: this.groupName().trim(),
            members: this.selectedUsers().map(u => u.id)
        }).subscribe({
            next: () => {
                this.dialogRef.close(true);
            },
            error: () => {
                this.errorMessage.set('Failed to create group. Please try again.');
                this.isCreating.set(false);
            }
        });
    }
}


