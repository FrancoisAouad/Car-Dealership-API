import express, { Router, Request, Response, NextFunction } from 'express';
import countryService from './country.services';
import Roles from '../middleware/roles';
const CountryService = new countryService();

class Controller {
    protected router: Router;
    protected path: string;
    protected admin: string;

    constructor() {
        this.router = express.Router();
        this.path = 'country';
        this.admin = '/admin';
        this.initializeRoutes();
        this.initializeAdminRoutes();
    }
    async addCountry(req: Request, res: Response, next: NextFunction) {
        try {
            await CountryService.addCountry(req.body);
            res.status(201).json({ success: true, message: 'Country added!' });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async getCountryByID(req: Request, res: Response, next: NextFunction) {
        try {
            const result: any = await CountryService.getCountryByID(req.params);
            res.status(200).json({ success: true, data: JSON.parse(result) });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async editCountry(req: Request, res: Response, next: NextFunction) {
        try {
            await CountryService.editCountry(req.body, req.params);
            res.status(200).json({
                success: true,
                message: 'Country updated!',
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async deleteCountry(req: Request, res: Response, next: NextFunction) {
        try {
            await CountryService.deleteCountry(req.params);
            res.status(200).json({
                success: true,
                message: 'Country deleted!',
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async getAllCountries(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await CountryService.getAllCountries(req.body);
            res.status(200).json({ success: true, data: result });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    initializeRoutes() {
        // this.router.post(`${this.admin}/${this.path}`, this.addCountry);
        // this.router.delete(
        //     `${this.admin}/${this.path}/:countryId`,
        //     Roles.isAdmin,
        //     this.deleteCountry
        // );
        // this.router.put(
        //     `${this.admin}/${this.path}/:countryId`,
        //     Roles.isAdmin,
        //     this.editCountry
        // );
        // this.router.get(
        //     `${this.admin}/countries`,
        //     Roles.isAdmin,
        //     this.getAllCountries
        // );
        this.router.get(`/countries`, this.getAllCountries);
        this.router.get(`/${this.path}/:countryId`, this.getCountryByID);
        // this.router.get(
        //     `${this.admin}/${this.path}/:countryId`,
        //     Roles.isAdmin,
        //     this.getCountryByID
        // );
    }
    initializeAdminRoutes() {
        this.router.post(`${this.admin}/${this.path}`, this.addCountry);
        this.router.delete(
            `${this.admin}/${this.path}/:countryId`,
            Roles.isAdmin,
            this.deleteCountry
        );
        this.router.put(
            `${this.admin}/${this.path}/:countryId`,
            Roles.isAdmin,
            this.editCountry
        );
        this.router.get(
            `${this.admin}/countries`,
            Roles.isAdmin,
            this.getAllCountries
        );
        this.router.get(
            `${this.admin}/${this.path}/:countryId`,
            Roles.isAdmin,
            this.getCountryByID
        );
    }
}
export default Controller;
