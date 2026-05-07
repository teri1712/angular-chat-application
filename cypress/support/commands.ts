Cypress.Commands.add('login', (username, password) => {
    cy.clearLocalStorage()
    cy.intercept('GET', '**/profiles/me', {fixture: 'get-profile-success', delay: 0})
    cy.fixture('login-success').then(user => {
        cy.visit('/', {
            onBeforeLoad: (win) => {
                const token = user.accessToken;
                win.localStorage.setItem('chat_access_token', token.accessToken);
                win.localStorage.setItem('chat_refresh_token', token.refreshToken);
                win.localStorage.setItem('chat_profile', JSON.stringify(user.profile));
            }
        })
    })
})

Cypress.Commands.add('visitConversation', (conversationId) => {
    const url =
        `/home/(conversation:00000000-0000-0000-0000-000000000001%2B00000000-0000-0000-0000-000000000004//side-bar:thread/list)?roomName=Tony%20Tony%20Chopper&roomAvatar=https:%2F%2Fi.pinimg.com%2F736x%2Fec%2Fa7%2F0f%2Feca70f7274805de4be9553a9632778bf.jpg&presence=Tue%20Apr%2028%202026%2022:10:39%20GMT%2B0700%20(Indochina%20Time)`;
    cy.visit(url)
    cy.get('app-chat-info-bar')
        .should('be.visible')
})

Cypress.Commands.add('interceptUpload', () => {
    cy.intercept('POST', '**/files/upload**', {
        statusCode: 200, body: {
            presignedUploadUrl: '/presigned-upload-url',
        }
    });
    cy.intercept('PUT', '/presigned-upload-url', {
        statusCode: 200, body: {
            presignedUploadUrl: '/presigned-upload-url',
        },
        headers: {
            ETag: 'etag-value',
        }
    });
})

Cypress.Commands.add('visitLogin', () => {
    cy.clearLocalStorage();
    // Block the real Google GSI script so it cannot overwrite our stub
    cy.intercept('GET', 'https://accounts.google.com/gsi/client*', {body: ''});
    cy.visit('/auth/login', {
        onBeforeLoad(win) {
            (win as any).google = {
                accounts: {
                    id: {
                        initialize(cfg: { callback: (r: { credential: string }) => void }) {
                            (win as any).__googleCallback = cfg.callback;
                        },
                        renderButton(el: HTMLElement) {
                            el.innerHTML = '<span style="pointer-events:none">Sign in with Google</span>';
                            el.style.cssText = 'cursor:pointer;display:flex;align-items:center;justify-content:center;min-height:40px;';
                            el.addEventListener('click', () => {
                                (win as any).__googleCallback?.({credential: 'fakeIdToken'});
                            });
                        },
                        prompt() {
                        },
                    },
                },
            };
        }
    });
})