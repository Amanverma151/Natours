/* eslint-disable  */
import axios from "axios";
import { showAlert } from "./alerts";

// Function for login
export const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/login",
      data: {
        email,
        password,
      },
    });

    if (res.data.Status === "Success") {
      showAlert("success", "Logged in Successully");
      window.setTimeout(() => {
        location.assign("/"); // Directing to the home page in 1 sec.
      }, 1000);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "http://127.0.0.1:8000/api/v1/users/logout",
    });
    if (res.data.Status === "Success") location.reload(true);
  } catch (err) {
    alert("Error logging out! Please try again");
  }
};
