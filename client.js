const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('warehouse.proto');
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const client = new warehouseProto.Warehouse('localhost:50051', grpc.credentials.createInsecure());

client.CheckStockLevel({}, (error, response) => {
    if (error) {
        console.error(error);
    } else {
        console.log("Start");
        console.log(response.products);
        console.log("End");
    }
});
