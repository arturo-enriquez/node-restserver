const mongoose = require('mongoose');
let Schema = mongoose.Schema;


let categoriaSchema = new Schema({
    nombre: {
        type: String,
        unique: true,
        required: [true, 'El nombre es obligatorio']
    },
    descripcion: {
        type: String,
        required: false
    },
    usuario: {
        type: Schema.Types.ObjectId, 
        ref: 'Usuario'
    }
});


module.exports = mongoose.model('Categoria', categoriaSchema);