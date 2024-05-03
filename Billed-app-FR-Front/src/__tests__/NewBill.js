/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill page, there are a mail icon in vertical layout", () => {
		test("Then, the icon should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const windowIcon = screen.getByTestId("icon-mail");
			const isIconActivated = windowIcon.classList.contains("active-icon");
			expect(isIconActivated).toBeTruthy();
		});
	});
	describe("Then I am on NewBill page, there are a form", () => {
		test("Then, all the form input should be render correctly", () => {
			document.body.innerHTML = NewBillUI();

			const formNewBill = screen.getByTestId("form-new-bill");
			const type = screen.getAllByTestId("expense-type");
			const name = screen.getAllByTestId("expense-name");
			const date = screen.getAllByTestId("datepicker");
			const amount = screen.getAllByTestId("amount");
			const vat = screen.getAllByTestId("vat");
			const pct = screen.getAllByTestId("pct");
			const commentary = screen.getAllByTestId("commentary");
			const file = screen.getAllByTestId("file");
			const submitBtn = document.querySelector("#btn-send-bill");

			expect(formNewBill).toBeTruthy();
			expect(type).toBeTruthy();
			expect(name).toBeTruthy();
			expect(date).toBeTruthy();
			expect(amount).toBeTruthy();
			expect(vat).toBeTruthy();
			expect(pct).toBeTruthy();
			expect(commentary).toBeTruthy();
			expect(file).toBeTruthy();
			expect(submitBtn).toBeTruthy();

			expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
		});
	});
	describe("When I am on NewBill page, and a user upload an accepted format file", () => {
		test("Then, the file name should be correctly displayed into the input and isImgFormatValid should be true", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			document.body.innerHTML = NewBillUI();

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});
			const handleChangeFile = jest.fn(() => newBill.handleChangeFile);
			const file = screen.getByTestId("file");

			window.alert = jest.fn();

			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.png"], "file.png", { type: "image/png" })],
				},
			});

			jest.spyOn(window, "alert");
			expect(alert).not.toHaveBeenCalled();

			expect(handleChangeFile).toHaveBeenCalled();
			expect(file.files[0].name).toBe("file.png");
			expect(newBill.fileName).toBe("file.png");
			expect(newBill.isImgFormatValid).toBe(true);
			expect(newBill.formData).not.toBe(null);
		});
	});
	describe("When I am on NewBill page, and a user upload an unaccepted format file", () => {
		test("Then, the file name should not be displayed into the input, isImgFormatValid should be false, and an alert should be displayed", () => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			document.body.innerHTML = NewBillUI();

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;

			const newBill = new NewBill({ document, onNavigate, store, localStorage });
			const handleChangeFile = jest.fn(newBill.handleChangeFile);
			const file = screen.getByTestId("file");

			window.alert = jest.fn();

			file.addEventListener("change", handleChangeFile);
			fireEvent.change(file, {
				target: {
					files: [new File(["file.pdf"], "file.pdf", { type: "file/pdf" })],
				},
			});

			jest.spyOn(window, "alert");
			expect(alert).toHaveBeenCalled();

			expect(handleChangeFile).toHaveBeenCalled();
			expect(newBill.fileName).toBe(null);
			expect(newBill.isImgFormatValid).toBe(false);
			expect(newBill.formData).toBe(undefined);
		});
	});
	});

// POST
describe("When I navigate to the Dashboard as an employee", () => {
	describe("Given I am a user connected as an employee, and I post a new bill", () => {
		test("Adding a bill using the mock API POST", async () => {
			const postSpy = jest.spyOn(mockStore, "bills");
			const billData = {
				id: "47qAXb6fIm2zOKkLzMro",
				vat: "80",
				fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
				status: "pending",
				type: "Hôtel et logement",
				commentary: "séminaire billed",
				name: "encore",
				fileName: "preview-facture-free-201801-pdf-1.jpg",
				date: "2004-04-04",
				amount: 400,
				commentAdmin: "ok",
				email: "a@a",
				pct: 20,
			};
			const postedBill = await mockStore.bills().update(billData);
			expect(postSpy).toHaveBeenCalledTimes(1);
			expect(postedBill).toEqual(billData);
		});
		describe("When an error occurs on the API", () => {
			beforeEach(() => {
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);

				document.body.innerHTML = NewBillUI();

			});
			test("Adding bills from the API fails with a 404 error message", async () => {
				const postSpy = jest.spyOn(console, "error");

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("404"))),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });
				newBill.isImgFormatValid = true;

				// Submit form
				const form = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				form.addEventListener("submit", handleSubmit);

				fireEvent.submit(form);
				await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("404"));
			});
			test("Adding bills from the API fails with a 500 error message", async () => {
				const postSpy = jest.spyOn(console, "error");

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("500"))),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });
				newBill.isImgFormatValid = true;

				// Submit form
				const form = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				form.addEventListener("submit", handleSubmit);

				fireEvent.submit(form);
				await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("500"));
			});
		});
	});
});
