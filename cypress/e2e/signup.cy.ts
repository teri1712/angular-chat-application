describe('Signup', () => {
    beforeEach(() => {
        cy.visitLogin()
        cy.contains('Don\'t have an account?').click()
        cy.url().should('include', '/sign-up')
    })
    it('should direct to sign up page and display info form', () => {
        cy.contains('Enter your username').should('be.visible');
    });
    it('should display fast feedback error on username when trying to nav to avatar', () => {
        cy.get('[placeholder="Username"]').type('adm')
        cy.contains('Next').click({force: true})
        cy.contains('Username must have at least 4 characters').should('be.visible');
    });
    it('should be able to nav to avatar form when finishing info form', () => {
        cy.get('input[formControlName="username"]')
            .type('john_doe');

        cy.get('input[formControlName="password"]')
            .type('Secret123!');
        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        cy.get('mat-select[formControlName="gender"]').click();

        cy.get('mat-option').contains('Male').click();

        cy.contains('Next').click();

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
        cy.get('input[formControlName="username"]')
            .type('john_doe');
        cy.get('input[formControlName="password"]')
            .type('Secret123!');

        cy.get('input[formControlName="fullname"]')
            .type('John Fitzgerald Doe');

        cy.get('mat-select[formControlName="gender"]').click();

        cy.get('mat-option').contains('Male').click();

        cy.contains('Next').click();
        cy.get('input[type="file"]').selectFile('cypress/fixtures/signup-success.json', {force: true});

        cy.get('button[type="submit"]').click();
    });
})
