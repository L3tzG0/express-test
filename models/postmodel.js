import mongoose, {Schema} from "mongoose";

const PostSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        comments: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Comment"
            }
        ]
    },
    {
        timestamps: true
    }
)

const Post = mongoose.model("Post", PostSchema)

export default Post