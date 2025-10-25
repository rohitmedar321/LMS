import express from "express";
import { checkLogin, createUser } from '../models/user.js'
import  {sendEmail} from '../models/mailer.js'
import { hash } from "../models/hash.js";
import {createToken, getToken} from "../models/token.js"



const auth = express.Router();

auth.get('/login', (req, res) => {
    res.render('login');
});
auth.post('/login', async (req, res) => {
    const data = req.body;
    console.log('Login data:', data);

    const [status, user] = await checkLogin(data.email, data.password);

    console.log('Login status:', status, 'User:', user);

    if (!status || !user) {
        return res.redirect('/login');
    }

    const token = createToken({
        id: user.id,
        username: user.name,
        email: user.email
    });

    console.log('token:', token)

    res.cookie('token', token);

    return res.redirect('/');
});

//register route
auth.get('/register', (req, res) => {
    res.render('register');
});
auth.post('/register', async (req, res) => {
    const data = req.body;
    const otp =  await sendEmail(data.email);
    data.password = await hash(data.password)
    console.log(data)

    if (!otp) {
        return res.render('register', { msg: 'Failed to send OTP. Please try again.' });
    }

    // Store OTP and email in session
    req.session.otp = otp;
    req.session.email = data.email;
    req.session.data = data;

    console.log('Sent OTP:', otp, req.session.otp);

    res.render('email_veryfy', { email: data.email }); 
});

auth.post('/verify-otp', async (req, res) => {
    const enteredOtp = req.body.otp;
    const sessionOtp = req.session.otp;
    const user = req.session.data

    console.log(user)

    console.log("otp match:",enteredOtp, sessionOtp)

    if (enteredOtp === sessionOtp) {

        let data = await createUser(user)

        let token = createToken({id:data.id, username: data.name, email: data.email})

        res.cookie('token', token, {httpOnly:true, secure: true})

        req.session.otp = null;
        res.redirect('/')

    } else {
        res.render('email_veryfy', { msg: 'Invalid OTP. Please try again.', email: req.session.email });
    }
});


export { auth };