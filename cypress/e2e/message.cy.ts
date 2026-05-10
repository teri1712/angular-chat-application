describe('Message', () => {
    it('should display room name and avatar when navigating to a chat', () => {
        cy.visitConversation('123', 'hello', 'world')
        cy.fixture('get-chat-success.json').then(data => {
            cy.intercept('GET', '**/chats/*', {statusCode: 200, body: data})
        })
        cy.contains('Going Merry').should('be.visible');
        cy.get('img[src="https://i.pravatar.cc/300?img=12"]').should('be.visible');
    });
    it('should download and display loading spinner and messages when nav to message list of a chat', () => {
        cy.visitConversation('123', 'hello', 'world')
        cy.fixture('get-message-list-success.json').then(data => {
            cy.intercept('GET', '**/chat/*/messages', {statusCode: 200, body: data, delay: 3000})
        })
        cy.get('app-message-list').find('mat-spinner').should('be.visible');
        cy.contains('Hey everyone!').should('be.visible');
        cy.get('app-message').should('have.length', 20);
    });
    it('should loading more message when scroll hit start', () => {
        cy.visitConversation('123', 'hello', 'world')
        cy.fixture('get-message-list-success.json').then(data => {
            cy.intercept('GET', '**/chat/*/messages', {statusCode: 200, body: data, delay: 3000})
        })
        cy.get('mat-spinner').should('be.visible');
        cy.get('app-message').should('have.length', 20);

        cy.get('.message-list').scrollTo('top')
        cy.get('mat-spinner').should('be.visible');
        cy.get('app-message').should('have.length', 40);
    })
})