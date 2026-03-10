import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendWelcomeEmail(email: string, name: string) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "hello@littlesparks.dev",
    to: email,
    subject: `Welcome to LittleSparks, ${name}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6B35;">Welcome to LittleSparks!</h1>
        <p>Hi ${name},</p>
        <p>We're so excited to have you join LittleSparks — where little minds ignite big ideas!</p>
        <p>Start your learning adventure today and discover the magic of Vedic Maths.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard"
           style="display: inline-block; background: #FF6B35; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
          Start Learning
        </a>
      </div>
    `,
  });
}

export async function sendProgressReport(
  email: string,
  childName: string,
  stats: { stars: number; streak: number; lessonsCompleted: number }
) {
  return resend.emails.send({
    from: process.env.EMAIL_FROM || "hello@littlesparks.dev",
    to: email,
    subject: `${childName}'s Weekly Progress Report`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #FF6B35;">Weekly Progress Report</h1>
        <p>Here's how ${childName} did this week:</p>
        <ul>
          <li>Stars earned: ${stats.stars}</li>
          <li>Current streak: ${stats.streak} days</li>
          <li>Lessons completed: ${stats.lessonsCompleted}</li>
        </ul>
      </div>
    `,
  });
}
