const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const imageDataSchema = new Schema({
    key: String,
    value: String,
});
const imageMatchingSchema = new Schema({
    name:{type:String, required:true}, 
    items: {
        type:Map,
        of:[imageDataSchema], required:true
    }
})
const imageData=mongoose.model('ImageData',imageMatchingSchema);
module.exports=imageData;
