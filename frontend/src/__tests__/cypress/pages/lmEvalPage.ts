class LmEvalPage {
  visit() {
    cy.visit('/');
  }

  shouldBeVisible() {
    return cy.get('body').should('be.visible');
  }

  shouldHaveContent() {
    return cy.get('body').should('exist');
  }

  getPageSection() {
    return cy.get('[data-testid="lm-eval-page"]');
  }

  getPageTitle() {
    return cy.get('[data-testid="lm-eval-title"]');
  }
}

export const lmEvalPage = new LmEvalPage();
