const express = require('express');
const fs = require('fs');
const joi = require('joi');

const app = express();
const PORT = 3000

const database = './database/db.json';
const data = JSON.parse(fs.readFileSync(database));

app.use(express.json())
app.use(express.urlencoded({extended:false}))

const handleServerError = (res) => {
    return res.status(500).json({ message: 'Internal Server Error' })
  }
  
  const handleClientError = (res, status, message) => {
    return res.status(status).json({ message });
  }

  app.get('/planes', (req, res) => {
    try {
        const planeName = req.query.name;
        let filteredPlanes = data.planes;

        if (planeName) {
            filteredPlanes = filteredPlanes.filter(p => p.name.toLowerCase() === planeName.toLowerCase());
        }

        if (filteredPlanes.length === 0) {
            return handleClientError(res, 404, 'No planes found matching the criteria');
        }

        res.json(filteredPlanes);
    } catch (error) {
        console.error('Error in GET /planes route:', error);
        handleServerError(res);
    }
});

app.get('/planes/name/:name', (req, res) => {
    try {
        const planeName = req.params.name;
        console.log("Requested plane name:", planeName); // Debugging line
        console.log("Available plane names:", data.planes.map(p => p.name)); // Debugging line

        const plane = data.planes.find(p => p.name.toLowerCase() === planeName.toLowerCase());

        if (!plane) {
            return handleClientError(res, 404, 'Plane not found');
        }

        res.json(plane);
    } catch (error) {
        console.error('Error in GET /planes/:name route:', error);
        handleServerError(res);
    }
});


app.get('/planes/country/:country', (req, res) => {
    try {
        const planeCountry = req.params.country.toLowerCase();
        console.log("Requested plane country:", planeCountry); // Debugging line

        const filteredPlanes = data.planes.filter(p => p.country.toLowerCase().includes(planeCountry));

        if (filteredPlanes.length === 0) {
            return handleClientError(res, 404, 'No planes found for this country');
        }

        res.json(filteredPlanes);
    } catch (error) {
        console.error('Error in GET /planes/country/:country route:', error);
        handleServerError(res);
    }
});


app.post('/planes', (req, res) => {
    try {
        const newPlane = req.body;
        console.log('Received request:', newPlane); // Log incoming request

        const schemePlane = joi.object({
            name: joi.string().min(3).required(),
            origin: joi.string().required(),
            speed: joi.string().required(), // Add speed to the schema
            country: joi.string().required(),
            armament: joi.string().required(),
            engine: joi.string().required(),
            manufacturer: joi.string().required(),
            countryUsers: joi.array().items(joi.string()).required()
        })

        const { error } = schemePlane.validate(newPlane);

        if (error) {
            return handleClientError(res, 400, error.details[0].message);
        }

        // Check if the plane already exists
        const existingPlane = data.planes.find(p => p.name.toLowerCase() === newPlane.name.toLowerCase());
        if (existingPlane) {
            return handleClientError(res, 400, 'Plane already exists');
        }

        // Add new plane to the database
        data.planes.push(newPlane);
        fs.writeFileSync(database, JSON.stringify(data, null, 2)); // Pretty-print JSON

        res.status(201).json({ status: 'Success', plane: newPlane });
    } catch (error) {
        console.error('Error in POST /planes route:', error);
        handleServerError(res);
    }
});

app.delete('/planes/:name', (req, res) => {
    try {
        const planeName = req.params.name;
        const planeIndex = data.planes.findIndex(p => p.name.toLowerCase() === planeName.toLowerCase());

        if (planeIndex === -1) {
            return handleClientError(res, 404, 'Plane not found');
        }

        data.planes.splice(planeIndex, 1);
        fs.writeFileSync(database, JSON.stringify(data, null, 2)); // Update db.json file

        res.json({ message: 'Plane deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /planes/:name route:', error);
        handleServerError(res);
    }
});

app.put('/planes/:name', (req, res) => {
    try {
        const planeName = req.params.name;
        const planeIndex = data.planes.findIndex(p => p.name.toLowerCase() === planeName.toLowerCase());

        if (planeIndex === -1) {
            return handleClientError(res, 404, 'Plane not found');
        }

        data.planes[planeIndex] = { ...data.planes[planeIndex], ...req.body };

        fs.writeFileSync(database, JSON.stringify(data, null, 2)); // Update db.json file

        res.json({ message: 'Plane updated successfully', plane: data.planes[planeIndex] });
    } catch (error) {
        console.error('Error in PUT /planes/:name route:', error);
        handleServerError(res);
    }
});


app.listen(PORT , () => {
    console.log(`App Running On Port ${PORT}`)
})