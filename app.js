var express = require('express');
var path = require('path');
const { check, validationResult } = require('express-validator')
var mongoose = require('mongoose');
var multer = require('multer')
var app = express();
var database = require('./config/database');
var bodyParser = require('body-parser');         // pull information from HTML POST (express4)

var port = process.env.PORT || 8000;
app.use(bodyParser.urlencoded({ 'extended': 'true' }));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.use(bodyParser.urlencoded({ extended: true }));

const exphbs = require('express-handlebars');

const storage = multer.diskStorage({
    destination: "./public/photos/",
    filename: function (req, file, cb) {

        cb(null, Date.now() + path.extname(file.originalname));
    }
});
var upload = multer({ storage: storage })

app.use(express.static("./public/"));

//app.use(express.static(path.join(__dirname, 'public')));

app.engine('.hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    runtimeOptions: { allowProtoPropertiesByDefault: true, allowedProtoMethodsByDefault: true },
    helpers: {
        checkImage: function (value) {
            if (value === "" || value == null || value == undefined || value == NaN) {
                return "unknown";
            }
            else {
                if (typeof value === 'string' && value.includes("https:")) {
                    return value;
                }
                else {
                    return "/photos/" + value;
                }
            }

        },
        checkEmpty: function (value) {
            return value === "" || value == null || value == undefined || value == NaN ? false : true;
        },
        replaceBlank: function (value) {
            return value === "" || value == null || value == undefined || value == NaN ? "unknown" : value;
        },

        highlightRow: function () {
            const values = Array.from(arguments);
            return values.some(value => value === "" || value == null || value == undefined || value == NaN) ? 'highlight' : '';
        },
    }
}
));
app.set('view engine', 'hbs');


mongoose.connect(database.url);

var Car = require('./models/car');

app.get('/', function (req, res) {

    res.render('index', { title: "Car Invoices" });
});

//get all invoice data from db
app.get('/api/invoices', function (req, res) {

    // use mongoose to get all invoice in the database
    Car.find().then(cars => {
        res.send(cars);
    })

        // if there is an error retrieving, send the error otherwise send data
        .catch(error => {
            res.send(error)
        })

});
const ObjectId = mongoose.Types.ObjectId;
// get a invoice with ID of 1
app.get('/api/invoices/:id', async (req, res) => {
    let id = req.params.id;

    let query;

    // Check if param is a valid ObjectId
    if (ObjectId.isValid(id)) {
        query = { _id: id };
    } else {
        query = { InvoiceNo: id };
    }

    // Find the document with the constructed query
    const result = await Car.findOne(query);

    if (!result) {
        return res.status(404).send(`<center><h3 style="color:red">error: Invoice not found</h3></center>`);
    }
    res.send(result)

    //   await Car.findById(id).then(car => {
    //         res.json(car);
    //     }).catch(error => {
    //         res.send(error);
    //     })
});

// create invoices and send back all invoices after creation
app.post('/api/invoices', function (req, res) {

    console.log(req.body);

    // create mongose method to create a new record into collection
    Car.create({
        InvoiceNo: req.body.InvoiceNo,
        image: req.body.image,
        Manufacturer: req.body.Manufacturer,
        class: req.body.class,
        Sales_in_thousands: req.body.Sales_in_thousands,
        __year_resale_value: req.body.__year_resale_value,
        Vehicle_type: req.body.Vehicle_type,
        Price_in_thousands: req.body.Price_in_thousands,
        Engine_size: req.body.Engine_size,
        Horsepower: req.body.Horsepower,
        Wheelbase: req.body.Wheelbase,
        Width: req.body.Width,
        Length: req.body.Length,
        Curb_weight: req.body.Curb_weight,
        Fuel_capacity: req.body.Fuel_capacity,
        Fuel_efficiency: req.body.Fuel_efficiency,
        Latest_Launch: req.body.Latest_Launch,
        Power_perf_factor: req.body.Power_perf_factor
    })
        .then(car => {
            // get and return all the employees after newly created employe record
            Car.find().then(cars => {
                res.json(cars);
            }).catch(error => {
                res.send(error)
            })
        })
        .catch(error => {
            console.error(error);
        });
});

