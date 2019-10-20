var express = require("express");
var bookings = require("./bookings");
var bodyParser = require('body-parser')
var cors = require('cors')

const app = express()

app.use(cors())

// Use body-parser + catch JSON errors
app.use((req, res, next) => {
    bodyParser.json()(req, res, err => {
        if (err) {
            console.error(err);

            return res.status(400).send({
                errors: [
                    {
                        title: "Invalid JSON input"
                    }
                ]
            });
        }
        next();
    });
});

// Get all bookings
app.get('/bookings', (req, res) => {
    // Get all bookings
    bookings.getBookings((err, bookings) => {

        if (err) {
            return res.status(400).send({
                errors: [
                    err
                ]
            })
        }

        results = []

        // Format for JSON API
        for (let booking of bookings) {
            id = booking.id

            // Remove it from the attributes
            delete booking.id

            results.push({
                type: "booking",
                id,
                attributes: booking
            })
        }


        return res.status(200).send({
            data: results
        })
    })

    
})



// Create a booking
app.post('/bookings', (req, res) => {
    // Check for required properties
    data = req.body.data

    // Data field must exist
    if (!data || !data.attributes) {
        return res.status(400).send({
            errors: [
                {
                    title: "No data field provided"
                }
            ]
        })
    }

    attributes = data.attributes
    if(
        attributes.hasOwnProperty('owner')
        && attributes.hasOwnProperty('startDate')
        && attributes.hasOwnProperty('endDate')
    ) {
        // Contains all required properties
        bookings.addBooking(
            attributes.owner,
            attributes.startDate,
            attributes.endDate,
            attributes.description,
            (err, id) => {
                if (err) {
                    return res.status(400).send({
                        errors: [
                            err
                        ]
                    })
                }

                base = "http" + (req.secure ? 's': '') + "://" + req.headers.host
                res.header('Location', base + "/bookings/" + id)

                return res.status(201).send({
                    data: {
                        type: "booking",
                        id,
                        attributes
                    }
                })
            }
        )

    } else {
        // We need to return an error

        let errors = []

        // It's only 3 fields, manually check them
        if (!attributes.hasOwnProperty('owner')) {
            errors.push({
                title: "Missing required field",
                detail: "owner is a required field"
            })
        }

        if (!attributes.hasOwnProperty('startDate')) {
            errors.push({
                title: "Missing required field",
                detail: "startDate is a required field"
            })
        }

        if (!attributes.hasOwnProperty('endDate')) {
            errors.push({
                title: "Missing required field",
                detail: "endDate is a required field"
            })
        }

        return res.status(400).send({errors})
    }



})

app.delete('/bookings/:id', (req, res) => {
    let bookingID = req.params.id
    bookings.deleteBooking(bookingID, (err) => {
        if (err) {
            return res.status(400).send({
                errors: [
                    err
                ]
            })
        } else {
            return res.sendStatus(200)
        }
    })
})



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});

