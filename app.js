const express = require('express');
const fs = require('fs');
const joi = require('joi');

const app = express();
const PORT = 6000

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


app.get('/:type', (req, res) => {
    try {
        const { type } = req.params;
        let items;

        if (type === 'all') {
            items = [...data.planes, ...data.helicopters];
        } else {
            items = data[type];
        }

        if (!items) {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        res.json(items);
    } catch (error) {
        console.error(`Error in GET /:type route:`, error);
        handleServerError(res);
    }
});

app.get('/:type/name/:name', (req, res) => {
    try {
        const { type, name } = req.params;
        let items;

        if (type === 'all') {
            items = [...data.planes, ...data.helicopters];
        } else if (data.hasOwnProperty(type)) {
            items = data[type];
        } else {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        const item = items.find(i => i.name.toLowerCase() === name.toLowerCase());

        if (!item) {
            return handleClientError(res, 404, 'Item not found');
        }

        res.json(item);
    } catch (error) {
        console.error('Error in GET /:type/name/:name route:', error);
        handleServerError(res);
    }
});



app.get('/:type/country/:country', (req, res) => {
    try {
        const { type, country } = req.params;
        let items;

        if (type === 'all') {
            items = [...data.planes, ...data.helicopters];
        } else if (data.hasOwnProperty(type)) {
            items = data[type];
        } else {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        const countryLowerCase = country.toLowerCase();
        const filteredItems = items.filter(item => 
            item.country.toLowerCase().includes(countryLowerCase)
        );

        if (filteredItems.length === 0) {
            return handleClientError(res, 404, 'No items found for this country in the specified type');
        }

        res.json(filteredItems);
    } catch (error) {
        console.error(`Error in GET /${type}/country/${country} route:`, error);
        handleServerError(res);
    }
});



app.delete('/:type/:name', (req, res) => {
    try {
        const { type, name } = req.params;

        if (!data.hasOwnProperty(type)) {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        const itemIndex = data[type].findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (itemIndex === -1) {
            return handleClientError(res, 404, 'Item not found');
        }

        data[type].splice(itemIndex, 1);
        fs.writeFileSync(database, JSON.stringify(data, null, 2));

        res.json({ message: 'Item deleted successfully' });
    } catch (error) {
        console.error('Error in DELETE /:type/name/:name route:', error);
        handleServerError(res);
    }
});


app.put('/:type/name/:name', (req, res) => {
    try {
        const { type, name } = req.params;
        const updateInfo = req.body;

        if (!data.hasOwnProperty(type)) {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        const itemIndex = data[type].findIndex(i => i.name.toLowerCase() === name.toLowerCase());
        if (itemIndex === -1) {
            return handleClientError(res, 404, 'Item not found');
        }

        data[type][itemIndex] = { ...data[type][itemIndex], ...updateInfo };
        fs.writeFileSync(database, JSON.stringify(data, null, 2));

        res.json({ message: 'Item updated successfully', item: data[type][itemIndex] });
    } catch (error) {
        console.error('Error in PUT /:type/name/:name route:', error);
        handleServerError(res);
    }
});

app.post('/:type', (req, res) => {
    try {
        const type = req.params.type;
        const newItem = req.body;

        // Check if the type is valid (either 'planes' or 'helicopters')
        if (!['planes', 'helicopters'].includes(type)) {
            return handleClientError(res, 400, 'Invalid type specified');
        }

        // Define the Joi schema for validation based on the type
        let schema;
        if (type === 'planes') {
            schema = joi.object({
                name: joi.string().min(3).required(),
                origin: joi.string().required(),
                speed: joi.string().required(),
                country: joi.string().required(),
                armament: joi.string().required(),
                engine: joi.string().required(),
                manufacturer: joi.string().required(),
                countryUsers: joi.array().items(joi.string()).required()
            });
        } else { // For 'helicopters'
            schema = joi.object({
                name: joi.string().min(3).required(),
                origin: joi.string().required(),
                speed: joi.string().required(),
                country: joi.string().required(),
                armament: joi.string().required(),
                engine: joi.string().required(),
                manufacturer: joi.string().required(),
                countryUsers: joi.array().items(joi.string()).required()
            });
        }

        // Validate the new item
        const { error } = schema.validate(newItem);
        if (error) {
            return handleClientError(res, 400, error.details[0].message);
        }

        // Check if the item already exists
        const existingItem = data[type].find(i => i.name.toLowerCase() === newItem.name.toLowerCase());
        if (existingItem) {
            return handleClientError(res, 400, 'Item already exists');
        }

        // Add new item to the corresponding array
        data[type].push(newItem);
        fs.writeFileSync(database, JSON.stringify(data, null, 2)); // Update db.json file

        res.status(201).json({ status: 'Success', item: newItem });
    } catch (error) {
        console.error('Error in POST /:type route:', error);
        handleServerError(res);
    }
});



app.listen(PORT , () => {
    console.log(`App Running On Port ${PORT}`)
})