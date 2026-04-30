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
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px; background-color: #ffffff; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 30px; position: relative; display: inline-block; width: 100%;">
            <div style="display: inline-block; position: relative;">
              <span style="color: #000000; font-weight: 900; font-style: italic; font-size: 32px; letter-spacing: -1.5px; text-transform: uppercase;">SKIP<span style="color: #000000;">SCOPE</span></span>
              <div style="display: inline-block; vertical-align: top; margin-top: 10px; margin-left: 2px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style="fill: #b62424;">
                  <path d="M11 2v2.07A8 8 0 0 0 4.07 11H2v2h2.07A8 8 0 0 0 11 19.93V22h2v-2.07A8 8 0 0 0 19.93 13H22v-2h-2.07A8 8 0 0 0 13 4.07V2m-2 4.08V8h2V6.09c2.5.41 4.5 2.41 4.92 4.91H16v2h1.91c-.41 2.5-2.41 4.5-4.91 4.92V16h-2v1.91C8.5 17.5 6.5 15.5 6.08 13H8v-2H6.09C6.5 8.5 8.5 6.5 11 6.08M12 11a1 1 0 0 0-1 1a1 1 0 0 0 1 1a1 1 0 0 0 1-1a1 1 0 0 0-1-1" />
                </svg>
              </div>
            </div>
          </div>
          
          <div style="border: 1px solid #f0f0f0; border-radius: 16px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
            <h1 style="font-size: 24px; font-weight: 800; text-align: center; margin-top: 0; color: #000000; text-transform: uppercase; font-style: italic; letter-spacing: -0.5px;">Verification Gate</h1>
            
            <p style="font-size: 15px; line-height: 1.6; color: #666666; text-align: center; margin-bottom: 30px;">
              Your access code is ready. Enter this 6-digit identity key to establish your session.
            </p>
            
            <div style="background-color: #f8f8f8; border-radius: 12px; padding: 25px; text-align: center; border: 1px dashed #e0e0e0;">
              <span style="font-family: monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #b62424; margin-left: 10px;">${otp}</span>
            </div>
            
            <div style="margin-top: 30px; border-top: 1px solid #f0f0f0; padding-top: 20px;">
              <p style="font-size: 12px; color: #999999; text-align: center; margin: 0;">
                This code expires in <strong style="color: #000000;">10 minutes</strong>.
              </p>
              <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 5px;">
                If you didn't request this, ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 11px; color: #cccccc; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Secure Access • Real Estate Intelligence</p>
          </div>
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
