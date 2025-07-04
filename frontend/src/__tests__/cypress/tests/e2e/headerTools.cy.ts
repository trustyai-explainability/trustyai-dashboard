import {
  checkAppLoaded,
  visitApp,
  waitForPageLoad,
} from '~/__tests__/cypress/support/commands/common';
import { headerToolsPage } from '~/__tests__/cypress/pages/headerToolsPage';

describe('HeaderTools Tests', () => {
  beforeEach(() => {
    visitApp();
    waitForPageLoad();
  });

  it('should load HeaderTools successfully', () => {
    checkAppLoaded();
    headerToolsPage.shouldBeVisible();
  });

  it('should display the theme toggle group', () => {
    headerToolsPage.getThemeToggleGroup().should('be.visible');
  });

  it('should display both light and dark theme toggles', () => {
    headerToolsPage.getLightThemeToggle().should('be.visible');
    headerToolsPage.getDarkThemeToggle().should('be.visible');
  });

  it('should have dark theme selected by default', () => {
    headerToolsPage.verifyDarkThemeSelected();
    headerToolsPage.verifyThemeAppliedToHtml('dark');
  });

  it('should switch to light theme when clicked', () => {
    headerToolsPage.clickLightTheme();
    headerToolsPage.verifyLightThemeSelected();
    headerToolsPage.verifyThemeAppliedToHtml('light');
  });

  it('should switch back to dark theme when clicked', () => {
    // First switch to light theme
    headerToolsPage.clickLightTheme();
    headerToolsPage.verifyLightThemeSelected();

    // Then switch back to dark theme
    headerToolsPage.clickDarkTheme();
    headerToolsPage.verifyDarkThemeSelected();
    headerToolsPage.verifyThemeAppliedToHtml('dark');
  });

  it('should persist theme selection across page interactions', () => {
    // Switch to light theme
    headerToolsPage.clickLightTheme();
    headerToolsPage.verifyLightThemeSelected();

    // Reload page to test persistence
    cy.reload();
    waitForPageLoad();

    // Verify light theme is still selected
    headerToolsPage.verifyLightThemeSelected();
    headerToolsPage.verifyThemeAppliedToHtml('light');
  });
});
