require("dotenv").config();
const { dynamoDB } = require("./aws.helper");

// Table name in DynamoDB
const tableName = 'Products';

// Hàm lấy tất cả sản phẩm
function getAllProducts() {
    const params = {
        TableName: tableName,
    };

    return new Promise((resolve, reject) => {
        dynamoDB.scan(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(data.Items);
            }
        });
    });
}

// Hàm thêm sản phẩm
function addProduct(productID, productName, productQuantity, imageURL) {
    const quantity = parseInt(productQuantity, 10);

    const params = {
        TableName: tableName,
        Item: {
            id: parseInt(productID, 10),
            name: productName,
            quantity: quantity,
            image: imageURL,
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDB.put(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(params.Item);
            }
        });
    });
}

// Hàm xóa sản phẩm
function deleteProduct(productID, productName) {
    const params = {
        TableName: tableName,
        Key: {
            id: parseInt(productID, 10),
            name: productName
        }
    };

    return new Promise((resolve, reject) => {
        dynamoDB.delete(params, (err, data) => {
            if (err) {
                reject(err);
            } else {
                resolve(params.Key);
            }
        });
    });
}

module.exports = {
    getAllProducts,
    addProduct,
    deleteProduct
};