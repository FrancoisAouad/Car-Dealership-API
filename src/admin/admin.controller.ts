import express, { Router } from 'express';
import CountryController from '../countries/country.controller';

class Controller extends CountryController {
    protected router: Router;
    protected admin: string;
    private reports: string;

    constructor() {
        super();
        this.router = express.Router();
        this.admin = '/admin';
        this.reports = 'reports';
        this.initializeRoutes();
        this.initializeAdminRoutes();
    }
    initializeAdminRoutes() {}
    initializeRoutes() {
        this.router;
    }
}
export default Controller;
