import axios from "axios";
import { showAlert } from "./alerts";

const stripe = Stripe(
  "pk_test_51KtZ7FSC43EeA5LqHaMAEM8Wouv0mEzDbuJ5bWaeteqcDoHrmDphwncJXSMx71DfkTpV1QM2mp6666dyhaP8bh8c00sAdQxozd"
);

// this tourId is coming from the pug template where we declare the data property
export const bookTour = async (tourId) => {
  // 1. Get the checkout session from the API
  try {
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`
    );

    // 2. Create a checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert("error", err);
  }
};
