const express = require('express');
const sqlite3 = require('sqlite3');
const issuesRouter = express.Router({mergeParams: true});

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite')


issuesRouter.get('/', (req,res,next) => {
  console.log('test');

  /* callback of get */
  db.all(`SELECT * FROM Issue WHERE series_id = ${req.params.seriesId}`, function(err, issues) {

    /* callback of db.all */
    if (err) {
      next(err);
    } else {
      res.status(200).json({issues: issues});
    };
  });
});


issuesRouter.post('/', (req,res,next) => {

  /* callback of post */
  if (!req.body.issues.name || !req.body.issues.issueNumber || !req.body.issues.publicationDate || !req.body.issues.artistId) {
    res.status(400).send();
  } else {
    db.get("SELECT * FROM Issue WHERE artist_id = $artistId", {$artistId: req.body.issues.artistId}, function(err, issue) {

      /* callback of db.get */
      if (err) {
        next(err);
      } else if (issue.artist_id !== req.body.issues.artistId) {
        res.status(400).send();
      } else {
        db.run("INSERT INTO Issue (name, issue_number, publication_date, artist_id, series_id) VALUES ($issuesName, $issueNumber, $publicationDate, $artistId, $seriesId)",
        {
          $issuesName: req.body.issues.name,
          $issueNumber: req.body.issues.issueNumber,
          $publicationDate: req.body.issues.publicationDate,
          $artistId: req.body.issues.artistId,
          $seriesId: req.body.issues.seriesId
        },
        function(err) {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            db.get(`SELECT * FROM Issue WHERE id = ${this.lastID}`, function(err, issues) {

              /* callback of db.get */
              if (err) {
                next(err);
              } else {
                res.status(201).json({issues: issues});
              };
            });
          };
        });
      };
    });
  };
});


issuesRouter.param('issuesId', (req,res,next,issuesId) => {

  /* callback of param */
  db.get(`SELECT * FROM Series WHERE id = ${issuesId}`, function(err, issueById) {

    /* callback of db.get */
    if (err) {
      next(err);
    } else if (issueById) {
      req.issue = issueById;
      next();
    } else {
      res.status(404).send();
    };
  });
});


issuesRouter.put('/:issuesId', (req,res,next) => {

  /* callback of post */
  if (!req.body.issues.name || !req.body.issues.issueNumber || !req.body.issues.publicationDate || !req.body.issues.artistId) {
    res.status(400).send();
  } else {
    db.get("SELECT * FROM Issue WHERE artist_id = $artistId", {$artistId: req.body.issues.artistId}, function(err, issue) {

      /* callback of db.get */
      if (err) {
        next(err);
      } else if (issue.artist_id !== req.body.issues.artistId) {
        res.status(400).send();
      } else {
        db.run("UPDATE Issue SET name = $issuesName, issue_number = $issueNumber, publication_date = $publicationDate, artist_id = $artistId, series_id = seriesId",
        {
          $issuesName: req.body.issues.name,
          $issueNumber: req.body.issues.issueNumber,
          $publicationDate: req.body.issues.publicationDate,
          $artistId: req.body.issues.artistId,
          $seriesId: req.body.issues.seriesId
        },
        function(err) {

          /* callback of db.run */
          if (err) {
            next(err);
          } else {
            db.get(`SELECT * FROM Issue WHERE id = ${req.params.issueId}`, function(err, issues) {

              /* callback of db.get */
              if (err) {
                next(err);
              } else {
                res.status(201).json({issues: issues});
              };
            });
          };
        });
      };
    });
  };
});

issuesRouter.delete("/:issuesId", (req,res,next) => {

  /* callback of delete */
  db.run(`DELETE FROM Issue WHERE id = ${req.params.issueId}`, function(err) {

    /* callback of db.run */
    if (err) {
      next(err);
    } else {
      res.status(204).send();
    };
  });
});

module.exports = issuesRouter;
