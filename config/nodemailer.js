import { Email_pass } from "./env.js";
import nodemailer from "nodemailer";

export const accountEmail = 'demonslay565@gmail.com';

const transporter = nodemailer.createTransport( {
    service: 'gmail',
    auth: {
        user: accountEmail,
        pass: Email_pass
    }
});

export default transporter;