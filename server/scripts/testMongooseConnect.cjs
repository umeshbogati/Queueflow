const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/queueflow';
console.log('Testing mongoose connect to', uri);
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('MONGOOSE_OK');
    return mongoose.connection.close();
  })
  .catch((err) => {
    console.error('MONGOOSE_ERR', err);
    process.exit(1);
  });
