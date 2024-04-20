const readline = require('readline');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const packageDefinition = protoLoader.loadSync('warehouse.proto');
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const client = new warehouseProto.Warehouse('localhost:50052', grpc.credentials.createInsecure());

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

// Main function to run the menu options loop
async function main() {
    let choice = '';
    while (choice !== '5') {
        console.log('######-WAREHOUSE-######');
        console.log('Select an action:');
        console.log('1: Check Stock Level');
        console.log('2: Set Stock Alert');
        console.log('3: Pick Item');
        console.log('4: Place Order');
        console.log('5: Exit');
        console.log('#######################');

        choice = await askQuestion('Enter choice: ');

        switch (choice) {

            case '1':
                // Check Stock Level - Return all products and current data
                await new Promise(resolve => {
                    client.CheckStockLevel({}, (error, response) => {
                        if (error) {
                            console.error(error);
                        } else {
                            console.log('Stock level for all products:');
                            response.products.forEach(product => {
                                console.log(`ItemID: ${product.itemId} | Name: ${product.itemName} | Qnt: ${product.itemQuantity} | Low/Max: ${product.lowQnt}/${product.overQnt}`);
                            });
                            console.log('#######################');
                        }
                        resolve();
                    });
                });
                break;

                case '2':
                    // Set Stock Alert - Can rewrite the low level stock for each product
                    const setStockAlertItemId = parseInt(await askQuestion('Enter item ID: '), 10);
                    const newLowQnt = parseInt(await askQuestion('Enter new low stock alert quantity: '), 10);
                
                    await new Promise(resolve => {
                        client.SetStockAlert({ itemId: setStockAlertItemId, newLowQnt: newLowQnt }, (error, response) => {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log('Update Alert:', response.message);
                                console.log('#######################');
                            }
                            resolve();
                        });
                    });
                    break;

            case '3':
                // Pick Item - Colect/Pick item to be send to client
                const pickItemId = parseInt(await askQuestion('Enter item ID: '), 10);
                const quantityToPick = parseInt(await askQuestion('Enter quantity to pick: '), 10);

                await new Promise(resolve => {
                    client.PickItem({ itemId: pickItemId, quantityToPick: quantityToPick }, (error, response) => {
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
                // Place Order - Request new product to replace
                const placeOrderItemId = await askQuestion('Enter item ID: ');
                const quantityToOrder = parseInt(await askQuestion('Enter quantity to order: '), 10);
                await new Promise(resolve => {
                    client.PlaceOrder({ itemId: placeOrderItemId, quantityToOrder: quantityToOrder }, (error, response) => {
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
                // Close the loop and the client side server. (Reset the data)
                console.log('Exiting...');
                break;

            default:
                // Invalid choice message.
                console.log('Invalid choice');
                break;
        }
    }
    rl.close();
}

main();
