var sqlite3 = require('sqlite3')

var db = new sqlite3.Database('bookings.db');


db.run("CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY, owner TEXT, startDate TEXT, endDate TEXT, description TEXT)");


const bookings = [
    {
        "id": 0,
        "owner": "Sam",
        "startDate": "2019-12-01",
        "endDate": "2019-12-07",
        "description": "Some Text"
    }
]


function parseDate(dateString) {
    var parts = dateString.split('-');

    // Please pay attention to the month (parts[1]); JavaScript counts months from 0
    return  new Date(parts[0], parts[1] - 1, parts[2]); 
    
}

function getBookings(callback) {
    // Return all bookings
    db.all("SELECT * FROM bookings ORDER BY startDate", callback);
}

function deleteBooking(id, callback) {
    var stmt = db.prepare("DELETE FROM bookings WHERE id = ?");
    stmt.run(id, (err) => {
        if (err) {
            callback(err)
            return
        }
    })

    stmt.finalize(function(err){
        if (err) {
            callback(err)
        } else {
            callback(null)
        }
    })

}

function addBooking(owner, startDate, endDate, description = "", callback) {
    // Increment the ID
    testStart = parseDate(startDate)
    testEnd = parseDate(endDate)

    // End date can't be before start date
    if (testEnd < testStart) {
        callback({
            "title": "Invalid booking",
            "detail": "End date must be after start date"
        })
        return
    }

    var stmt = db.prepare("INSERT INTO bookings (owner, startDate, endDate, description) VALUES (?,?,?,?)");

    stmt.run(owner, startDate, endDate, description, (err) => {
        if (err) {
            callback(err)
            return
        }
    })

    stmt.finalize(function(err){
        if (err) {
            callback(err)
        } else {
            callback(null, this.lastID)
        }
    })

}

exports.getBookings = getBookings
exports.addBooking = addBooking
exports.deleteBooking = deleteBooking