/* eslint-disable */

export const hideAlert = () => {
  const el = document.querySelector(".alert");

  // Moving one level up to the parentElement and removing the child element
  if (el) {
    el.parentElement.removeChild(el);
  }
};

export const showAlert = (type, msg) => {
  // type will either be "Success" or "error"

  hideAlert();
  const markup = `<div class="alert alert--${type}"> ${msg} </div>`;
  // this will be inserted in the body right after the beginning of the alert
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
  window.setTimeout(hideAlert, 4000);
};
