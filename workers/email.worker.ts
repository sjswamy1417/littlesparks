import { Worker, Job } from "bullmq";
import { sendWelcomeEmail, sendProgressReport } from "@/lib/email";
import { redis } from "@/lib/redis";

interface EmailJobData {
  type: "welcome" | "progress_report";
  email: string;
  name: string;
  stats?: {
    stars: number;
    streak: number;
    lessonsCompleted: number;
  };
}

const emailWorker = new Worker<EmailJobData>(
  "email",
  async (job: Job<EmailJobData>) => {
    const { type, email, name, stats } = job.data;

    console.log(`Processing email job: ${type} to ${email}`);

    switch (type) {
      case "welcome": {
        await sendWelcomeEmail(email, name);
        console.log(`Welcome email sent to ${email}`);
        break;
      }

      case "progress_report": {
        if (!stats) {
          throw new Error("Stats required for progress report email");
        }
        await sendProgressReport(email, name, stats);
        console.log(`Progress report email sent to ${email}`);
        break;
      }

      default:
        throw new Error(`Unknown email type: ${type}`);
    }

    return { type, email, sent: true };
  },
  { connection: redis as any }
);

emailWorker.on("completed", (job) => {
  console.log(`Email job ${job.id} completed`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Email job ${job?.id} failed:`, err.message);
});

export default emailWorker;
