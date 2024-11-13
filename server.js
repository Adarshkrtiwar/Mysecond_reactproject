**server.js**

const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const { errorHandler, notFound } = require('./middlewares/errorMiddleware');

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error(`Error: ${error.message}`);
});

