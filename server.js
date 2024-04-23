const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('warehouse.proto', {});
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const server = new grpc.Server();

// Desmonstrative Products Array List
const products = [
    { itemId: 1, itemName: "Gold Ring", itemQuantity: 20, lowQnt: 5, overQnt: 100 },
    { itemId: 2, itemName: "Silver Ring", itemQuantity: 10, lowQnt: 5, overQnt: 100 },
    { itemId: 3, itemName: "Platinum Bracelet", itemQuantity: 15, lowQnt: 5, overQnt: 100 },
    { itemId: 4, itemName: "Diamond Necklace", itemQuantity: 25, lowQnt: 5, overQnt: 100 },
    { itemId: 5, itemName: "Ruby Earrings", itemQuantity: 18, lowQnt: 5, overQnt: 100 },
    { itemId: 6, itemName: "Sapphire Pendant", itemQuantity: 12, lowQnt: 5, overQnt: 100 },
    { itemId: 7, itemName: "Emerald Brooch", itemQuantity: 8, lowQnt: 5, overQnt: 100 },
    { itemId: 8, itemName: "Pearl Tiara", itemQuantity: 30, lowQnt: 5, overQnt: 100 },
    { itemId: 9, itemName: "Amethyst Bracelet", itemQuantity: 22, lowQnt: 5, overQnt: 100 },
    { itemId: 10, itemName: "Opal Ring", itemQuantity: 17, lowQnt: 5, overQnt: 100 },
];

