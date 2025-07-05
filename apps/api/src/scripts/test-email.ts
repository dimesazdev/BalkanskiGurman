import "dotenv/config";
import { sendEmail } from "../utils/sendEmail";

(async () => {
  await sendEmail({
    to: "sazdev.d16@gmail.com",
    subject: "🚀 Test Email from Local Dev",
    html: "<p>Hello! This is a test email from your local environment.</p>",
  });
  console.log("Email sent!");
})();
