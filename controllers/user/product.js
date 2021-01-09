const path = require('path');
const rootdir = require('../../helpers/rootdir');
const config = require(path.join(rootdir, 'config.json'));

// Models
const Product = require(path.join(rootdir, 'models/product'));

exports.getProducts = (req, res, next) => {
    Product.find()
        .then((products) => {
            res.render(path.join(config.theme.name, 'products'), {
                pageTitle: 'Products',
                path: '/dashboard/products',
                products: products
            });
        })
        .catch((err) => console.log(err));
};

exports.getAddProduct = (req, res, next) => {
    res.render(path.join(config.theme.name, 'edit-product'), {
        pageTitle: 'Add Product',
        path: '/dashboard/products/add',
        editing: false,
        formAction: '/dashboard/products/add'
    });
};

exports.postAddProduct = (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;
    const type = req.body.type;
    const price = req.body.price;
    const stock = req.body.stock;
    const imageUrl = req.body.imageUrl;
    
    const product = new Product({name: name, description: description, type: type, price: price, stock: stock, imageUrl: imageUrl, userId: req.user});
    product.save()
        .then(result => {
            res.redirect('/dashboard/products');
        })
        .catch(err => console.log(err));
};

exports.getEditProduct = (req, res, next) => {
    const productId = req.params.productId;
    const editMode = req.query.edit;

    if(!editMode) {
        return res.redirect('/dashboard/products');
    }

    Product.findById(productId)
        .then(product => {
            if(!product) {
                return res.redirect('/dashboard/products');
            }
            res.render(path.join(config.theme.name, 'edit-product'), {
                pageTitle: 'Add Product',
                path: '/dashboard/products/add',
                editing: editMode,
                formAction: '/dashboard/products/edit',
                product: product                
            });
        })
        .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
    const productId = req.body.productId;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
    const updatedType = req.body.type;
    const updatedPrice = req.body.price;
    const updatedStock = req.body.stock;
    const updatedImageUrl = req.body.imageUrl;

    Product.findById(productId)
        .then(product => {
            product.name = updatedName;
            product.description = updatedDescription;
            product.type = updatedType;
            product.price = updatedPrice;
            product.stock = updatedStock;
            product.imageUrl = updatedImageUrl;
            return product.save();
        })
        .then(result => {
            res.redirect('/dashboard/products');
        })
        .catch(err => console.log(err));
};

exports.deleteProduct = (req, res, next) => {
    const productId = req.body.productId;
    Product.findByIdAndRemove(productId)
        .then(result => {
            res.redirect('/dashboard/products');
        })
        .catch(err => console.log(err));
};
