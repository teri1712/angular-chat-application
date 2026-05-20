import {StompMock} from "../support/stomp-mock";

describe('WebSocket Log Events', () => {
    beforeEach(() => {
        // 1. Initialize the mock and intercept conversations
        cy.mockStomp('ws://localhost:8080/handshake').as('stomp');
        cy.intercept('GET', '**/conversations*', {
            fixture: 'get-conversations-success.json',
            delay: 2000
        }).as('getConversations');

        // 2. Login to the app (which also visits '/')
        cy.login('admin', 'admin');
        cy.wait('@getConversations');
    });

    describe('conversation react to log events', () => {
        it('should bubble conversation to the top when inbox log addition is emitted', () => {
            // Initial state: Alice is 1st (index 0), Bob is 2nd (index 1)
            cy.get('app-conversation').eq(0).should('contain', 'Alice Wonderland');
            cy.get('app-conversation').eq(1).should('contain', 'Bob Builder');

            // Emit ADDITION for Bob
            cy.wait(500);
            cy.fixture('stomp-bubble-bob').then((log) => {
                cy.get<StompMock>('@stomp').then((stomp) => {
                    stomp.emitInboxLog(log);
                });
            });

            // Assert: Bob should now be 1st, Alice 2nd
            cy.get('app-conversation').eq(0).should('contain', 'Bob Builder');
            cy.get('app-conversation').eq(1).should('contain', 'Alice Wonderland');
            cy.get('app-conversation').eq(0).should('contain', 'Bob, are you there?');
        });

        it('should update seenBy list and maintain order when inbox log update is emitted', () => {
            // Initial state: Alice is 1st, Bob is 2nd (assuming fresh load or same order)
            // Alice's message is "Hello Alice!" and it's from "Me" (so seenBy is displayed)
            cy.get('app-conversation').eq(0).should('contain', 'Alice Wonderland');

            // Verify Alice's seenBy is empty initially
            cy.get('app-conversation').eq(0).find('.seen-div img').should('not.exist');

            // Emit UPDATE for Alice with new seenBy
            cy.wait(500);
            cy.fixture('stomp-update-seen-alice').then((log) => {
                cy.get<StompMock>('@stomp').then((stomp) => {
                    stomp.emitInboxLog(log);
                });
            });

            // Assert: Order remains the same (Alice still 1st)
            cy.get('app-conversation').eq(0).should('contain', 'Alice Wonderland');

            // Assert: seenBy list updated correctly
            // Referencing [alt]="'Avatar of ' + seen.name"
            cy.get('app-conversation').eq(0)
                .find('.seen-div img')
                .should('have.attr', 'alt', 'Avatar of Alice Wonderland')
                .should('have.attr', 'src', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice');
        });
    });

    describe('message list react to log events', () => {
        beforeEach(() => {
            cy.fixture('get-chat-success').then(data => {
                cy.intercept('GET', '**/chats/*', {statusCode: 200, body: data}).as('chat-detail')
            })
            cy.fixture('get-message-list-success-lite').then(data => {
                cy.intercept('GET', '**/chats/*/messages?anchorSequenceNumber=' + (Number.MAX_SAFE_INTEGER - 1), {
                    statusCode: 200,
                    body: data,
                    delay: 1500
                }).as('messages-request')
            })
            cy.visitConversation('chat-001', 'Going Merry', 'https://i.pravatar.cc/300?img=12')
            cy.wait(['@chat-detail', '@messages-request'])
        })

        it('should prepend message to the list when inbox log addition is emitted', () => {
            // Initial state: Chopper is 1st (Msg 1, oldest), Stay calm and work together is last (Msg 10, newest)
            cy.get('app-message').last().should('contain', 'Hey everyone!');
            cy.get('app-message').first().should('contain', 'Stay calm and work together');

            // Emit ADDITION via fixture
            cy.fixture('stomp-add-message-chat1').then((log) => {
                cy.get<StompMock>('@stomp').then((stomp) => {
                    stomp.emitInboxLog(log);
                });
            });

            // Assert: New message should be at the bottom (newest)
            cy.get('app-message').last().should('contain', 'Where is the meat?!');
        });

        it('should update seenBy list for target message when update is emitted and maintain order', () => {
            // Initial state: Chopper is 1st, Stay calm and work together is last
            cy.get('app-message').first().find('.seen-div img').should('not.exist');

            // Emit UPDATE via fixture (seenBy Luffy for the first message)
            cy.fixture('stomp-update-seen-msg1').then((log) => {
                cy.get<StompMock>('@stomp').then((stomp) => {
                    stomp.emitInboxLog(log);
                });
            });

            // Assert: seenBy updated
            cy.get('app-message').first()
                .find('.seen-div img')
                .should('have.attr', 'alt', 'Avatar of Monkey D. Luffy')
                .should('have.attr', 'src', 'https://i.pravatar.cc/150?img=2');

            // Assert: Order remains the same
            cy.get('app-message').last().should('contain', 'Hey everyone!');
            cy.get('app-message').first().should('contain', 'Vcl!');
        });
    });
});
