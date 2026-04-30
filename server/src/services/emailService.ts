import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOTPEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: "SkipScope <noreply@skipscope.com>",
      to: email,
      subject: "Your SkipScope Verification Code",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #1e293b; text-align: center;">Verify your email</h2>
          <p style="color: #475569; font-size: 16px; line-height: 24px;">
            Enter the following code to verify your email address. This code will expire in 10 minutes.
          </p>
          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
