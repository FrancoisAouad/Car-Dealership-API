import express, { Application } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import responseTime from 'response-time';
import helmet from 'helmet';
import compression from 'compression';
import formdata from 'express-form-data';
import { sendError, errorHandler } from './utils/errors/errorHandler';
import 'colors';
dotenv.config();
class App {
    //ATTRIBUTES
    public app: Application;
    //CONSTRUCTOR
    constructor(controllers: any) {
        this.app = express();
        this.securityMiddleWares();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    //SERVER
    listen() {
        this.app.listen(process.env.PORT, () => {
            console.log(
                `Server running on port ${process.env.PORT}`.blue.italic.bold
            );
        });
    }
    //SECURITY
    securityMiddleWares() {
        this.app.use(helmet());
    }
    //MIDDLEWARE
    initializeMiddlewares() {
        if (process.env.NODE_ENV == 'development') this.app.use(morgan('dev'));
        this.app.use(compression());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(formdata.parse());
        this.app.use(responseTime());
    }
    //ERROR HANDLERS
    initializeErrorHandlers() {
        this.app.use(sendError);
        this.app.use(errorHandler);
    }
    //CONTROLLERS
    initializeControllers(controllers: any) {
        controllers.forEach((controller: any) => {
            this.app.use('/api/v1', controller.router);
        });
    }
}
export default App;
