const mongoose = require('mongoose');

const connectDB = async () => {
    try{
        const cpmm = await mongoose.connect(process.env.MONGODB_URI,{
            userNewUrlParser: true,
            useUnifiedtopology: true,
        });

        console.log(`MongoDB Conectado: ${conn.connection.host}`.cyan.underline);
     
        mongoose.connection.on('error', err => {
            console.error(`Error de MongoDB: ${err}`.red);
        });

        mongoose.connection.on('disconnected', () =>  {
            console.log('MongoDB desconectado'.yellow);
        });
    
    } catch (error) {
        console.error(`Error: ${error.message}`.red);
        process.exit(1);
    }


};
module.exports = connectDB;