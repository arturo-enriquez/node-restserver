const express = require('express');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');

const app = express();
let Producto = require('../models/producto');
let Categoria = require('../models/categoria');


// ===========================
//  Obtener todos los productos
// ===========================
app.get('/productos', verificaToken, (req, res) => {
    let disponible = req.query.disponible || true;
    disponible = Boolean(disponible);

    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 5;
    limite = Number(limite);

    Producto.find({disponible}, 'nombre precioUni descripcion categoria usuario disponible')
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if(err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Producto.count({disponible})
                .exec((err, conteo)=>{ 
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
            });

        });
});

// ===========================
//  Obtener un producto por ID
// ===========================
app.get('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec((err, productoDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            if (!productoDB) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'El ID no existe'
                    }
                });
            }
            res.json({
                ok: true,
                producto: productoDB
            });
        });
});


// ===========================
//  Buscar producto
// ===========================
app.get('/productos/buscar/:termino', verificaToken, (req, res) => {
    let termino = req.params.termino;

    let regex = new RegExp(termino, 'i'); 

    Producto.find({ nombre: regex, disponible })
        .populate('categoria', 'nombre')
        .exec((err, productos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            res.json({
                ok: true,
                productos
            })
        });

});

// ===========================
//  Crear un nuevo producto
// ===========================
app.post('/productos', verificaToken, (req, res) => {
    let body = req.body;

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    
    Categoria.findById(body.categoria, (err, categoriaDB ) => {
        if(err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'La categoria no existe'
                }
            });
        }
        producto.save({}, (err, productoDB) => {
            if(err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            res.status(201).json({
                ok: true,
                producto: productoDB
            });
        });
    });
});

// ===========================
//  Actualizar un producto
// ===========================
app.put('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let body = req.body;

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true })
        .populate('usuario', 'nombre email')
        .populate('categoria', 'nombre')
        .exec( (err, productoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if(!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }
        res.json({
            ok: true,
            producto: productoDB
        });
    });
});

// ===========================
//  Borrar un producto
// ===========================
app.delete('/productos/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    let disponible = { 
        disponible : false 
    }

    Producto.findByIdAndUpdate(id, disponible, {run: true}, (err, productoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'ID no existe'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoBorrado,
        })
    });
});



module.exports = app;