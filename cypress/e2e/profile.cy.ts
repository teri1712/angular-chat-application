describe('Profile', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
        cy.visit('/home')
        cy.get('[aria-label="Settings"]').click()
        cy.get('[aria-label="Change Profile"]').click()
    })
    describe('Change profile', () => {

        it('should show validation errors for empty profile form', () => {
            cy.get('[formControlName="name"]').clear();
            cy.contains('Save Profile').click({force: true});
            cy.contains('Name is required').should('be.visible');
        });

        it('should update profile successfully', () => {
            cy.intercept('PATCH', '**/profiles/me', {
                statusCode: 200,
                body: {success: true}
            }).as('updateProfile');

            cy.get('[formControlName="name"]').clear();
            cy.get('[formControlName="name"]').type('John Doe');
            cy.get('[formControlName="gender"]').scrollIntoView();
            cy.get('[formControlName="gender"]').click({force: true});
            cy.contains('Male').click();

            cy.contains('Save Profile').click({force: true});

            cy.wait('@updateProfile');

            // assert success UI (toast/snackbar or similar)
            cy.contains('Profile updated successfully').should('be.visible');
        });

    })
    describe('Change password', () => {

        it('should show password validation errors', () => {
            cy.contains('Update Password').click({force: true});

            cy.contains('Current password is required').should('be.visible');
            cy.contains('New password is required').should('be.visible');
            cy.contains('Please confirm').should('be.visible');
        });

        it('should detect password mismatch', () => {
            cy.get('[formControlName="oldPassword"]').type('123456', {force: true});
            cy.get('[formControlName="newPassword"]').type('abcdef', {force: true});
            cy.get('[formControlName="confirmPassword"]').type('different', {force: true});

            cy.contains('Update Password').click({force: true});

            cy.contains('Passwords do not match').should('be.visible');
        });

        it('should update password successfully', () => {
            cy.intercept('POST', '**/profiles/me/password', {
                statusCode: 200,
                body: {success: true}
            }).as('changePassword');
            cy.intercept('POST', '**/login', {fixture: 'login-success'});

            cy.get('[formControlName="oldPassword"]').type('123456', {force: true});
            cy.get('[formControlName="newPassword"]').type('abcdef', {force: true});
            cy.get('[formControlName="confirmPassword"]').type('abcdef', {force: true});

            cy.contains('Update Password').click();

            cy.wait('@changePassword');

            cy.contains('Password changed successfully').should('be.visible');
        });
    })
    describe('Change avatar', () => {
        it('should display success message when user select an image', () => {
            cy.interceptUpload()
            cy.intercept('PATCH', '**/profiles/me', {
                statusCode: 200, body: {}
            }).as('updateAvatar')
            cy.get('input[type="file"]').selectFile('cypress/fixtures/loki.jpg', {force: true});
            cy.wait('@updateAvatar');
            cy.contains('Avatar updated successfully').should('be.visible');
        });
    })
})
