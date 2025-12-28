"use server"

import { contactSchema, ContactFormValues } from "@/lib/validations/contact"

export async function submitContactForm(data: ContactFormValues) {
  // 1. Validate data on the server (Security)
  const result = contactSchema.safeParse(data)
  
  if (!result.success) {
    return { success: false, error: "Invalid form data" }
  }

  // 2. Simulate sending an email or saving to a database
  console.log("Form Submission Received:", result.data)
  
  // Here you would typically use Resend or Nodemailer
  await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate delay

  return { success: true, message: "Thanks! We'll be in touch soon." }
}