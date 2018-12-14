const express = require('express');
const app = express();
const apiRouter = express.Router();

const artistsRouter = require('./artists');
app.use('./artists', artistsRouter);

artistsRouter.get('/', (req,res,next) => {
  db.all(`SELECT * FROM Artist WHERE is_currently_employed = 1`, (err, rows) => {
    if (err) {
      next(err);
    } else {
      res.status(200).json({artists: rows});
    };
  });
});

module.exports = apiRouter;
