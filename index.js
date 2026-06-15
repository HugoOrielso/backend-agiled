import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { Resend } from "resend"

dotenv.config()

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

const resend = new Resend(process.env.RESEND_API_KEY)

app.get("/", (req, res) => {
  res.status(200).json({ message: "on vercel" })
})

app.post("/api/create-contact", async (req, res) => {
  const apiToken = process.env.AGILED_API_TOKEN
  const brand = process.env.AGILED_BRAND

  const {
    first_name,
    last_name,
    email,
    phone,
    project_scope,
    address,
    tags,
    note,
  } = req.body

  const contact = {
    first_name,
    last_name,
    email,
    phone,
    note,
    tags,
    job_title: project_scope,
    addresses: [{ address1: address }],
    custom_fields: [{ key: "project_scope", value: project_scope }],
    role: "Lead",
  }

  try {
    const response = await fetch(
      `https://my.agiled.app/api/v1/contacts?api_token=${apiToken}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Brand: `${brand}`,
          Accept: "application/json",
        },
        body: JSON.stringify(contact),
      }
    )

    const agiledData = await response.json()

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "Error al crear contacto en Agiled",
        details: agiledData,
      })
    }

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Moreno Stucco <onboarding@hugoorielso.com>",
      to: process.env.NOTIFICATION_EMAIL || "hugooxxxorielso@gmail.com",
      subject: "New Book a Visit submission",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827; line-height: 1.5;">
          <h2 style="margin-bottom: 16px;">New Book a Visit submission</h2>

          <p><strong>Name:</strong> ${first_name || ""} ${last_name || ""}</p>
          <p><strong>Email:</strong> ${email || ""}</p>
          <p><strong>Phone:</strong> ${phone || ""}</p>
          <p><strong>Address:</strong> ${address || ""}</p>
          <p><strong>Project scope:</strong> ${project_scope || ""}</p>
          <p><strong>Tags:</strong> ${tags || ""}</p>

          <hr style="margin: 24px 0;" />

          <p><strong>Additional notes:</strong></p>
          <p>${note || "No notes provided."}</p>
        </div>
      `,
    })

    return res.status(200).json({
      ok: true,
      message: "Contacto creado y notificación enviada",
      data: agiledData,
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      ok: false,
      error: "Error al crear contacto o enviar notificación",
    })
  }
})


app.post("/api/form-submitted", async (req, res) => {
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "Moreno Stucco <onboarding@hugoorielso.com>",
      to: process.env.NOTIFICATION_EMAIL || "hugooxxxorielso@gmail.com",
      subject: "Book a Visit submitted",
      html: `
        <div style="font-family: Arial, sans-serif; color: #111827;">
          <h2>Book a Visit submitted</h2>
          <p>Someone submitted the Book a Visit form.</p>
          <p>Please review Agiled to see the contact details.</p>
        </div>
      `,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ ok: false })
  }
})


export default app