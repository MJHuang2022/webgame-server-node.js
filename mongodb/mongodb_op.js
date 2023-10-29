const mongoose = require('mongoose');
const config = require('config');

class MongoDBConnection {
  constructor() {
    this.dbUrl = `mongodb+srv://${config.get("MongoDB.User")}:${config.get("MongoDB.Password")}@${config.get("MongoDB.Url")}`;
  }

  async connect() {
    try {
     await mongoose.connect(this.dbUrl);
     console.log("Success to connect to db....");
   } catch (error) {
     throw Error(`Cant connect to db...${this.dbUrl}`);
   }
 }
 
 async disconnect() {
   try {
     await mongoose.disconnect();
     console.log("success to disconnect db...");
   } catch (error) {
     throw Error('Failed to disconnect');
   }
 }
}

const dbConnection = new MongoDBConnection();

module.exports = dbConnection;