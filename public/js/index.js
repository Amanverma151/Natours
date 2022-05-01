/* eslint-disable  */
import "@babel/polyfill";
import { displayMap } from "./mapBox";
import { login, logout } from "./login";
import { signup } from "./signup";
import { updateSettings } from "./updateSettings";
import { bookTour } from "./stripe";

// DOM ELEMENTS THAT HAVE MAP
const mapBox = document.getElementById("map");
const loginForm = document.querySelector(".form--login");
const signupForm = document.querySelector(".form--login");
const logOutBtn = document.querySelector(".nav__el--logout");
const userDataForm = document.querySelector(".form-user-data");
const userPasswordForm = document.querySelector(".form-user-settings");
const bookBtn = document.getElementById("book-tour");

// DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // to prevent the form to load any other page.
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  });

if (signupForm)
  loginForm.addEventListener("submit", (event) => {
    event.preventDefault(); // to prevent the form to load any other page.
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password1").value;
    const passwordConfirm = document.getElementById("passwordConfirm2").value;
    signup(name, email, password, passwordConfirm);
    document.querySelector(".btn--green_sign").textContent = "Signing up...";
  });

if (logOutBtn) logOutBtn.addEventListener("click", logout);

if (userDataForm)
  userDataForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // For taking the form inputs and appending it
    const form = new FormData();
    form.append("name", document.getElementById("name").value); // or const email = document.getElementById("email").value;
    form.append("email", document.getElementById("email").value); // or  const name = document.getElementById("name").value
    form.append("photo", document.getElementById("photo").files[0]);

    updateSettings(form, "data");
  });

if (userPasswordForm)
  userPasswordForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    document.querySelector(".btn--save-password").textContent = "Updating...";

    // these variable names should be the same as in your API
    const passwordCurrent = document.getElementById("password-current").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("password-confirm").value;

    // awaiting the promise to clear the input fields after the reload
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      "password"
    );

    document.querySelector(".btn--save-password").textContent =
      "Save Password";

    document.getElementById("password-current").value = "";
    document.getElementById("password").value = "";
    document.getElementById("password-confirm").value = "";
  });

if (bookBtn)
  bookBtn.addEventListener("click", (e) => {
    /**
     * const tourId= e.target.dataset.tourId;
     * since the tourID var and name of the dataset is same we can then use destructuring
     * const {tourId} = e.target.dataset;
     */

    // tourId is coming from the pug  template
    const { tourId } = e.target.dataset;
    e.target.textContent = "Processing...";
    bookTour(tourId);
  });
