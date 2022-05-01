import axios from "axios";
import { showAlert } from "./alerts";

/**
 * Here we are creating a single function for updating the name, email or the password so in this we will specify
 * some arguments like data, type
 * data is an object that contains what is to be updated and type is either normal data(name,email) or the password
 * so data contains the properties like in case of name and email change data:{ name, email} and in password data:{cuurentPassword,newPass, confirm pass..}
 */

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === "password"
        ? "/api/v1/users/updateMyPassword"
        : "/api/v1/users/updateMe";
    const res = await axios({
      method: "PATCH",
      url,
      data,
    });

    if (res.data.Status === "Success") {
      showAlert("success", `${type.toUpperCase()} updated successfully`);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};
