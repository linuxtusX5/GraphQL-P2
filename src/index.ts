import express from 'express';
import cors from 'cors';
import DB from '../config/MongoDB';
import schema from './schema/types';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';

dotenv.config();
// Connect to MongoDB
DB();

const app = express();
app.use(express.json())
app.use(cors({
    credentials: true
}))

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: process.env.DEV_MODE === 'development' 
}))
const PORT = process.env.PORT || 1337

app.listen(PORT, () => {
    console.log(`Server running on ${process.env.DEV_MODE} Port ${PORT}`)
})