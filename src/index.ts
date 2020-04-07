import express from 'express';
import Users from './repositories/users';

const app = express();

const { PORT = 8002 } = process.env;

app.use(express.json());
new Users().attachCRUDRoutes(app);

app.all('*', (req, res) => {
    res.status(200).send('OK');
})

const server = app.listen(PORT, () => {
    console.log(`We are live on ${(server.address() as any).address} at`, (server.address() as any).port);
});