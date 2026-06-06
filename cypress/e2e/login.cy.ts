describe('Login', () => {
    beforeEach(() => {
        cy.visitLogin();
    });

    it('should display early feedback error when username less than 4 chars', () => {
        cy.get('[placeholder="Enter username"]').click().type('adm')
        cy.get('[placeholder="Enter password"]').type('password12345', {force: true})
        cy.get('button[type="submit"]').click()
        cy.contains('Username must have at least 4 characters').should('be.visible');
    })

    it('should display username exists error when the server return such error', () => {
        cy.intercept('POST', '**/login', {statusCode: 400, body: {detail: 'Username already exists'}});
        cy.get('[placeholder="Enter username"]').type('admin12345')
        cy.get('[formControlName="password"]').type('password12345', {force: true})
        cy.get('button[type="submit"]').click()
        cy.contains('Username already exists').should('be.visible');
    })

    it('should display progress indicator when user click sign in', () => {
        cy.fixture('login-success').then(data => {
            cy.intercept('POST', '**/login', {
                statusCode: 200, body: data,
                delay: 2000
            });
        })
        cy.contains('Username').should('be.visible');
        cy.contains('Password').should('be.visible');
        cy.get('[placeholder="Enter username"]').type('admin12345')
        cy.get('[formControlName="password"]').type('password12345', {force: true})
        cy.get('button[type="submit"]').click()
        cy.get('.spinner').should('be.visible');
    })

    it('should be taken to the home after login successfully', () => {
        cy.fixture('login-success').then(data => {
            cy.intercept('POST', '**/login', {statusCode: 200, body: data});
        })
        cy.get('[placeholder="Enter username"]').type('admin12345')
        cy.get('[formControlName="password"]').type('password12345', {force: true})
        cy.get('button[type="submit"]').click()
        cy.url().should('include', '/home');
    })

    it('should be taken to the home after granting consent from google', () => {

        cy.fixture('login-success').then(data => {
            cy.intercept('POST', '**/tokens/oauth2', {statusCode: 200, body: data});
        })

        cy.get('#google-signin-btn').click()
        cy.url().should('include', '/home');

        cy.contains('Messages').should('be.visible');
    })
})
