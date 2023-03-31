import express from 'express';
import { Server as SocketIOServer } from 'socket.io'
import { engine } from 'express-handlebars';
import { ProductManager } from './ProductManager.js';

const productManager = new ProductManager('db/database.json')


const app = express();

app.engine('handlebars', engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use(express.static('./public'))

const httpServer = app.listen(8080, () => { console.log('conectado en el puerto 8080') });

const io = new SocketIOServer(httpServer)

io.on('connection', clientSocket => {
    console.log(`Nuevo Cliente conectado! id: ${clientSocket.id}`);
    clientSocket.emit('mensajeDesdeServidor', { Conexión: 'Satisfactoria' });

    clientSocket.on('addProduct', async newProduct => {
        console.log(await newProduct);
        try {
            await productManager.addProduct(newProduct)
            io.sockets.emit('actualizarProductos', await productManager.getProducts())
        } catch (error) {
            console.log(error);
            await clientSocket.emit('error', { error: error.message });
        }
    })

})

app.get('/', async (req, res, next) => {
    const productos = await productManager.getProducts();
    res.render('home', {
        hayProductos: productos.length > 0,
        productos
    })
})

app.get('/realtimeproducts', async (req, res, next) => {
    const productos = await productManager.getProducts();
    res.render('realTimeProducts', {
        hayProductos: productos.length > 0,
        productos
    })
})