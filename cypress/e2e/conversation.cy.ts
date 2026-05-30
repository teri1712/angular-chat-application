describe('Conversation', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
    })
    it('should display conversation list when user alr logged in', () => {
        cy.intercept('GET', '**/conversations*',
            {fixture: 'get-conversations-success.json', delay: 2000}).as('getConversations');
        cy.login();

        cy.wait('@getConversations');
        cy.get('app-conversation').should('have.length', 2);
        cy.get('app-conversation')
            .eq(0)
            .should('contain', 'Alice Wonderland')
            .should('contain', 'Hello Alice!');
        cy.get('app-conversation')
            .eq(1)
            .should('contain', 'Bob Builder')
            .should('contain', 'Hello Bob!');
    });
    it('should be able to navigate to message list of the converastion when clicking onto the converastion', () => {
        const roomName = 'Alice Wonderland';
        const roomAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice';

        cy.intercept('GET', '**/conversations*',
            {fixture: 'get-conversations-success.json', delay: 2000}).as('getConversations');
        cy.login();
        cy.wait('@getConversations');
        cy.get('app-conversation').eq(0).click();
        cy.get('app-chat-info-bar').should('contain', roomName)
        cy.get('app-chat-info-bar')
            .find(`img[src="${roomAvatar}"]`)
            .should('be.visible');

        // The browser encodes spaces as %20 and special characters in query params.
        // Based on the failure log, roomName is "Alice%20Wonderland"
        // and roomAvatar contains "https:%2F%2Fapi.dicebear.com%2F7.x%2Favataaars%2Fsvg%3Fseed%3DAlice"
        cy.url().should('include', 'Alice%20Wonderland');
        cy.url().should('include', 'https:%2F%2Fapi.dicebear.com%2F7.x%2Favataaars%2Fsvg%3Fseed%3DAlice');
    });
    describe('Groups', () => {
        beforeEach(() => {
            // Ensure we are on /home and the page is loaded before clicking
            cy.url().should('include', '/home');
            cy.get('[aria-label="Create Group"]', {timeout: 10000})
                .should('be.visible')
                .click();
            
            // Wait for dialog to appear
            cy.contains('Create Group').should('be.visible');

            cy.intercept('GET', '**/people**',
                {fixture: 'get-people-success.json', delay: 2000})
                .as('people')
        })
        it('should be able open group dialog when click create group button', () => {
            cy.contains('Create Group').should('be.visible');
        });
        it('should be able to find other people to add to group', () => {
            cy.get('[placeholder="Search by name..."]')
                .should('be.visible')
                .click()
                .type('Meo meo', {delay: 50});
            
            cy.wait('@people');
            cy.contains('Thái Minh Trí').should('be.visible');
            cy.contains('NAB Colleague').should('be.visible');
        });
        it('should should be able to add suggested user as partner', () => {
            cy.get('[placeholder="Search by name..."]')
                .should('be.visible')
                .click()
                .type('Meo meo', {delay: 50});
            
            cy.wait('@people');
            cy.contains('Thái Minh Trí').should('be.visible').click();
            
            cy.get('.selected-members')
                .contains('Thái Minh Trí')
                .should('be.visible');
        });
        it('should be able to create group when group name is non empty and selected partner >= 1', () => {
            cy.intercept('POST', '**/groups', {statusCode: 200, body: {}})
                .as('create-group');

            cy.get('[placeholder="Enter group name"]')
                .should('be.visible')
                .click()
                .type('Test Group', {delay: 50});

            cy.get('[placeholder="Search by name..."]')
                .should('be.visible')
                .click()
                .type('Meo meo', {delay: 50});
            
            cy.wait('@people');
            
            cy.contains('Thái Minh Trí').should('be.visible').click();
            cy.contains('NAB Colleague').should('be.visible').click();

            cy.contains(/^Create$/).should('not.be.disabled').click();
            cy.wait('@create-group');
        });
    })
})