import { Request, Response, NextFunction } from 'express';
import userModel from '../auth/auth.model';
import globalService from '../utils/global.services';
import error from 'http-errors';
const GlobalService = new globalService();

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        //get access token from headers
        const id = GlobalService.getUser(req.headers.authorization);
        const user = await userModel.findOne({ _id: id });
        //send error if user not found
        if (!user) throw new error.Unauthorized('Invalid Email/Password');
        // if user found but is not and admin then deny acccess
        if (user.isAdmin === false) {
            throw new error.Forbidden('Access Not Allowed.');
        } else if (user.isAdmin === true) {
            //if user found and is an admin then give access to the next middleware
            next();
        }
    } catch (err) {
        next(err);
    }
};
export default { isAdmin };
