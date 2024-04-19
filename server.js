const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('warehouse.proto', {});
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const server = new grpc.Server();

const products = [
    { itemId: 1, itemName: "Gold Ring", itemQuantity: 20 },
    { itemId: 2, itemName: "Silver Ring", itemQuantity: 10 },
    { itemId: 3, itemName: "Platinum Bracelet", itemQuantity: 15 },
    { itemId: 4, itemName: "Diamond Necklace", itemQuantity: 25 },
    { itemId: 5, itemName: "Ruby Earrings", itemQuantity: 18 },
    { itemId: 6, itemName: "Sapphire Pendant", itemQuantity: 12 },
    { itemId: 7, itemName: "Emerald Brooch", itemQuantity: 8 },
    { itemId: 8, itemName: "Pearl Tiara", itemQuantity: 30 },
    { itemId: 9, itemName: "Amethyst Bracelet", itemQuantity: 22 },
    { itemId: 10, itemName: "Opal Ring", itemQuantity: 17 },
  ];

server.addService(warehouseProto.Warehouse.service, {

    CheckStockLevel: (call, callback) => {
        console.log('Client request option 01.');
        // Return products list
        callback(null, { products: products.map(product => ({
          itemId: product.itemId,
          itemName: product.itemName,
          itemQuantity: product.itemQuantity
        })) });
    },

    LowStockAlert: (call, callback) => {
        console.log('Client request option 02.');
        // Logic for low stock alert
        const itemId = call.request.itemId;
        const threshold = call.request.threshold;
        const message = sendLowStockAlert(itemId, threshold);
        callback(null, { message: message });
    },

    PickItem: (call, callback) => {
      console.log('Client request option 03.');
      const itemId = call.request.itemId;
      console.log('Item ID call: ' + itemId);
      const quantityToPick = call.request.quantityToPick;
      console.log('Quantity to pick: ' + quantityToPick);

      // Find product by ID
      const productIndex = products.findIndex(product => product.itemId === parseInt(itemId));
      console.log('productIndex: ' + productIndex);

      if (productIndex !== -1) {
          if (products[productIndex].itemQuantity >= quantityToPick) {
              // Calculate new quantity by subtracting quantityToPick from current quantity
              const newQuantity = products[productIndex].itemQuantity - quantityToPick;
              // Update the product quantity in the products array
              products[productIndex].itemQuantity = newQuantity;
              const message = `Picked ${quantityToPick} of ${products[productIndex].itemName}. Total quantity remaining: ${newQuantity}.`;
              callback(null, { message: message });
          } else {
              const message = 'Not enough quantity in stock.';
              callback(null, { message: message });
          }
      } else {
          const message = 'Product not found.';
          callback(null, { message: message });
      }
  },

    PlaceOrder: (call, callback) => {
        console.log('Client request option 04.');
        // Logic to add a product to stock
        const itemId = call.request.itemId;
        const quantity = call.request.quantity;
        const message = placeOrder(itemId, quantity);
        callback(null, { message: message });
    }

});

server.bindAsync('127.0.0.1:50052', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err != null) {
    console.error(err);
    return;
  }
  server.start();
  console.log(`Server running at http://127.0.0.1:${port}`);
});

function sendLowStockAlert(itemId, threshold) {
  // Logic to send low stock alert
  if (checkItemLevel(itemId) < threshold) {
    return `Low stock alert for item ${itemId}`;
  } else {
    return `Stock level for item ${itemId} is sufficient`;
  }
}

function pickItem(itemId) {
  // Logico to take/pick a product from stock
  return `Item ${itemId} picked successfully`;
}

function placeOrder(itemId, quantity) {
  // Logic to add new products into stock
  return `Order for ${quantity} of item ${itemId} placed successfully`;
}

function checkItemLevel(itemId) {
  // Lógica para verificar o nível de estoque
  // Retorna um valor fictício para fins de demonstração
  return 10;
}
