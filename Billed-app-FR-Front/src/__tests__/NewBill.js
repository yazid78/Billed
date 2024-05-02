/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import NewBillUI from "../views/NewBillUI.js";

import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId("icon-mail"));
      const mailIcon = screen.getByTestId("icon-mail");
      expect(mailIcon).toBeTruthy();
    });
  });
});




//test intégration POST

describe("NewBill integration test", () => {
  let onNavigate;
  let alertMock;
  let submitFunctionMock;
  beforeEach(() => {
    const html = NewBillUI();
    document.body.innerHTML = html;
    const store = {
      bills: jest.fn(() => ({
        create: jest.fn(() => Promise.resolve({ fileUrl: "testUrl", key: "testKey" })),
        update: jest.fn(() => Promise.resolve()),
      })),
    };
    const localStorage = {
      getItem: jest.fn(() => JSON.stringify({ email: "test@example.com" })),
    };
    onNavigate = jest.fn(); // Initialize onNavigate as a mock here

    alertMock = jest.fn(); // Creating a mock function for alert
    submitFunctionMock =jest.fn()
    window.alert = alertMock; // Assigning the mock to window.alert

    new NewBill({ document, onNavigate, store, localStorage });
  });

  test("Submit form with valid data", async () => {
    const fileField = screen.getByTestId("file");
    fireEvent.change(fileField, {
      target: {
        files: [new File(["testFileContent"], "testFile.txt", { type: "text/plain" })], // Format de fichier invalide
      },
    });
    
    const nameInput = screen.getByTestId("expense-name");
    fireEvent.change(nameInput, { target: { value: "Vol Paris Londres" } });

    const datePickerInput = screen.getByTestId("datepicker");
    fireEvent.change(datePickerInput, { target: { value: "2024-05-01" } });

    const amountInput = screen.getByTestId("amount");
    fireEvent.change(amountInput, { target: { value: "348" } });

    const vatInput = screen.getByTestId("vat");
    fireEvent.change(vatInput, { target: { value: "70" } });

    const pctInput = screen.getByTestId("pct");
    fireEvent.change(pctInput, { target: { value: "20" } });

    const commentaryInput = screen.getByTestId("commentary");
    fireEvent.change(commentaryInput, { target: { value: "Test commentary" } });


    const submitButton = screen.getByText("Envoyer")
    const file = screen.getByTestId("file")
    submitButton.onclick = submitFunctionMock; 
    fireEvent.click(submitButton);
    fireEvent.click(file)
    expect(submitFunctionMock).toHaveBeenCalled(); 
    expect(onNavigate).toHaveBeenCalledWith("#employee/bills");
    expect(alertMock).toHaveBeenCalledWith("Seuls les fichiers .jpg, .jpeg, .png sont autorisés !");

  });


});

