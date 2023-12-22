/// <reference types="cypress" />

describe('Klanglandschaft UI', () => {
  it('visit site', () => {
    cy.visit('https://beta.klanglandschaft.com')

    cy.contains('Start Exploring').click();
  })
})