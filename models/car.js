// load mongoose since we need it to define a model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
CarSchema = new Schema({
    InvoiceNo: String,
    image : String,
    Manufacturer: String,
    class: String,
    Sales_in_thousands: Number,
    __year_resale_value : Number,
    Vehicle_type: String,
	Price_in_thousands : Number,
    Engine_size : Number,
    Horsepower : Number,
    Wheelbase : Number,
    Width : Number,
    Length : Number,
    Curb_weight : Number,
    Fuel_capacity : Number,
    Fuel_efficiency : Number,
    Latest_Launch: String,
    Power_perf_factor: Number
});
module.exports = mongoose.model('Car', CarSchema);