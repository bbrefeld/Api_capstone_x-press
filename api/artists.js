const express = require('express');
const sqlite3 = require('sqlite3');
const artistsRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || '../database.sqlite')

artistsRouter.get('/', (req,res,next) => {
  db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, artists) => {
    if (err) {
      next(err);
    } else {
      return artists;
      res.status(200).json({artists: artists});
    };
  });
});

artistsRouter.param('atristId', (req,res,next,artistId) => {
  db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, (err, artistById) => {
    console.log('test');
    if (err) {
      next(err);
    } else if (artistById) {
      req.artist = artistById;
      console.log(artistById);
      next();
    } else {
      res.status(404).send();
    };
  });
});

artistsRouter.get('/:artistId', (req,res,next) => {
  res.status(200).json({artist: req.artist});
});

module.exports = artistsRouter;
