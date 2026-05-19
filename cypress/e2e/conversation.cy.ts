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
            cy.get('[aria-label="Create Group"]').click();
            cy.intercept('GET', '**/people**',
                {fixture: 'get-people-success.json', delay: 2000})
                .as('people')
        })
        it('should be able open group dialog when click create group button', () => {
            cy.get('Create Group').should('be.visible');
        });
        it('should be able to find other people to add to group', () => {
            cy.get('[placeholder="Search by name..."]').type('Meo meo');
            cy.contains('Thái Minh Trí').should('be.visible');
            cy.contains('NAB Colleague').should('be.visible');
            cy.wait('@people')
        });
        it('should should be able to add suggested user as partner', () => {
            cy.get('[placeholder="Search by name..."]').type('Meo meo');
            cy.contains('Thái Minh Trí').click()
            cy.get('.selected-members')
                .find('Thái Minh Trí')
                .should('be.visible');
        });
        it('should be able to create group when group name is non empty and selected partner >= 1', () => {
            cy.intercept('POST', '**/groups', {statusCode: 200, body: {}})
                .as('create-group');
            cy.get('[placeholder="Enter group name"]').type('Test Group');

            cy.get('[placeholder="Search by name..."]').type('Meo meo');
            cy.contains('Thái Minh Trí').click()
            cy.contains('NAB Colleague').click()

            cy.contains(/^Create$/).click()
            cy.wait('@create-group')
        });
    })
})