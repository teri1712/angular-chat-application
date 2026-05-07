describe('Signup', () => {
    beforeEach(() => {
        cy.visit('/login')
        cy.contains('Don\'t have an account?').click()
        cy.url().should('include', '/sign-up')
    })
    it('should direct to sign up page and display info form', () => {
        cy.contains('Enter your username').should('be.visible');
    });
    it('should display fast feedback error on username when trying to nav to avatar', () => {
        cy.get('[placeholder="Username"]').type('adm')
        cy.get('button').contains('Next').click()
        cy.contains('Username must have at least 4 characters').should('be.visible');
    });
    it('should be able to nav to avatar form when finishing info form', () => {
        // 1. Fill Username
        cy.get('input[formControlName="username"]')
            .type('john_doe');

        // 2. Fill Password
        cy.get('input[formControlName="password"]')
            .type('Secret123!');

        // 3. Fill Fullname
        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        // 4. Fill Date of Birth (DOB)
        // For Material Datepicker, typing directly is often more reliable than clicking the UI picker
        cy.get('input[formControlName="dob"]')
            .type('01/01/1995');

        // 5. Select Gender
        // mat-select requires a click to open the overlay, then a click on the option
        cy.get('mat-select[formControlName="gender"]').click();

        // Angular Material renders options in a global overlay, not inside the form
        cy.get('mat-option').contains('Male').click();

        // 6. Submit the form
        // The button is disabled until the form is valid, so we assert it's enabled first
        cy.get('button[type="submit"]').click();

        cy.contains('SETTING AVATAR').should('be.visible');
    });

    it('should be able to submit sign up form', () => {
        cy.fixture('signup-success').then(data => {
            cy.intercept('POST', '**/users', {statusCode: 200, body: data});
        })
        cy.interceptUpload()
        cy.intercept('PATCH', '/profiles/me', {
            statusCode: 200, body: {}
        })
        cy.fixture('login-success').then(data => {
            cy.intercept('POST', '**/login', {statusCode: 200, body: data});
        })
        // 1. Fill Username
        cy.get('input[formControlName="username"]')
            .type('john_doe');

        // 2. Fill Password
        cy.get('input[formControlName="password"]')
            .type('Secret123!');

        // 3. Fill Fullname
        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        // 4. Fill Date of Birth (DOB)
        // For Material Datepicker, typing directly is often more reliable than clicking the UI picker
        cy.get('input[formControlName="dob"]')
            .type('01/01/1995');

        // 5. Select Gender
        // mat-select requires a click to open the overlay, then a click on the option
        cy.get('mat-select[formControlName="gender"]').click();

        // Angular Material renders options in a global overlay, not inside the form
        cy.get('mat-option').contains('Male').click();

        // 6. Submit the form
        // The button is disabled until the form is valid, so we assert it's enabled first
        cy.get('button[type="submit"]').click();
        cy.get('input[type="file"]').selectFile('cypress/fixtures/signup-success.json');

        cy.get('button[type="submit"]').click();
    });
})
