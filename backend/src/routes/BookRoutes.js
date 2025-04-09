import express from 'express';
import "dotenv/config";
const router = express.Router();
import cloud from '../lib/cloudinary.js';
import Book from '../models/Book.js';
import protectedRoute from '../middleware/auth.middleware.js';



router.post('/', protectedRoute, async (req, res) => {
    try {


        const { title, caption, rating, image } = req.body;
        if (!title || !caption || !rating || !image) {
            return res.status(400).json({ message: "All fields are required" })
        }

        // upload image to cloudinary
        const uploadResponse = await cloud.uploader.upload(image)
        const imageUrl = uploadResponse.secure_url;

        // save to mongodb

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        await newBook.save();
        res.status(201).json({
            message: "Book created successfully",
            book: newBook
        })



    } catch (error) {
        console.log("Error in creating book", error);
        res.status(500).json({ message: "Internal server error" })
    }
})


// pagination = infinite loading or scrolling
router.get('/', protectedRoute, async (req, res) => {
    try {

        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit

        const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "Username ProfileImage");
        const totalBooks = await Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        })

    } catch (error) {
        console.log("Error in getting Books", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

router.delete('/:id', protectedRoute, async (req, res) => {
    try {
        const bookId = await Book.findById(req.params.id);
        if (!bookId) {
            return res.status(404).json({ message: "Book not found" })
        }


        // check if user is owner of the book
        if (bookId.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" })
        }


        // delete image from cloudinary
        if (bookId.image && bookId.image.includes("cloudinary")) {
            try {
                const imageId = bookId.image.split("/").pop().split(".")[0];
                await cloud.uploader.destroy(imageId);

            } catch (error) {
                console.log("Error in deleting image from cloudinary", error);
                return res.status(500).json({ message: "Error in deleting image from cloudinary" })
            }
        }
        // delete book from mongodb 


        await bookId.deleteOne();

        res.status(200).json({ message: "Book deleted successfully" })
    } catch (error) {
        console.log("Error in deleting book", error);
        res.status(500).json({ message: "Internal server error" })
    }
})

// get recommended books by the logged in user
router.get('/user', protectedRoute, async (req, res) => {
    try {
        const books = await Book.find({user: req.user._id}).sort({createdAt: -1})
        res.json(books);
    } catch (error) {
        console.log("Error in getting user books", error);
        res.status(500).json({ message: "Internal server error" })
    }
})





export default router;



