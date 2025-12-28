"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { contactSchema, ContactFormValues } from "@/lib/validations/contact"
import { submitContactForm } from "@/app/actions/contact"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", service: "", message: "" },
  })

  async function onSubmit(values: ContactFormValues) {
    setIsSubmitting(true)
    const response = await submitContactForm(values)
    setIsSubmitting(false)

    if (response.success) {
      alert(response.message)
      form.reset()
    }
  }

  return (
    // Reduced padding: py-16 instead of py-24
    <section id="contact" className="py-16 px-6 bg-[#020617] scroll-mt-20">
      <div className="max-w-xl mx-auto"> {/* Reduced max-width from 2xl to xl */}
        <div className="text-center mb-8"> {/* Reduced margin-bottom */}
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Ready to <span className="text-blue-500">Scale?</span>
          </h2>
          <p className="text-slate-400 mt-2 text-sm">
            Drop us a line. We'll respond within 24 hours.
          </p>
        </div>

        {/* Compact Glassmorphism Container */}
        <div className="p-6 md:p-8 border border-slate-800 rounded-2xl bg-slate-900/40 backdrop-blur-md shadow-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4"> {/* Reduced space-y from 6 to 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Name and Email on one row for desktop */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 text-xs uppercase tracking-wider">Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Name" 
                          {...field} 
                          className="h-10 bg-slate-950/50 border-slate-800 text-white text-sm focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-200 text-xs uppercase tracking-wider">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Email" 
                          {...field} 
                          className="h-10 bg-slate-950/50 border-slate-800 text-white text-sm focus-visible:ring-blue-500"
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-200 text-xs uppercase tracking-wider">Message</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Project details..." 
                        {...field} 
                        className="bg-slate-950/50 border-slate-800 text-white text-sm focus-visible:ring-blue-500 min-h-[100px] resize-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </section>
  )
}