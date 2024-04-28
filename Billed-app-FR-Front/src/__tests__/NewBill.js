/**
 * @jest-environment jsdom
 */

import { screen } from "@testing-library/dom"
import "@testing-library/jest-dom/extend-expect";
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"



/* describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then ...", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      //to-do write assertion
      const fileInputElement = screen.queryByTestId('file');
      expect(fileInputElement).toBeInTheDocument();
    })
  })
}) */

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then it should display the file input element for uploading a receipt", () => {
      // Render NewBillUI
      const html = NewBillUI();
      document.body.innerHTML = html;

      // Vérifie la présence de l'élément pour télécharger le justificatif
      const fileInputElement = screen.getByTestId('file');

      // Assert
      expect(fileInputElement).toBeInTheDocument();
    });
  });
});
