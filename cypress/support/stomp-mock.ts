import {Server, WebSocket} from 'mock-socket';
import {InboxLog} from "../../src/app/model/dto/inbox-log";

declare global {
    namespace Cypress {
        interface Chainable {
            mockStomp(url: string): Chainable<StompMock>;
        }
    }
}

export interface StompMock {
    /**
     * Emits an InboxLog to the /user/queue destination.
     */
    emitInboxLog(log: InboxLog): void;

    /**
     * Emits a message to a /room/{chatId} destination.
     */
    emitRoomEvent(chatId: string, event: any): void;
}

let activeUrl: string | null = null;
let activeServer: Server | null = null;
const subscriptions = new Map<string, string>(); // destination -> subscriptionId

// Use a single listener to avoid accumulating listeners across tests
Cypress.on('window:before:load', (win) => {
    if (activeUrl) {
        // Stop any existing server before starting a new one for this window load
        if (activeServer) {
            activeServer.stop();
        }

        subscriptions.clear();
        activeServer = new Server(activeUrl);
        // @ts-ignore
        win.WebSocket = WebSocket;

        activeServer.on('connection', (socket) => {
            socket.on('message', (data) => {
                const frame = typeof data === 'string' ? data : '';

                // Handle STOMP CONNECT frame
                if (frame.includes('CONNECT')) {
                    socket.send('CONNECTED\nversion:1.1\nheart-beat:5000,5000\n\n\u0000');
                }

                // Handle SUBSCRIBE frame
                if (frame.includes('SUBSCRIBE')) {
                    const lines = frame.split('\n');
                    const destMatch = lines.find(l => l.startsWith('destination:'));
                    const idMatch = lines.find(l => l.startsWith('id:'));

                    if (destMatch && idMatch) {
                        const dest = destMatch.split(':')[1].trim();
                        const id = idMatch.split(':')[1].trim();
                        subscriptions.set(dest, id);
                        console.log(`[Mock STOMP] Subscribed to ${dest} with id ${id}`);
                    }
                }
            });
        });
    }
});

function sendStompMessage(destination: string, body: any) {
    const subId = subscriptions.get(destination) || 'sub-0';
    const payload = JSON.stringify(body);
    const frame = [
        'MESSAGE',
        `destination:${destination}`,
        `subscription:${subId}`,
        'message-id:msg-' + Date.now(),
        'content-type:application/json',
        'content-length:' + payload.length,
        '',
        payload,
        '\u0000'
    ].join('\n');

    if (activeServer) {
        activeServer.emit('message', frame);
    } else {
        console.error('[Mock STOMP] Server not initialized yet. Wait for page load.');
    }
}

Cypress.Commands.add('mockStomp', (url: string) => {
    activeUrl = url;

    return cy.wrap({
        emitInboxLog(log: InboxLog) {
            sendStompMessage('/user/queue', log);
        },
        emitRoomEvent(chatId: string, event: any) {
            sendStompMessage(`/room/${chatId}`, event);
        }
    });
});
