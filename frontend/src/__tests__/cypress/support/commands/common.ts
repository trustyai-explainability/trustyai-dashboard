/**
 * Common utility commands for TrustyAI Dashboard tests
 */

export const visitApp = () => {
  cy.visit('/');
};

export const visitLmEval = () => {
  cy.visit('/');
};

export const checkAppLoaded = () => {
  cy.get('body').should('be.visible');
};

// Utility function to wait for page load
export const waitForPageLoad = (timeout = 30000) => {
  cy.get('body', { timeout }).should('be.visible');
};
