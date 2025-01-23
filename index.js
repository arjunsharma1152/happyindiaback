const express = require('express');
const { google } = require('googleapis');
const cors = require('cors'); // Import CORS
require('dotenv').config();
const app = express();
const port = 3000;

const sheets = google.sheets('v4');
const spreadsheetId = '1TBOyOWvBFn9PF0PnNAgC_I9g7g5yOu4dC-3lqvdA-bM';
const sheetName1 = 'Sheet1';
const sheetName2 = 'Sheet2';

const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.SERVICE_ACCOUNT_KEY),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Enable CORS for all routes
app.use(cors());

app.use(express.json());

// POST endpoint to append data to Sheet1
app.post('/appendData', async (req, res) => {
    console.log('appendData');
    try {
        const { data } = req.body; // Data sent in the request body

        if (!data) {
            return res.status(400).send('Data is required');
        }

        // Authenticate
        const authClient = await auth.getClient();

        // Append data to Sheet1
        await sheets.spreadsheets.values.append({
            auth: authClient,
            spreadsheetId,
            range: `${sheetName1}!A1`, // Specify a valid range
            valueInputOption: 'RAW',
            resource: {
                values: [[data]], // Must be a 2D array
            },
        });

        res.status(200).send('Data appended successfully.');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error appending data');
    }
});

// GET endpoint to fetch data from cell A1 of Sheet2
app.get('/fetchData', async (req, res) => {
    console.log('fetchData');
    try {
        // Authenticate
        const authClient = await auth.getClient();

        // Fetch data from Sheet2, cell A1
        const response = await sheets.spreadsheets.values.get({
            auth: authClient,
            spreadsheetId,
            range: `${sheetName2}!A1`, // Specify the range
        });

        const data = response.data.values ? response.data.values[0][0] : 'No data found';
        res.status(200).json({ data: data });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error fetching data');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
