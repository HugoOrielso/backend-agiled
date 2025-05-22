import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ message: "on vercel" })
})

app.post('/api/create-contact', async (req, res) => {
    const apiToken = process.env.AGILED_API_TOKEN
    const brand = process.env.AGILED_BRAND
    const { first_name, last_name, email, phone, project_scope, address, tags, note } = req.body;

    const contact = {
        first_name, last_name, email, phone, note, tags,
        addresses: [
            { address1: address }
        ],
        custom_fields: [
            ...custom_fields,
            { key: "project_scope", value: project_scope }
        ],
        role: "Lead"
    };

    try {
        const response = await fetch(`https://my.agiled.app/api/v1/contacts?api_token=${apiToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Brand': `${brand}`,
                'Accept': "application/json"
            },
            body: JSON.stringify(contact)
        })

        const data = await response.json()
        console.log(data);

        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear contacto' })
    }
})

export default app

