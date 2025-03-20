const express = require("express");
const app = express();

const { getAllProducts, addProduct, deleteProduct } = require("./data.model");
const { uploadFile } = require("./file.service");

app.use(express.json({ extented: false }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static('.views'));
app.set('view engine', 'ejs');
app.set('views', './views');

// Cấu hình multer
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn dung lượng file tối đa là 5MB
});


const PORT = process.env.PORT | 3000;

app.get('/', async(request, response) => {
    try {
        const products = await getAllProducts();
        console.log("Products data:", products);
        return response.render('index', { products });
    } catch (err) {
        console.error("Error fetching products:", err);
        response.send("Internal Server Error");
    }
});

app.post('/add', upload.single('productImage'), async(request, response) => {
    try {

        const { productID, productName, productQuantity } = request.body;
        if (!productID || !productName || !productQuantity) {
            return response.status(400).send("Missing required fields: productID, productName, productQuantity");
        }

        //Kiểm tra số lượng
        const quantity = parseInt(productQuantity, 10);
        if (isNaN(quantity)) {
            return response.status(400).send("Invalid quantity value, must be a number");
        }

        //Kiểm tra file
        if (!request.file) {
            return response.status(400).send("No file uploaded!");
        }

        const imageURL = await uploadFile(request.file);

        await addProduct(productID, productName, productQuantity, imageURL);

        console.log("Added product:", { productID, productName, productQuantity, imageURL });

        return response.redirect('/');

    } catch (error) {
        console.error("Error adding product:", error);
        if (error.message.includes('File too large')) {
            return response.status(400).send("File size exceeds the limit of 5MB");
        }
        response.status(500).send("Internal Server Error: " + error.message);
    }
});

app.post('/delete', async(request, response) => {
    const { productID, productName } = request.body;

    if (!productID) {
        return response.status(400).send("Missing required field: productID");
    }

    try {
        await deleteProduct(productID, productName);
        console.log("Deleted product:", { productID, productName });
        return response.redirect('/');
    } catch (err) {
        console.error("Error deleting product:", err);
        return response.status(500).send("Internal Server Error");
    }
});

process.removeAllListeners('warning');

app.listen(PORT, () => {
    console.log("Server is running on port 3000!")
})