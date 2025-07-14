import passport from "../config/passport.js";
import Post from "../models/postmodel.js";

export const isUserValidator = passport.authenticate("jwt", { session: false });

export async function isSameUserValidator(req, res, next) {
    const user = req.user;
    if (!user) {
        return res.status(401).json("Not Authorized");
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
        return res.status(404).json("Post not found");
    }

    if (!post.author.equals(user._id)) {
        return res.status(403).json("Forbidden: Not your post");
    }

    next();
}


/*import Post from "../models/postmodel.js";


export async function isUserValidator (req, res, next){
    const user = req.user
    if(!user){
        res.json("Not Authorized")
    }
    next()
}

export async function isSameUserValidator(req, res, next) {
    const user = req.user;
    if(!user){
        res.json("Not Authorized")
    }
    const post = await Post.findById(req.params.postId)

    if(!post.author._id.equals(user._id)){
        res.status(403).json("Not Authorized")
    }
    next();
}*/