// Services
server.addService(warehouseProto.Warehouse.service, {

    // Option 00 - Automates Warehouse System to Pick requested products and handle with stock level to place auto repo orders
    AutomateWarehouse: async (call, callback) => {
        console.log('Automate Warehouse request received.');
        while (true) {
            // Logic for AutomateWarehouse
            const randomItemId = Math.floor(Math.random() * 10) + 1;
            const randomQuantity = Math.floor(Math.random() * 10) + 1;

            const productIndex = products.findIndex(product => product.itemId === randomItemId);
            if (productIndex !== -1) {

                if (products[productIndex].itemQuantity >= randomQuantity) {
                    // If enought stock. Pick the quantity of requeste item
                    products[productIndex].itemQuantity -= randomQuantity;
                    const prodName = products[productIndex].itemName;
                    // Check if the remaining stock has reached or is below the alert level (lowQty)
                    if (products[productIndex].itemQuantity <= products[productIndex].lowQnt) {
                        // If stock reaches the alert level, place an emergency order for 25 more products
                        const emergencyQuantity = 25;
                        products[productIndex].itemQuantity += emergencyQuantity;
                        const message = `Requested itemId ${randomItemId} (${prodName}) - Total of ${randomQuantity} items picked.`
                        const alertMessage = `Low Stock Alert! Emergency order placed for Item ID ${randomItemId} (${prodName}) - More ${emergencyQuantity} additional items ordered.`;
                        console.log(message + '\n' + alertMessage);
                        callback(null, { message: message + '\n' + alertMessage});
                    } else {
                        const message = `Requested itemId ${randomItemId} (${prodName}) - Total of ${randomQuantity} items picked.`
                        console.log(message);
                        callback(null, { message: message });
                    }
                } else {
                    // If no sufficient stock. Auto make a new order
                    const quantityToOrder = products[productIndex].overQnt - products[productIndex].itemQuantity;
                    products[productIndex].itemQuantity = products[productIndex].overQnt;
                    const prodName = products[productIndex].itemName;
                    const message = `No enought stock for Item ID ${randomItemId} (${prodName}). Placed repo order of more ${quantityToOrder} items.`;
                    console.log(message);
                    callback(null, { message: message });
                }
            }

            // Wait 06 seconds
            await new Promise(resolve => setTimeout(resolve, 6000));

            // Check if client request to stop
            if (call.cancelled) {
                console.log('Automate Warehouse stopped by client.');
                break;
            }
        }
        callback(null, { message: 'Automate Warehouse stopped.' });
    },

    // Option 01 - Check Stock Level return the products
    CheckStockLevel: (call, callback) => {
        console.log('Client request option 01.');
        // Return products list
        callback(null, { products: products.map(product => ({
            itemId: product.itemId,
            itemName: product.itemName,
            itemQuantity: product.itemQuantity,
            lowQnt: product.lowQnt,
            overQnt: product.overQnt
        })) });
    },

    // Option 02 - Will define new Low Stock Alert for specific product
    SetStockAlert: (call, callback) => {
        console.log('Client request option 02.');
        // Logic for setting stock alert
        const itemId = call.request.itemId;
        console.log('Item ID call: ' + itemId);
        const newLowQnt = call.request.newLowQnt;
        console.log('New low: ' + newLowQnt);
    
        const productIndex = products.findIndex(product => product.itemId === parseInt(itemId));
        if (productIndex !== -1) {
            products[productIndex].lowQnt = newLowQnt;
            const message = `Stock alert for ${products[productIndex].itemName} updated to ${newLowQnt}.`;
            callback(null, { message: message });
        } else {
            const message = 'Product not found.';
            callback(null, { message: message });
        }
    },
  
    // Option 03 - Will colect/pick a item from stock
    PickItem: (call, callback) => {
        console.log('Client request option 03.');
        const itemId = call.request.itemId;
        console.log('Item ID call: ' + itemId);
        const quantityToPick = call.request.quantityToPick;
        console.log('Quantity to pick: ' + quantityToPick);

        // Find product by ID
        const productIndex = products.findIndex(product => product.itemId === parseInt(itemId));
        console.log('productIndex: ' + productIndex);

        // Check if is a valid product ID
        if (productIndex !== -1) {
            if (products[productIndex].itemQuantity >= quantityToPick) {
                // Calculate new quantity by subtracting quantityToPick from current quantity
                const newQuantity = products[productIndex].itemQuantity - quantityToPick;
                // Update the product quantity in the products array
                products[productIndex].itemQuantity = newQuantity;
                
                // Check if send a Low Stock Alert
                const threshold = products[productIndex].lowQnt;
                if (newQuantity < threshold) {
                    const message = `Picked ${quantityToPick} of ${products[productIndex].itemName}. Low Stock Alert! Only left: ${newQuantity}.`;
                    callback(null, { message: message });
                } else {
                    const message = `Picked ${quantityToPick} of ${products[productIndex].itemName}. Total quantity remaining: ${newQuantity}.`;
                    callback(null, { message: message });
                }  
            } else {
                const message = 'Not enough quantity in stock.';
                callback(null, { message: message });
            }
        } else {
            const message = 'Product not found.';
            callback(null, { message: message });
        }
    },

    // Option 04 - Will place a new product order to stock
    PlaceOrder: (call, callback) => {
        console.log('Client request option 04.');
        // Logic to add a product to stock
        const itemId = call.request.itemId;
        console.log('Item ID call: ' + itemId);
        const quantityToOrder = call.request.quantityToOrder;
        console.log('Quantity to order: ' + quantityToOrder);
  
        // Find product by ID
        const productIndex = products.findIndex(product => product.itemId === parseInt(itemId));
        console.log('productIndex: ' + productIndex);
  
        // Check if is a valid product ID
        if (productIndex !== -1) {
            if (products[productIndex].itemQuantity <= 100) {
                // Calculate new quantity by adding quantityToOrder from current quantity
                const newQuantity = products[productIndex].itemQuantity + quantityToOrder;
                // Update the product quantity in the products array
                products[productIndex].itemQuantity = newQuantity;
                const message = `Order more ${quantityToOrder} of ${products[productIndex].itemName}. Total quantity updated: ${newQuantity}.`;
                callback(null, { message: message });
            } else {
                const message = 'Not enough space in stock for this product.';
                callback(null, { message: message });
            }
        } else {
            const message = 'Product not found.';
            callback(null, { message: message });
        }
    }

});

// Server
server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err != null) {
    console.error(err);
    return;
  }
  console.log(`Server running at http://127.0.0.1:${port}`);
});
