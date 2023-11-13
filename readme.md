# My Express.js Application Phincon

## Overview
This application is an Express.js server managing a database of fighter planes. It provides endpoints to retrieve, add, update, and delete plane data.

## Getting Started

### Prerequisites
- Node.js
- npm (Node Package Manager)

### Installation
1. Clone the repository or download the source code.
2. Navigate to the project directory and run `npm install` to install dependencies.

### Running the Server
Execute the following command in the root directory of the project:

node app.js

This will start the server on `localhost` at port `6000`.

## API Endpoints

### Get All Planes
- **Endpoint**: `GET /planes`
- **Description**: Retrieves a list of all planes.
- **Usage**: `http://localhost:3000/planes`

### Get Planes by Name
- **Endpoint**: `GET /planes/name/:name`
- **Description**: Retrieves a specific plane by its name.
- **Usage**: `http://localhost:3000/planes/{planeName}`
- **Example**: `http://localhost:3000/planes/F-16%20Fighting%20Falcon`

### Get Planes by Country
- **Endpoint**: `GET /planes/country/:country`
- **Description**: Retrieves all planes associated with a specific country.
- **Usage**: `http://localhost:3000/planes/country/{countryName}`
- **Example**: `http://localhost:3000/planes/country/France`

### Add a New Plane
- **Endpoint**: `POST /planes`
- **Description**: Adds a new plane to the database.
- **Usage**: Send a POST request with plane data in the request body to `http://localhost:3000/planes`.

### Update Plane Information
- **Endpoint**: `PUT /planes/name/:name`
- **Description**: Updates the information of an existing plane.
- **Usage**: Send a PUT request with updated data in the request body to `http://localhost:3000/planes/name/{planeName}`.

### Delete a Plane
- **Endpoint**: `DELETE /planes/name/:name`
- **Description**: Deletes a plane from the database.
- **Usage**: Send a DELETE request to `http://localhost:3000/planes/name/{planeName}`.

