const express = require('express');
const sqlite3 = require('sqlite3');
const seriesRouter = express.Router();

const issuesRouter = require("./issues")
seriesRouter.use("/:seriesId/issues", issuesRouter);

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')

seriesRouter.get('/', (req,res,next) => {

  /* callback of get */
  db.all(`SELECT * FROM Series`, function(err, series) {

    /* callback of db.all */
    if (err) {
      next(err);
    } else {
      res.status(200).json({series: series});
    };
  });
});

seriesRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.series.name || !req.body.series.description) {
    res.status(400).send();
  } else {
    db.run("INSERT INTO Series (name, description) VALUES ($seriesName, $seriesDescription)",
    {
      $seriesName: req.body.series.name,
      $seriesDescription: req.body.series.description
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM Series WHERE id = ${this.lastID}`, function(err, series) {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(201).json({series: series});
          };
        });
      };
    });
  };
});


seriesRouter.param('seriesId', (req,res,next,seriesId) => {

  /* callback of param */
  db.get(`SELECT * FROM Series WHERE id = ${seriesId}`, function(err, seriesById) {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (seriesById) {
      req.series = seriesById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


seriesRouter.get('/:seriesId', (req,res,next) => {

  /* callback of get */
  res.status(200).json({series: req.series});
});

seriesRouter.put('/:seriesId', (req,res,next) => {

  /* callback of put */
  if (!req.body.series.name || !req.body.series.description) {
    res.status(400).send();
  } else {
    db.run("UPDATE Series SET name = $seriesName, description = $seriesDescription WHERE id = $seriesId",
    {
      $seriesName: req.body.series.name,
      $seriesDescription: req.body.series.description,
      $seriesId: req.params.seriesId
    },
    function(err) {

      /* callback of db.run */
      if (err) {
        next(err);
      } else {
        db.get(`SELECT * FROM series WHERE id = ${req.params.seriesId}`, function(err, series) {

          /* callback of db.get */
          if (err) {
            next(err);
          } else {
            res.status(200).json({series: series});
          };
        });
      };
    });
  };
});


seriesRouter.delete("/", (req,res,next) => {

  /* callback of delete */
  db.get(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, (err, issue) => {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (issue) {
      res.status(400).send();
    } else {
      db.run(`DELETE FROM Series WHERE id = ${req.params.seriesId}`, function(err) {

        /* callback of db.run */
        if (err) {
          next(err);
        } else {
          res.status(204).send();
        };
      });
    };
  });
});


module.exports = seriesRouter;
