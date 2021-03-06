const express = require('express');
const _ = require('underscore');

const { verificaToken, verificaAdmin_Role } = require('../middlewares/autenticacion');

const app = express();

let Categoria = require('../models/categoria');

// ===========================
//  Mostrar todas las categorias
// ===========================
app.get('/categoria', verificaToken,  (req, res) => {
    Categoria.find({})
        .sort('nombre') // ordenar
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categorias
        });
    });
});

// ===========================
//  Mostrar una categoria por ID
// ===========================
app.get('/categoria/:id', verificaToken, (req, res) => {
    let id = req.params.id;
    
    Categoria.findById( id )
        .populate('usuario', 'nombre email')
        .exec((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El ID no es correcto'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ===========================
//  Crear nueva categoria
// ===========================
app.post('/categoria', [verificaToken, verificaAdmin_Role], (req, res) => {
    let body = req.body;

    let categoria = new Categoria({
        nombre: body.nombre,
        descripcion: body.descripcion,
        usuario: req.usuario._id
    });

    categoria.save( (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });
    });
});

// ===========================
//  Actualizar una categoria
// ===========================
app.put('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;
    let body = _.pick(req.body, ['nombre','descripcion']);

    Categoria.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, categoriaDB) => {
        if(err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if(!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoriaDB
        });
    });
});

// ===========================
//  Borrar una categoria
// ===========================
app.delete('/categoria/:id', [verificaToken, verificaAdmin_Role], (req, res) => {
    let id = req.params.id;

    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            })
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'El id no existe'
                }
            });
        }

        res.json({
            ok: true,
            message: 'Categoria borrada'
        })
    });
});


module.exports = app;