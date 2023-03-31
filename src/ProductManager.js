import fs from 'fs/promises'
import crypto from 'crypto'

export class ProductManager {
    constructor(path) {
        this.path = path
    }
    async getProducts() {
        try {
            const db = await fs.readFile(this.path)
            return await JSON.parse(db)
        } catch (error) {
            console.error(`Error reading file ${this.path}: ${error}`)
            throw error
        }
    }
    async addProduct(product) {
        if (!product.title || !product.description || !product.price || !product.status || !product.category || !product.code || !product.stock) {
            throw new Error('All fields are required')
        } else {
            const allProducts = await this.getProducts();
            const newProduct = {
                title: product.title,
                description: product.description,
                price: product.price,
                status: !!parseInt(product.status),
                category: product.category,
                thumbnail: product.thumbnail || [],
                code: product.code,
                stock: product.stock
            }
            if (allProducts.find(product => product.code === newProduct.code)) {
                throw new Error('Product code already exists')
            } else {
                if (typeof (newProduct.status) !== 'boolean') {
                    newProduct.status = true;
                }
                newProduct.id = crypto.randomUUID();
                newProduct.thumbnail.forEach(element => {
                    if (element.type === 'Buffer') {
                        const blob = new Blob(element.data, { type: 'image/*' });
                        const imageUrl = URL.createObjectURL(blob);
                        console.log(imageUrl);
                    }
                });
                allProducts.push(newProduct)
                await fs.writeFile(this.path, JSON.stringify(allProducts, null, 2))
                return newProduct
            }
        }
    }
    async getProductByID(id) {
        const allProducts = await this.getProducts();
        return allProducts.find(product => product.id === id) || null;
    }
    async updateProduct(id, newProps) {
        const allProducts = await this.getProducts();
        const productIndex = allProducts.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            allProducts[productIndex] = { ...allProducts[productIndex], ...newProps, ...{ "id": id } };
            await fs.writeFile(this.path, JSON.stringify(allProducts, null, 2))
            console.log('Changes has been changed succesfully');
            return allProducts[productIndex];
        } else {
            throw new Error('This product does not exist');
        }
    }
    async deleteProduct(id) {
        const allProducts = await this.getProducts();
        const productIndex = allProducts.findIndex(product => product.id === id);
        if (productIndex !== -1) {
            const deletedProduct = allProducts[productIndex];
            allProducts.splice(productIndex, 1);
            await fs.writeFile(this.path, JSON.stringify(allProducts, null, 2))
            console.log('This product has been deleted');
            return deletedProduct;
        } else {
            throw new Error('This product does not exist');
        }
    }
}