const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const Users = require('./model/Users.jsx');
const signup = require('./model/Users.jsx');
const axios = require("axios")
const app = express();
app.use(cors());
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb+srv://sunnysable2003:Sunit2003%24%23@cluster0.qmgkw4j.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

  app.post('/signup', async (req, res) => {
    try {
      const { email, password } = req.body; 
  
      const existingUser = await Users.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = new Users({
        email,
        password: hashedPassword
      });
  
      await newUser.save();
  
      res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Account does not exist' });
      }
  
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      res.status(200).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


app.post('/performance', async (req, res) => {
  try {
    // Forward the request to the Flask server
    const response = await axios.post('http://127.0.0.1:5500/performance-prediction', req.body);
    
    // Forward the response from Flask server to the React app
    res.json(response.data);
  } catch (error) {
    console.error('Error forwarding request to Flask server:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});
   
app.post('/audience',async(req,res)=>{
  try {
    const {gender,DOB,city,country} = req.body;
    const response = await axios.post('http://127.0.0.1:5500/audience-analysis', {
      Gender: gender,
      DOB: DOB,
      City: city,
      Country: country
    });
  
    // Access the predicted clicks from the response
    console.log('Interests:',response.data);
    res.json({Interest:response.data,success:true})
    // Handle the response as needed
  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors
    res.json({error:error,success:false})
  }
})
app.post('/schedule',async(req,res)=>{
  try {
    const {gender,DOB,city,country} = req.body;
    const response = await axios.get('http://127.0.0.1:5500/optimize-schedule');
  
    // Access the predicted clicks from the response
    console.log('Schedules:',response.data);
    res.json({Schedule:response.data,success:true})
    // Handle the response as needed
  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors
    res.json({error:error,success:false})
  }
})
app.post('/contents',async(req,res)=>{
  try {
    const {gender,DOB,city,country,product_description} = req.body;
    const response = await axios.post('http://127.0.0.1:5500/audience-analysis', {
      Gender: gender,
      DOB: DOB,
      City: city,
      Country: country
    });
  
    // Access the predicted clicks from the response
    console.log(response);
    const str = response.data.predicted_interests;
    const API = 'AIzaSyChUafLzUt7SKD_G0gUefsEdJqqpHmw_dk';
    const dat = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API}`, {
      contents: [
        {
          parts: [
            {
              text: `I am a businness owner and our product description is ${product_description}. My target audiesnce has interests in ${str}. Generate social media advertisement content on the basis of it.`
            }
          ]
        }
      ]
    },
    {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const resp = await axios.get(`https://api.unsplash.com/search/photos?query=${product_description}&client_id=2U6EdZAL4rf7mE6rCszkxJty6LGWn9c1k9FUGcq5YSc`);
    // console.log(imageMetaData.data.results[0]);
    // const imageUrl = imageMetaData["results"][0]["urls"]["raw"];
    // console.log(dat.data.candidates[0].content.parts[0]);


    if (resp.data && resp.data.results && resp.data.results.length > 0) {
      // Extract the URL of the first image from the results
      const imageUrl = resp.data.results[0].urls.raw;
      res.json({content:dat.data.candidates[0].content.parts[0],imageUrl:imageUrl,success:true})
      return imageUrl;
    } else {
      throw new Error('No images found for the given query.');
    }
    res.json({content:dat.data.candidates[0].content.parts[0],imageUrl:imageUrl,success:true})
  } catch (error) {
    console.error('Error:', error.message);
    // Handle errors
    res.json({error:error,success:false})
  }
});
app.post('/optimal-sales', async (req, res) => {
  try {
      const { instagram, facebook, youtube, twitter, tiktok } = req.body;

      // Send data to Flask server
      const response = await axios.post('http://127.0.0.1:5500/sales', {
          Instagram: [instagram],
          Facebook: [facebook],
          YouTube: [youtube],
          Twitter: [twitter],
          TikTok: [tiktok]
      });

      // Send response back to client
      res.json(response.data);
  } catch (error) {
      console.error('Error forwarding request to Flask server:', error.message);
      res.status(500).json({ error: 'Error processing request' });
  }
});


app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
