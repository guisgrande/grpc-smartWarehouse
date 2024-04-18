const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const packageDefinition = protoLoader.loadSync('warehouse.proto', {});
const warehouseProto = grpc.loadPackageDefinition(packageDefinition).warehouse;

const server = new grpc.Server();
const products = "Itens";

server.addService(warehouseProto.Warehouse.service, {

    CheckStockLevel: (call, callback) => {
        console.log('Stock');
        callback(null, products);
    },

});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err != null) {
    console.error(err);
    return;
  }
  server.start();
  console.log(`Server running at http://127.0.0.1:${port}`);
});
