var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/TodoApp', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to mongodb'))
  .catch((e) => console.log(e));

module.exports = { mongoose };
