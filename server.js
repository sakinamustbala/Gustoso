
const express = require('express');
const cors = require('cors');

const connectDB = require('./project root/config/db');

const userRoutes = require('./project root/routes/userR');
const productRoutes = require('./project root/routes/productR');
const cartRoutes = require('./project root/routes/cartR');

const app = express();
app.use(cors());

connectDB()

app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
