require('dotenv').config();
const mongoose = require('mongoose');

const app = require('./app');

mongoose
  .connect(process.env.MONGO_URi)
  .then(console.log('Connected to DB...'))
  .catch((err) => console.log('Failed to connect to db', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
