/// <reference types="cypress" />

describe('Klanglandschaft UI', () => {

  it('navigate to sound editor', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('Start Exploring', { timeout: 100000 }).click();
    cy.contains('start').click();
    cy.get('#editor-button').click();
  })

  it('move around the map', () => {
    cy.visit('http://localhost:5173/')
    cy.contains('Start Exploring', { timeout: 100000 }).click();
    cy.contains('start').click();
    cy.get('#canvas-root').trigger('mousedown', { which: 1 });
    cy.get('#canvas-root').trigger('mousemove', { clientX: 100, clientY: 100 });
    cy.get('#canvas-root').trigger('mouseup', { force: true });
  });
});