class HeaderToolsPage {
  visit() {
    cy.visit('/');
  }

  shouldBeVisible() {
    return cy.get('[data-testid="header-tools"]').should('be.visible');
  }

  getHeaderToolsContainer() {
    return cy.get('[data-testid="header-tools"]');
  }

  getThemeToggleGroup() {
    return cy.get('[aria-label="Theme toggle group"]');
  }

  getLightThemeToggle() {
    return cy.get('[aria-label="light theme"]');
  }

  getDarkThemeToggle() {
    return cy.get('[aria-label="dark theme"]');
  }

  getSunIcon() {
    return this.getLightThemeToggle().find('svg');
  }

  getMoonIcon() {
    return this.getDarkThemeToggle().find('svg');
  }

  clickLightTheme() {
    this.getLightThemeToggle().click();
  }

  clickDarkTheme() {
    this.getDarkThemeToggle().click();
  }

  verifyLightThemeSelected() {
    return this.getLightThemeToggle().should('have.attr', 'aria-pressed', 'true');
  }

  verifyDarkThemeSelected() {
    return this.getDarkThemeToggle().should('have.attr', 'aria-pressed', 'true');
  }

  verifyThemeAppliedToHtml(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      return cy.get('html').should('have.class', 'pf-v6-theme-dark');
    }
    return cy.get('html').should('not.have.class', 'pf-v6-theme-dark');
  }
}

export const headerToolsPage = new HeaderToolsPage();
