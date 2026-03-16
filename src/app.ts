import express from 'express';
import dotenv from 'dotenv';
dotenv.config()
 import {google}  from 'googleapis'
const app = express();
const PORT = process.env.PORT || 5000;
export const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);
const scopes = [
  'https://www.googleapis.com/auth/calendar'
];




app.get('/auth/google', (req, res) => {
const url = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes
});
res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
    const code = req.query.code as string;
    try {
         const {tokens} = await oauth2Client.getToken(code)
         res.send({token:tokens});
       //oauth2Client.setCredentials(tokens);
    } catch (error) {
        console.error('Error occurred while fetching tokens:', error);
    }
  
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});