import express from 'express';
import cors from 'cors';
import helloRouter from './hello.js'
import postRouter from './routers/post.js'
import userRouter from './routers/user.js'
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from './config/passport.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// app.use(
//     session({
//         secret: 'asdasd',
//         resave: false,
//         saveUninitialized: false,
//         store: MongoStore.create({
//             mongoUrl: "mongodb://127.0.0.1:27017/express-test"
//         }),
//         cookie:{
//             httpOnly: true,
//             maxAge: 1000*60*60
//         }
//     })
// )

app.use(passport.initialize())
//app.use(passport.session())

// Protect all routes after this
app.use((req, res, next) => {
  const token = req.cookies["token"];

  if (!token) {
    return next();
  }

  passport.authenticate(
    "jwt",{session: false}
  )(req,res,next)
});


app.use('/posts', postRouter)
app.use('/hello', helloRouter);
app.use('/auth', userRouter);

//
app.get('/', (req, res) => {
    res.json({
        message: `here are queries`
    })
} )

app.get('/:id', (req, res) => {
    res.json({
        message: `this is ${req.params.id}`
    })
} )

app.post('/:id', (req, res) => {
    res.json({
        message: `this is ${req.params.id}`
    }).status(205)
} )

app.post('/', (req, res) => {
    res.json({
        message: 'post successful!'
    })
})


//app.listen(3000);

export default app;