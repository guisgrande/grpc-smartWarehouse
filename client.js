const readline = require('readline');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const packageDefinition = protoLoader.loadSync('warehouse.proto');
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const client = new warehouseProto.Warehouse('localhost:50051', grpc.credentials.createInsecure());

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    let choice = '';
    while (choice !== '5') {
        console.log('######-WAREHOUSE-######');
        console.log('Select an action:');
        console.log('1: Check Stock Level');
        console.log('2: Low Stock Alert');
        console.log('3: Pick Item');
        console.log('4: Place Order');
        console.log('5: Exit');
        console.log('#######################');

        choice = await askQuestion('Enter choice: ');

        switch (choice) {
            case '1':
                await new Promise(resolve => {
                    client.CheckStockLevel({}, (error, response) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Stock level for all products:');
                            response.products.forEach(product => {
                                console.log(`Item ID: ${product.itemId}, Item Name: ${product.itemName}, Item Quantity: ${product.itemQuantity}`);
                            });
                            console.log('#######################');
                        }
                        resolve();
                    });
                });
                break;
            case '2':
                // Low Stock Alert
                const lowStockAlertItemId = await askQuestion('Enter item ID: ');
                const threshold = parseInt(await askQuestion('Enter threshold: '), 10);
                await new Promise(resolve => {
                    client.LowStockAlert({ itemId: lowStockAlertItemId, threshold: threshold }, (error, response) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Alert:', response.message);
                            console.log('#######################');
                        }
                        resolve();
                    });
                });
                break;
            case '3':
                // Pick Item
                const pickItemId = await askQuestion('Enter item ID: ');
                await new Promise(resolve => {
                    client.PickItem({ itemId: pickItemId }, (error, response) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Message:', response.message);
                            console.log('#######################');
                        }
                        resolve();
                    });
                });
                break;
            case '4':
                // Place Order
                const placeOrderItemId = await askQuestion('Enter item ID: ');
                const quantity = parseInt(await askQuestion('Enter quantity: '), 10);
                await new Promise(resolve => {
                    client.PlaceOrder({ itemId: placeOrderItemId, quantity: quantity }, (error, response) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Message:', response.message);
                            console.log('#######################');
                        }
                        resolve();
                    });
                });
                break;
            case '5':
                console.log('Exiting...');
                break;
            default:
                console.log('Invalid choice');
                break;
        }
    }
    rl.close();
}

main();
