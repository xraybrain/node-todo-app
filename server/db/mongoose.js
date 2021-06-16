var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log('connected to mongodb'))
  .catch((e) => console.log(e));

module.exports = { mongoose };
