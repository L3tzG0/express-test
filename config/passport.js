// passport.js
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import User from "../models/usersmodel.js";
import { ExtractJwt, Strategy as JwtStrategy } from "passport-jwt";
import { Strategy as GoogleStrategy } from 'passport-google-oauth2'
import dotenv from 'dotenv'

dotenv.config()

const config = {
    usernameField: "email",
    passwordField: "password"
}

passport.use(
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                const user = await User.findOne({ email });
                if (!user) {
                    return done(null, false, { message: "User not found" });
                }

                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    return done(null, false, { message: "Invalid password" });
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }
    )
);
// passport.serializeUser((user, done) => {
//   done(null, user._id); // Store the user's ID in the session
// });

// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       return done(null, false);
//     }
//     done(null, user); // Attach the full user object to req.user
//   } catch (err) {
//     done(err);
//   }
// });

const jwtOption = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req.cookies.token || null
    ]),
    secretOrKey: process.env.JWT_SECRET_KEY
}
const googleOption = {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: 'http://localhost:3000/auth/login/google/callback',
    passReqToCallback: true
}

passport.use(
    "jwt",
    new JwtStrategy(jwtOption, async (user, done) => {
        console.log('asdasd')
        const foundUser = await User.findById(user._id);
        if(!foundUser) 
            return done(null, false, {message: "User not found"})
        done(null, foundUser)
    })
)

passport.use(
    new GoogleStrategy(googleOption, async (accessToken, refreshToken, profile, done) => {
        try{
            const foundUser = await User.findOne({
                socialId: profile._json.sub,
                registerType: "google"
            })
            if(foundUser) {
                return done(null, foundUser)
            }
            const newUser = await User.create({
                email: profile._json.email,
                username: profile._json.name,
                socialId: profile._json.sub,
                registerType: "google"
            })

            return done(null, newUser)

        } catch (e) {
            return done(e)
        }
    })
)

export default passport