// delete a invoice by id
app.delete('/api/invoices/:id', async (req, res) => {
    console.log(req.params.id);
    let id = req.params.id;


    let query;

    // Check if param is a valid ObjectId
    if (ObjectId.isValid(id)) {
        query = { _id: id };
    } else {
        query = { InvoiceNo: id };
    }

    // Find the document with the constructed query
    const result = await Car.findOne(query);

    if (!result) {
        return res.status(404).send(`<center><h3 style="color:red">error: Invoice not found</h3></center>`);
    }
    else {
        Car.deleteOne({
            query
        }).then(res.send('Invoice has been Deleted Successfully!.'))
            .catch(error => {
                res.send(error);
            })
    }


});

// create Car and send back all Car after creation
app.put('/api/invoices/:id', async (req, res) => {
    // create mongose method to update an existing record into collection
    console.log(req.body);

    let id = req.params.id;
    var data = {
        Manufacturer: req.body.Manufacturer,
        Price_in_thousands: req.body.Price_in_thousands
    }

    let query;

    // Check if param is a valid ObjectId
    if (ObjectId.isValid(id)) {
        query = { _id: id };
    } else {
        query = { InvoiceNo: id };
    }

    // Find the document with the constructed query
    const result = await Car.findOne(query);

    if (!result) {
        return res.status(404).send(`<center><h3 style="color:red">error: Invoice not found</h3></center>`);
    }
    else {
        // save the user
        Car.findOneAndUpdate(query, data).then(car => {

            if (!car) {
                // Handle the case where the document is not found
                return res.status(404).send('Invoice not found');
            }

            res.send('Invoice updated Successfully! - ' + car.Manufacturer);

        }).catch(error => {
            throw error;
        })
    }



});
const ITEMS_PER_PAGE = 5;
const characters = Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index));
//Display all invoices using handlebars
app.get('/api/ViewInvoices', async (req, res) => {
    const page = +req.query.page || 1;
    const char = req.query.char;
    console.log(char)
    // use mongoose to get all invoice in the database

    const totalItems = await Car.countDocuments();

    let items;
    if (char == null || char == "" && page) {
        items = await Car.find()
            .sort({ _id: -1 })
            .skip((page - 1) * ITEMS_PER_PAGE)
            .limit(ITEMS_PER_PAGE);

            res.render('ViewInvoices', {
                CarSales: items,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
                characters: characters,
                isSelected: true
            })
    }
    else {
        items = await Car.find({ Manufacturer: { $regex: "^" + char, $options: 'i' } })
            .sort({ _id: -1 })
            res.render('ViewInvoices', {
                CarSales: items,
                currentPage: page,
                characters: characters,
                isSelected: true
            })
    }

    // Car.find().then(cars => {
    //     if (cars != null && cars.length != 0) {
    // res.send(cars[0].Manufacturer);
    //console.log(typeof cars)
    
    // } else {
    //     res.render('error', { title: 'Error', message: 'Error: No data Found!' });
    // }
    //})

    // if there is an error retrieving, send the error otherwise send data
    // .catch(error => {
    //     res.send(error)
    // })

})

app.get('/api/AddInvoice', function (req, res) {

    res.render('AddInvoice');
});

app.post('/api/AddInvoice', upload.single("image"), (req, res) => {
    // create mongose method to create a new record into collection
    Car.create({
        InvoiceNo: req.body.InvoiceNo,
        image: req.file.filename,
        Manufacturer: req.body.Manufacturer,
        class: req.body.class,
        Sales_in_thousands: req.body.Sales_in_thousands,
        __year_resale_value: req.body.__year_resale_value,
        Vehicle_type: req.body.Vehicle_type,
        Price_in_thousands: req.body.Price_in_thousands,
        Engine_size: req.body.Engine_size,
        Horsepower: req.body.Horsepower,
        Wheelbase: req.body.Wheelbase,
        Width: req.body.Width,
        Length: req.body.Length,
        Curb_weight: req.body.Curb_weight,
        Fuel_capacity: req.body.Fuel_capacity,
        Fuel_efficiency: req.body.Fuel_efficiency,
        Latest_Launch: req.body.Latest_Launch,
        Power_perf_factor: req.body.Power_perf_factor
    })
        .then(car => {
            res.redirect('/api/ViewInvoices');
        })
        .catch(error => {
            console.error(error);
        });
});


app.listen(port);
console.log("App listening on port : " + port);