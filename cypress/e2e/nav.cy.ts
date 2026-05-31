describe('Navigation flows', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
    })
    describe('Logout', () => {
        it('should be able to logout when user click logout on profile popup', () => {
            cy.intercept('POST', '**/logout', {statusCode: 200, body: {}})
            cy.get('.profile-btn').click()
            cy.contains('Logout').click()

            cy.url().should('include', '/login')
        });
        it('should display logout snackbar when token is expired', () => {
            cy.intercept('POST', '**/logout', {statusCode: 200, body: {}})
            cy.intercept('POST', '**/refresh**', {statusCode: 401, body: {}})
            cy.intercept("GET", "**/conversations*", {statusCode: 401, body: {}})

            cy.contains('Account Session has expired').should('be.visible')
            cy.contains('Logout').click()

            cy.url().should('include', '/login')
        });
    })
})