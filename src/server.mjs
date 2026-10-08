import https from 'https';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import config from './config.mjs';
import routes from './controllers/routes.mjs';

const Server = class Server {
    constructor(){
        this.app = express();
        this.config = config[process.argv[2]] || config.developement;
        this.connect = null;
    }

    async dbConnect() {
        try {
            const host = this.config.mongodb;

            this.connect = await mongoose.createConnection(host);

            const close = () => this.connect.close()
                .then(() => console.log('[CLOSE] api dbConnect() close() -> mongodb closed'))
                .catch((error) => console.error('[ERROR] api dbConnect() close() -> mongodb error', error));

            this.connect.on('connected', () => { console.log('tu es bien connecté'); });

            this.connect.on('error', (err) => {
                setTimeout(() => {
                    console.log('[ERROR] api dbConnect() -> mongodb error');
                    this.connect = this.dbConnect();
                }, 5000);
            });

            this.connect.on('disconnected', (err) => {
                setTimeout(() => {
                    console.log('[ERROR] api dbConnect() -> mongodb disconnected');
                    this.connect = this.dbConnect();
                }, 5000);
            });

            process.on('SIGINT', async () => {
                await close();
                process.exit(0);
            });
        } catch (err) {
            console.error(`[ERROR] api dbConnect() -> ${err}`);
        }
    }

    middleware(){
	this.app.use(helmet());
        this.app.use(cors({origin: 'http://localhost:3000'} ));
	this.app.use(express.json());
        this.app.use(express.urlencoded({extended: true}));
        this.app.use(rateLimit({
            windowMs: 60 * 60 * 1000,
            max: 100,
            standardHeaders: true,
            legacyHeaders: false,
            message: { code: 429, message: 'Trop de requêtes, réessaie plus tard' }
        }));
    }

    routes(){
        new routes.Auth(this.app, this.connect);
        new routes.Users(this.app, this.connect);
        new routes.Albums(this.app, this.connect);
        new routes.Photos(this.app, this.connect);
        new routes.Events(this.app, this.connect);
        new routes.Groups(this.app, this.connect);
        new routes.Threads(this.app, this.connect);
        new routes.EventAlbums(this.app, this.connect);
        new routes.EventPhotos(this.app, this.connect);
        new routes.Polls(this.app, this.connect);
        new routes.Tickets(this.app, this.connect);

        this.app.use((req, res) => {
            res.status(404).json({
                code: 404,
                message: 'Not Found'
            })
        });

        this.app.use((err, req, res, next) => {
            console.error('[ERROR]', err);
            res.status(err.status || 500).json({
                code: err.status || 500,
                message: 'Internal Server Error'
            });
        });
    }

    async run() {
        try {
            await this.dbConnect();
            this.middleware();
            this.routes();

            const httpsOptions = {
                key: fs.readFileSync('./certs/key.pem'),
                cert: fs.readFileSync('./certs/cert.pem')
            };
            https.createServer(httpsOptions, this.app).listen(this.config.port, () => {
                console.log(`HTTPS en écoute sur le port ${this.config.port}`);
            });
        } catch (err) {
            console.error(err);
        }
    }
};

export default Server;
