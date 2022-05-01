/* eslint-disable  */
import axios from "axios";
import { showAlert } from "./alerts";

// Function for login
export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.Status === "Success") {
      showAlert("success", "Signed up Successully");
      window.setTimeout(() => {
        location.assign("/"); // Directing to the home page in 1 sec.
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
