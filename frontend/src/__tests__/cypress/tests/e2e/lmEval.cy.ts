import { lmEvalPage } from '../../pages/lmEvalPage';
import { checkAppLoaded, visitLmEval, waitForPageLoad } from '../../support/commands/common';

describe('LM Evaluation Tests', () => {
  beforeEach(() => {
    visitLmEval();
    waitForPageLoad();
  });

  it('should load the LM evaluation page successfully', () => {
    checkAppLoaded();
    lmEvalPage.shouldBeVisible();
  });

  it('should display the page section', () => {
    lmEvalPage.getPageSection().should('be.visible');
  });

  it('should display the page title', () => {
    lmEvalPage.getPageTitle().should('be.visible');
  });

  it('should have the correct title text', () => {
    lmEvalPage.getPageTitle().should('contain.text', 'Model Evaluation Page Title!');
  });

  it('should render the title as h1 element', () => {
    cy.get('[data-testid="lm-eval-title"]').should('contain.text', 'Model Evaluation Page Title!');
  });
});
