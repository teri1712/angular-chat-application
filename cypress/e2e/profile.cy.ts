describe('Profile', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
        cy.visit('/home')
        cy.get('[aria-label="Settings"]').click()
        cy.get('[aria-label="Change Profile"]').click()
    })
    describe('Change profile', () => {

        it('should show validation errors for empty profile form', () => {
            cy.contains('Save Profile').click();
            cy.contains('Name is required').should('be.visible');
        });

        it('should update profile successfully', () => {
            cy.intercept('PATCH', '**/profiles/me', {
                statusCode: 200,
                body: {success: true}
            }).as('updateProfile');

            cy.get('[formControlName="name"]').clear().type('John Doe');
            cy.get('[formControlName="gender"]').click();
            cy.contains('Male').click();

            cy.contains('Save Profile').click();

            cy.wait('@updateProfile');

            // assert success UI (toast/snackbar or similar)
            cy.contains('Profile updated successfully').should('be.visible');
        });

    })
    describe('Change password', () => {

        it('should show password validation errors', () => {
            cy.contains('Update Password').click();

            cy.contains('Current password is required').should('be.visible');
            cy.contains('New password is required').should('be.visible');
            cy.contains('Please confirm').should('be.visible');
        });

        it('should detect password mismatch', () => {
            cy.get('[formControlName="oldPassword"]').type('123456');
            cy.get('[formControlName="newPassword"]').type('abcdef');
            cy.get('[formControlName="confirmPassword"]').type('different');

            cy.contains('Update Password').click();

            cy.contains('Passwords do not match').should('be.visible');
        });

        it('should update password successfully', () => {
            cy.intercept('POST', '**/profiles/me/password', {
                statusCode: 200,
                body: {success: true}
            }).as('changePassword');

            cy.get('[formControlName="oldPassword"]').type('123456');
            cy.get('[formControlName="newPassword"]').type('abcdef');
            cy.get('[formControlName="confirmPassword"]').type('abcdef');

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
            })
            cy.contains('Change Avatar').selectFile('cypress/fixtures/loki.jpg');
            cy.contains('Avatar updated successfully').should('be.visible');
        });
    })
})
