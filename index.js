import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
app.use(cors({ origin: "*" }))
app.use(express.json())

app.post('/api/create-contact', async (req, res) => {
    const apiToken = process.env.AGILED_API_TOKEN
    const brand = process.env.AGILED_BRAND
    const contact = req.body
    contact.role = "Lead"

    try {
        const response = await fetch(`https://my.agiled.app/api/v1/contacts?api_token=${apiToken}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Brand': `${brand}`,
                'X-CSRF-TOKEN': ''  
            },
            body: JSON.stringify(contact)
        })

        const data = await response.json()
        res.status(200).json(data)
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Error al crear contacto' })
    }
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
