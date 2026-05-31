describe('Theme and Icons', () => {
    beforeEach(() => {
        cy.login('admin', 'admin')
        cy.url().should('include', '/home')
        // Visit a conversation to see the input bar
        cy.visitConversation('123', 'test', 'test')
    })

    it('should show attachment icons in the input bar', () => {
        cy.get('app-input-bar').within(() => {
            cy.get('button[aria-label="Send image"]').should('be.visible')
            cy.get('button[aria-label="Send image"] mat-icon').should('be.visible').and('contain', 'photo')
            
            cy.get('button[aria-label="Attach file"]').should('be.visible')
            cy.get('button[aria-label="Attach file"] mat-icon').should('be.visible').and('contain', 'attach_file')
        })
    })

    it('should toggle light and dark mode and persist after reload', () => {
        // Go to settings - force click to bypass any overlay issues
        cy.get('button[aria-label="Settings"]').click({force: true})
        
        // Wait for URL to update
        cy.url().should('include', 'settings')
        
        // Ensure settings component is loaded
        cy.get('app-settings', { timeout: 15000 }).should('exist').and('be.visible')
        
        // Initial state should be dark (per ThemeService default)
        cy.get('html').should('have.class', 'dark-theme')
        
        // Capture initial background color (dark) - using .body for the background check
        // RGB for #020617 is 2, 6, 23
        cy.get('body').should('have.css', 'background-color', 'rgb(2, 6, 23)')
        
        // Toggle to light mode - find the checkbox inside the toggle
        cy.get('app-settings').within(() => {
            cy.get('input[type="checkbox"]').first().click({force: true})
        })
        
        cy.get('html').should('have.class', 'light-theme')
        cy.get('html').should('not.have.class', 'dark-theme')
        
        // Verify light background color (white)
        cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
        
        // Reload and verify persistence
        cy.reload()
        cy.get('html', { timeout: 15000 }).should('have.class', 'light-theme')
        cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
    })
})
