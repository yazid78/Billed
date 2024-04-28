/**
 * @jest-environment jsdom
 */
import Bills from "../containers/Bills.js"; // Ajoutez cette importation
import {screen, waitFor , fireEvent} from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect"; //jai ajouter joute en + 
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })

    
    test("Then, no bills should be shown", () => {
      document.body.innerHTML = BillsUI({ data: [] });
      const bill = screen.queryByTestId("data-table");
      expect(bill).toBeNull();
    });
 
    

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
})

describe("Bills container", () => {
  describe("When i click on new bills the handleClickNewBill redirects", () => {
    test("It should navigate to the NewBill page", () => {
      const onNavigateMock = jest.fn();
      const billsContainer = new Bills({
        document,
        onNavigate: onNavigateMock,
        store: null, 
        localStorage: null, });
      billsContainer.handleClickNewBill();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      expect(screen.queryByTestId("btn-new-bill")).not.toBeNull();
    });
  });
});

