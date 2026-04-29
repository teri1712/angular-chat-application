describe('Search', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
    })

    describe('Searching User', () => {

        it('should be able to display result panel and display spinner when user typing words on search bar', () => {
            cy.intercept('GET', '**/people**',
                {fixture: 'get-people-success.json', delay: 2000})
                .as('people')

            cy.get('[placeholder = "Search someone"]').type("luffy")
            cy.url().should('include', 'search')
            cy.get('.user-search-loading').should('be.visible')
        })
        it('should display result list when user typed words on search bar', () => {
            cy.intercept('GET', '**/people**',
                {fixture: 'get-people-success.json'})
                .as('people')
            cy.get('[placeholder = "Search someone"]').type("luffy")
            cy.get('app-search-user').should('have.length', 3)
            cy.contains('Java Spring Enthusiast').should('be.visible')
        });
    })
    describe('Searching Message', () => {
        beforeEach(() => {
            cy.url().should('include', 'home')
            cy.visitConversation('123456789')
            cy.get('.search-message').click()
        })
        it('should be able to display search dialog when user click search button', () => {
            cy.contains('Search Messages').should('be.visible')
        });
        it('should be able to display result panel and display spinner when user typing words on search bar', () => {
            cy.intercept('GET', '**/chat-histories/**',
                {statusCode: 200, body: [], delay: 2000})
                .as('chat-histories')
            cy.get('[placeholder="Type to search..."]').type("vclcvlcvlcv")
            cy.get('mat-progress-spinner.search-dialog-loading').should('be.visible')
        })
        it('should display no message matched when the return list is mt', () => {
            cy.intercept('GET', '**/chat-histories/**',
                () => {
                    return {statusCode: 200, body: []}
                })
            cy.get('[placeholder="Type to search..."]').type('vclcvlcvlcl')
            cy.contains('No messages found matching').should('be.visible')
        });
        it('should display messages in result panel', () => {
            cy.intercept('GET', '**/chat-histories/**',
                {fixture: 'get-chat-history-success.json'})
            cy.get('[placeholder="Type to search..."]').type('vclcvlcvlcl')
            cy.get('app-search-result-item').should('have.length', 3)
            cy.contains('Check the LaTeX template on Overleaf for the final documentation.').should('be.visible')
        });
    })
})
