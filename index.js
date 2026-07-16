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
      from:
        process.env.RESEND_FROM_EMAIL ||
        "Moreno Stucco <onboarding@hugoorielso.com>",
      to:
        "info@morenostucco.com",
      subject: "New Book a Visit request",
      html: `
        <div style="margin:0;padding:0;background:#f3f6fb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
          <div style="max-width:620px;margin:0 auto;padding:32px 16px;">
            
            <div style="background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 12px 30px rgba(15,23,42,0.08);">
              
              <div style="background:linear-gradient(135deg,#0B3A66,#1D75BB);padding:28px 32px;color:#ffffff;">
                <h1 style="margin:0;font-size:24px;line-height:1.3;font-weight:700;">
                  New Book a Visit request
                </h1>
                <p style="margin:8px 0 0;font-size:15px;line-height:1.5;color:#dbeafe;">
                  A new visitor has submitted the Book a Visit form.
                </p>
              </div>

              <div style="padding:32px;">
                <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#374151;">
                  Someone has completed the form on the website. Please review the contact details and follow up from Agiled.
                </p>

                <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin:24px 0;">
                  <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">
                    Form submitted
                  </p>
                  <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">
                    Book a Visit
                  </p>
                </div>

                <a href="https://crm.morenostucco.com/login"
                  style="display:inline-block;background:#1D75BB;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 22px;border-radius:999px;">
                  Review in crm
                </a>

                <p style="margin:26px 0 0;font-size:13px;line-height:1.5;color:#6b7280;">
                  This is an automatic notification sent after a form submission.
                </p>
              </div>

            </div>

            <p style="text-align:center;margin:18px 0 0;font-size:12px;color:#94a3b8;">
              Moreno Stucco · Website notification
            </p>
          </div>
        </div>
      `,
    })

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error("Error sending notification email:", error)
    return res.status(500).json({ ok: false })
  }
})

export default app