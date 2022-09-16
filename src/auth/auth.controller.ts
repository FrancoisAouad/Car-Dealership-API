import express, { Router, Request, Response, NextFunction } from 'express';
import authService from './auth.services';
import configJWT from '../lib/jwt/config.jwt';
import verifyJWT from '../lib/jwt/verify.jwt';
const AuthService = new authService();

class Controller {
    private router: Router;
    private path: string;

    constructor() {
        this.router = express.Router();
        this.path = '/auth';
        this.initializeRoutes();
    }
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.signup(req.body, req.headers);
            res.status(201).json({
                success: true,
                message: 'User created!',
                data: result,
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.login(req.body);
            res.status(200).json({ data: result });
        } catch (e: any) {
            console.log(e);
            return res.send(e);
        }
    }
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body.refreshToken);
            const result = await AuthService.refreshToken(
                req.body.refreshToken
            );
            res.status(200).json({ data: result });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            await AuthService.logout(req.body);
            res.status(204).json({ success: true });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result: any = await AuthService.forgotPassword(req.headers);

            res.status(200).json({
                sucess: true,
                message: `resetpass email sent to ${result.email}`,
                data: result,
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await AuthService.resetPassword(
                req.params,
                req.body,
                req.headers.authorization
            );
            res.status(200).json({
                success: true,
                message: 'password successfully reset.',
                data: result,
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }
    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            await AuthService.verifyEmail(req.headers.authorization);
            res.status(200).json({
                success: true,
            });
        } catch (e) {
            console.log(e);
            return res.send(e);
        }
    }

    initializeRoutes() {
        this.router.post(`${this.path}/register`, this.signup);
        this.router.post(`${this.path}/login`, this.login);
        this.router.post(
            `${this.path}/refreshtoken`,
            verifyJWT.verifyAccessToken,
            this.refreshToken
        );
        this.router.post(
            `${this.path}/forgotpassword`,
            verifyJWT.verifyAccessToken,
            // isEmailVerified,
            this.forgotPassword
        );
        this.router.delete(
            `${this.path}/logout`,
            verifyJWT.verifyAccessToken,
            // isEmailVerified,
            this.logout
        );
        this.router.get(`${this.path}/verifyemail`, this.verifyEmail);
        this.router.patch(
            `${this.path}/resetpassword/:token`,
            this.resetPassword
        );
    }
}
export default Controller;
