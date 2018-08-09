const assert = require('assert')
const async = require('async')
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookSchema = new Schema({
  title: { type: String }
})

const Book = mongoose.model('Book', BookSchema)

mongoose.connect('mongodb://localhost:27017/batchsizetest3')

// drop any existing collection
Book.collection.drop(function (err) {
  if (err) console.error('Failed to drop existing collection')

  // create 1001 docs
  async.timesSeries(1001, function (n, next) {
    Book.create({ title: 'title-' + n }, next)

  }, function (err) {
    if (err) return console.error('error creating books', err)

    // confirm number of docs created
    const bookCount = Book.count(function (err, count) {
      if (err) return console.error('error getting book count', err)
      console.log('Book count', count)
      assert.equal(count, 1001)

      // query all the docs out
      Book
        .find()
        .sort('_id title')
        .limit(2000)
        .exec(function (err, books) {
          if (err) return console.error('error querying books', err)

          console.log('Books queried', books.length)
          assert.equal(books.length, 1001)
          mongoose.disconnect()
        })
    })
  })
})
