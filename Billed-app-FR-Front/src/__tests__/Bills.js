import Bills from "../containers/Bills.js";
import { screen, waitFor, fireEvent } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/extend-expect";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
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
  describe("When I click on new bills the handleClickNewBill redirects", () => {
    test("It should navigate to the NewBill page", () => {
      const onNavigateMock = jest.fn();
      const billsContainer = new Bills({
        document,
        onNavigate: onNavigateMock,
        store: null,
        localStorage: null,
      });
      billsContainer.handleClickNewBill();
      expect(onNavigateMock).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
      expect(screen.queryByTestId("btn-new-bill")).not.toBeNull();
    });
  });

  test('getBills should return the correct number of bills', async () => {
    const mockStore = {
      bills: jest.fn().mockReturnThis(),
      list: jest.fn().mockResolvedValue([]),
    };

    const numberOfBills = 3;
    mockStore.bills().list.mockResolvedValue(new Array(numberOfBills));

    const billsContainer = new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: mockStore,
      localStorage: {},
    });

    const bills = await billsContainer.getBills();

    expect(mockStore.bills().list).toHaveBeenCalled();
    expect(bills).toHaveLength(numberOfBills);
  });

  describe("When I click on the eye of a bill", () => {
    test("Then a modal must appear", async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, "localStorage", { value: localStorageMock })
      window.localStorage.setItem("user", JSON.stringify({
        type: "Employee"
      }))
      const billsInit = new Bills({
        document, onNavigate, store: null, localStorage: window.localStorage
      })
      document.body.innerHTML = BillsUI({ data: bills })
      const handleClickIconEye = jest.fn((icon) => billsInit.handleClickIconEye(icon));
      const iconEye = screen.getAllByTestId("icon-eye");
      const modaleFile = document.getElementById("modaleFile")
      $.fn.modal = jest.fn(() => modaleFile.classList.add("show"))
      iconEye.forEach((icon) => {
        icon.addEventListener("click", handleClickIconEye(icon))
        userEvent.click(icon)
        expect(handleClickIconEye).toHaveBeenCalled()
      })
      expect(modaleFile).toHaveClass("show")
    })
  });
});
