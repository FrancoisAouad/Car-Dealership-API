import userModel from './auth.model';
import error from 'http-errors';
import client from '../lib/db/redis.connection';
import globalService from '../utils/global.services';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import sendMail from '../utils/nodemailer';
import configJWT from '../lib/jwt/config.jwt';
import verifyJWT from '../lib/jwt/verify.jwt';
const GlobalService = new globalService();

class Service {
    constructor() {}
    async signup(body: any, header: any) {
        const newToken = crypto.randomBytes(64).toString('hex');

        const exists = await userModel.findOne({ email: body.email });

        if (exists)
            throw new error.Conflict(
                `${body.email} has already been registered`
            );
        const hashedPassword = await this.hashPassword(body.password);

        const addedUser = await userModel.create({
            name: body.name,
            email: body.email,
            emailToken: newToken,
            password: hashedPassword,
        });

        const accessToken = configJWT.setAccessToken(addedUser._id.toString());
        const refreshToken = await configJWT.setRefreshToken(
            addedUser._id.toString()
        );

        sendMail({
            from: process.env.NODEMAILER_USER,
            to: body.email,
            subject: 'Email Verification',
            html: `<h2> Welcome, ${body.name}!</h2>
          <br/>
              <p>Thank you for registering, you are almost done. Please read the below message to continue.</p>
              <br/>
             <p>In order to confirm your email, kindly click the verification link below.</p>
              <br/>
            <a href="http://${header.host}/api/v1/auth/verify?token=${addedUser.emailToken}">Click here to verify</a>`,
        });
        return { accessToken, refreshToken };
    }
    async login(body: any) {
        //check if user exists in db
        const user = await userModel.findOne({ email: body.email });
        if (!user) throw new error.NotFound('wrong email/pass');
        //check if hashed password matches with user input
        const isMatch = await this.isValidPassword(
            body.password,
            user.password
        );
        //throw error if pass doesnt match
        if (isMatch === false) throw new error.Unauthorized('wrong email/pass');
        //set tokens to be sent to client side
        const accessToken = configJWT.setAccessToken(user._id.toString());
        const refreshToken = await configJWT.setRefreshToken(
            user._id.toString()
        );

        return { accessToken, refreshToken };
    }
    async refreshToken(body: any) {
        if (!body) throw new error.BadRequest('Bad Request');
        //verify refresh token
        const userId: any = await verifyJWT.verifyRefreshToken(body);
        //set new access token
        const accessToken = configJWT.setAccessToken(userId);
        //set new refresh token
        const refToken = await configJWT.setRefreshToken(userId);
        //send tokens to client side
        return { accessToken: accessToken, refreshToken: refToken };
    }
    async logout(body: any) {
        //check refresh token
        const { refreshToken } = body;
        //return error if not found
        if (!refreshToken) throw new error.BadRequest('Bad Request');
        //verify the refresh token if found
        const userId = await verifyJWT.verifyRefreshToken(refreshToken);
        //delete refresh token to logout
        client.DEL(userId, (err: any, val: any) => {
            if (err) throw new error.Unauthorized('Unauthorizeed');
        });
        return true;
    }
    async forgotPassword(header: any) {
        //get logged in user
        // const authHeader = req.headers['authorization'];
        const id = GlobalService.getUser(header.authorization);
        //check if user exists
        const user: any = await userModel.findOne({ _id: id });
        //return error if user not found
        if (!user) throw new error.Unauthorized('unauthorized');

        const passwordToken = await configJWT.setResetPasswordToken(user.id);

        sendMail({
            from: process.env.NODEMAILER_USER,
            to: user.email,
            subject: 'Reset Password',
            html: `<h2> Dear, ${user.name}.</h2>
        <br/>
            <p>Your reset password link is available below.</p>
            <br/>
            <a href="http://${header.host}/api/v1/auth/resetPassword/${passwordToken}">Reset</a>`,
        });

        //send message that email was sent
        return user;
    }
    async resetPassword(params: any, body: any, header: any) {
        const { token } = params;
        //validate new pass

        //get user id
        // const authHeader = req.headers['authorization'];
        const id = GlobalService.getUser(header);
        //check if user found
        const user = await userModel.findOne({ _id: id });
        if (!user) throw new error.NotFound('user not found..');
        //verify that the password token is valid
        // await verifyResetPasswordToken(token);
        //salt and hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password, salt);
        user.password = hashedPassword;
        //update password in database
        return await user.save();
    }
    async verifyEmail(query: any) {
        //check mongodb for token for this specific user
        const token = query.token;
        const user = await userModel.findOne({ emailToken: token });

        if (!user) throw new error.Unauthorized('unauthorized');
        //replace these values to show that a user is verified
        user.emailToken = 'null';
        user.isVerified = true;

        return await user.save();
    }
    async isValidPassword(password: string, hash: string) {
        return await bcrypt.compare(password, hash);
    }
    async hashPassword(password: string) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log(hashedPassword);
        return hashedPassword;
    }
}
export default Service;
