describe('Signup', () => {
    beforeEach(() => {
        cy.visitLogin()
        cy.contains('Don\'t have an account?').click()
        cy.url().should('include', '/sign-up')
    })
    it('should direct to sign up page and display info form', () => {
        cy.contains('Username').should('be.visible');
    });
    it('should display fast feedback error on username when trying to nav to avatar', () => {
        cy.get('[placeholder="Enter username"]').type('adm')
        cy.contains('Continue').click({force: true})
        cy.contains('Username must have at least 4 characters').should('be.visible');
    });
    it('should be able to nav to avatar form when finishing info form', () => {
        cy.get('input[formControlName="username"]')
            .type('john_doe');

        cy.get('input[formControlName="password"]')
            .type('Secret123!');
        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        cy.get('input[formControlName="dob"]')
            .type('1990-01-01');

        cy.get('select[formControlName="gender"]').select('Male');

        cy.contains('Continue').click();

        cy.contains('set avatar').should('be.visible');
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
        cy.get('input[formControlName="username"]')
            .type('john_doe');
        cy.get('input[formControlName="password"]')
            .type('Secret123!');

        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        cy.get('input[formControlName="dob"]')
            .type('1990-01-01');

        cy.get('select[formControlName="gender"]').select('Male');

        cy.contains('Continue').click();
        cy.get('input[type="file"]').selectFile('cypress/fixtures/signup-success.json', {force: true});

        cy.get('button[type="submit"]').click();
    });

    it('should be able to navigate back from avatar form and preserve info', () => {
        cy.get('input[formControlName="username"]')
            .type('john_doe_back');

        cy.get('input[formControlName="password"]')
            .type('Secret123!');
        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        cy.get('input[formControlName="dob"]')
            .type('1990-01-01');

        cy.get('select[formControlName="gender"]').select('Male');

        cy.contains('Continue').click();

        cy.contains('set avatar').should('be.visible');

        // Click back button
        cy.contains('Back to Info').click();

        // Verify info is preserved
        cy.get('input[formControlName="username"]').should('have.value', 'john_doe_back');
        cy.get('input[formControlName="fullname"]').should('have.value', 'John Fitzgerald Doe');
        cy.get('input[formControlName="dob"]').should('have.value', '1990-01-01');
        cy.get('select[formControlName="gender"]').should('have.value', '1');
    });
})
