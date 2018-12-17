const express = require('express');
const sqlite3 = require('sqlite3');
const artistsRouter = express.Router();

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

artistsRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, function(err, artists) {

    /* callback of db.all */
    if (err) {
      next(err);
    } else {
      res.status(200).json({artists: artists});
    };
  });
});


artistsRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.artist.name || !req.body.artist.dateOfBirth || !req.body.artist.biography) {
    res.status(400).send();
  } else {
    const isCurrentlyEmployed = req.body.artist.isCurrentlyEmployed === 0 ? 0 : 1;
    db.run("INSERT INTO Artist (name, date_of_birth, biography, is_currently_employed) VALUES ($artistName, $artistDOB, $artistBiography, $isCurrentlyEmployed)",
    {
      $artistName: req.body.artist.name,
      $artistDOB: req.body.artist.dateOfBirth,
      $artistBiography: req.body.artist.biography,
      $isCurrentlyEmployed: isCurrentlyEmployed
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Artist WHERE id = ${this.lastID}`, function(err, artist) {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(201).json({artist: artist});
          };
        });
      };
    });
  };
});


artistsRouter.param('artistId', (req,res,next,artistId) => {

  /* callback of param */
  db.get(`SELECT * FROM Artist WHERE id = ${artistId}`, function(err, artistById) {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (artistById) {
      req.artist = artistById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


artistsRouter.get('/:artistId', (req,res,next) => {

  /* callback of get */
  res.status(200).json({artist: req.artist});
});


artistsRouter.put('/:artistId', (req,res,next) => {

  /* callback of put */
  if (!req.body.artist.name || !req.body.artist.dateOfBirth || !req.body.artist.biography) {
    res.status(400).send();
  } else {
    db.run("UPDATE Artist SET name = $artistName, date_of_birth = $artistDOB, biography = $artistBiography, is_currently_employed = $isCurrentlyEmployed WHERE id = $artistId",
      {
        $artistName: req.body.artist.name,
        $artistDOB: req.body.artist.dateOfBirth,
        $artistBiography: req.body.artist.biography,
        $isCurrentlyEmployed: req.body.artist.isCurrentlyEmployed,
        $artistId: req.params.artistId
      },
      function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, function(err, artist) {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(200).json({artist: artist});
          };
        });
      };
    });
  };
});


artistsRouter.delete('/:artistId', (req,res,next) => {

  /* callback of delete */
  db.run(`UPDATE Artist SET is_currently_employed = 0 WHERE id = ${req.params.artistId}`, function(err) {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      db.get(`SELECT * FROM Artist WHERE id = ${req.params.artistId}`, (err, artist) => {

        /* callback of db.get */
        if (err) {
          next(err);
        } else {
          res.status(200).json({artist: artist});
        };
      });
    };
  });
});

module.exports = artistsRouter;
