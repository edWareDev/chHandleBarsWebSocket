const serverSocket = io('http://localhost:8080')

const plantillaProductos = `
{{#if hayProductos}}
<ul>
    {{#each productos}}
    <li>
        <h3>{{this.title}} - {{this.description}}</h3>
        <a href="#">Precio: $ {{this.price}}</a>
    </li>
    {{/each}}
</ul>
{{else}}
<p>No hay Productos</p>
{{/if}}
`

serverSocket.on('mensajeDesdeServidor', datosAdjuntos => {
    console.log(datosAdjuntos);
})
serverSocket.on('error', datosAdjuntos => {
    console.error(datosAdjuntos);
})
serverSocket.on('actualizarProductos', productos => {
    const divProductos = document.querySelector('.productos')
    const renderProducts = Handlebars.compile(plantillaProductos);
    if (divProductos) {
        divProductos.innerHTML = renderProducts({
            hayProductos: productos.length > 0,
            productos
        })
    }
})

const btnAgregar = document.querySelector('#btnAgregar');
if (btnAgregar) {
    btnAgregar.addEventListener('click', () => {
        const newProduct = {}
        newProduct.title = document.querySelector('#productName').value
        newProduct.description = document.querySelector('#productDescription').value
        newProduct.price = document.querySelector('#productPrice').value
        newProduct.status = document.querySelector('#productStatus').value
        newProduct.category = document.querySelector('#productCategory').value
        // newProduct.thumbnail = document.querySelector('#productThumbnail').files
        newProduct.code = document.querySelector('#productCode').value
        newProduct.stock = document.querySelector('#productStock').value
        serverSocket.emit('addProduct', newProduct)
    })
}