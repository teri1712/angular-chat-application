describe('Message', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
    })
    it('should display room name and avatar when navigating to a chat', () => {
        cy.fixture('get-chat-success').then(data => {
            cy.intercept('GET', '**/chats/*', {statusCode: 200, body: data})
                .as('chat-detail')
        })
        cy.visitConversation('123', 'hello', 'world')
        cy.wait('@chat-detail')
        cy.contains('Going Merry').should('be.visible');
        cy.get('img[src="https://i.pravatar.cc/300?img=12"]').should('be.visible');
    });
    it('should download and display loading spinner and messages when nav to message list of a chat', () => {
        cy.fixture('get-message-list-success').then(data => {
            cy.intercept('GET', '**/chats/*/messages*', {statusCode: 200, body: data, delay: 3000})
                .as('messages-request')
        })
        cy.visitConversation('123', 'hello', 'world')
        cy.get('app-message-list').find('mat-spinner').should('be.visible');
        cy.wait('@messages-request')
        cy.contains('Hey everyone!').should('exist');
        cy.get('app-message').should('have.length', 10);
    });

    it('should display all types of polymorphic messages', () => {
        cy.fixture('polymorphic-messages').then(data => {
            cy.intercept('GET', '**/chats/*/messages*', {statusCode: 200, body: data})
        })
        cy.visitConversation('123', 'hello', 'world')

        // Text Message
        cy.contains('Hello world!').should('be.visible');

        // Image Message
        cy.get('app-image-message img').should('have.attr', 'src', 'https://example.com/image.png');

        // File Message
        cy.contains('document.pdf').should('be.visible');

        // Icon Message
        cy.get('app-icon-message').should('be.visible');

        // Preference Message
        cy.contains('has changed the chat preferences').should('exist');
    });
})