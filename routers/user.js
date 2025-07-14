import { Router } from "express";
import bcrypt from 'bcrypt';
import User from "../models/usersmodel.js";
import passport from "../config/passport.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"

const router = Router();

router.post("/signup", async (req, res)=>{
    const {email, username, password} = req.body;
    const profileImageUrl = req.file ? req.file.location : undefined
    //const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
        username, email, password, profileImageUrl
    })
    res.status(201).json(user)
})

router.post("/login", passport.authenticate("local", { session: false }), (req, res)=>{    
    let token = null;
    if(req.user){
        const _id = req.user._id;
        const payload = {_id};
        token = jwt.sign(payload, process.env.JWT_SECRET_KEY)

    }
    res.cookie("token", token)
    res.json({message: "login success"})
})


router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // session cookie
      res.clearCookie("token");       // JWT cookie, if using it
      res.json({ message: "logout!" });
    });
  });
});



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "dhruvsm2005@gmail.com",
        pass: process.env.GOOGLE_APP_PASSWORD
    }
})
router.post("/send-email", async(req, res)=>{
    const {to, subject, text} = req.body;
    try {
        await transporter.sendMail({
            from: "dhruvsm2005@gmail.com",
            to,
            subject,
            text
        })
        res.json({success: true})
    } catch (err){
        res.status(500).json({success: false, message: err.message})
    }
})


router.get("/login/google", passport.authenticate("google", {scope: ["profile", "email"]}))

router.get("/login/google/callback",
    passport.authenticate("google", {session: false}),
    (req, res) => {
        let token = null;
        if(req.user) {
            const _id = req.user._id;
            const payload = {_id};
            token = jwt.sign(payload, process.env.JWT_SECRET_KEY)
        }
        //res.cookie("token", token)
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production with HTTPS
            maxAge: 3600000, // 1 hour
        });
        res.json({message: 'login success!'})
    }
)


export default router;