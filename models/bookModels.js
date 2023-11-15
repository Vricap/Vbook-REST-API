const mongoose = require("mongoose");
const validator = require("validator"); // npm package to check validation ISBN num

const booksSchema = new mongoose.Schema(
  {
    nama: {
      type: String,
      required: [true, "Harus mempunyai nama!"],
      unique: true,
      maxlength: [50, "Nama buku harus kurang sama dengan 50 karakter!"],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, "Rating harus di atas 1.0"],
      max: [5, "Rating harus di bawah 5.0"],
    },
    ratingKuantitas: {
      type: Number,
      default: 0,
    },
    harga: {
      type: Number,
      required: [true, "Harus mempunyai harga!"],
    },
    kategori: {
      type: String,
      required: [true, "Harus mempunyai kategori!"],
      enum: {
        values: ["Fiksi", "Sains", "Filsafat", "Teknologi", "Sejarah"],
        message:
          "Kategori harus salah satu Fiksi, Sains, Filsafat, Teknologi, Sejarah.",
      },
    },
    penulis: {
      type: String,
      required: [true, "Harus mempunyai penulis!"],
    },
    penerbit: {
      type: String,
      required: [true, "Harus mempunyai penerbit!"],
    },
    bahasa: {
      type: String,
      required: [true, "Harus mempunyai bahasa!"],
      enum: {
        values: ["Indonesia", "inggris"],
        message: "Bahasa harus salah satu Indonesia atau Inggris.",
      },
    },
    halaman: {
      type: Number,
      required: [true, "Harus mempunyai halaman!"],
    },
    ISBN: {
      type: String,
      required: [true, "Harus mempunyai nomor ISBN!"],
      validate: [validator.isISBN, "Nomor ISBN tidak valid!"],
    },
    deskripsi: {
      type: String,
      trim: true,
    },
    cover: {
      type: String,
      required: [true, "Harus mempunyai cover!"],
    },
    tglTerbit: {
      type: Date,
      required: [true, "Harus mempunyai tanggal terbit!"],
    },
    terbuatDi: {
      type: Date,
      default: Date.now(),
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// virtual populate
// acces parent referencing in the Review, to have the reviewer in the book without child referencing persisted in the db.
booksSchema.virtual("reviews", {
  // 2 argument, first the name of virtual field
  ref: "Review", // reference to child model
  foreignField: "book", // field in that child model
  localField: "_id", // the name of the _id field in the local model (book model)

  // now call .populate() in which the info abt reviewer need it. in this case in get 1 book getBook()
});

// // document middleware, save only happen on .save() & .create(). NOT .update() .updateOne() etc
// booksSchema.pre('save', function(next) {
//  // this keyword point to currently processed document

//   next()
// })

// booksSchema.post('save', function(doc, next) {
//   // doc is like the this keyword in pre
//   console.log('Will save document');

//   next()
// })

// query middleware, happen when querying
// booksSchema.pre('find', function(next) {

//   next()
// }) // also there post version

// // aggregration middleware
// booksSchema.pre('aggregate', function(next) {
//   console.log(this.pipeline()); // point to array of stages in aggregration

//   next()
// })

const Book = mongoose.model("Book", booksSchema);

// const testBook = new Book({
//   nama: "Retorika",
//   harga: 99,
//   rating: 4.7,
// });

// testBook
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => console.log(err));

module.exports = Book;
