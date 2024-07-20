const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const TodoSchema = new Schema({
    user: Schema.Types.ObjectId,
    items : Array,
});
module.exports = mongoose.model("Todo", TodoSchema);