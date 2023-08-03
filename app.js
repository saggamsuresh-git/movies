const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const ans = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

// return all movies API
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
    *
    FROM 
    movie;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

// add a movie API
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
  INSERT INTO
     movie(director_id,movie_name,lead_actor)
  VALUES(
     ${directorId},
    '${movieName}',
    '${leadActor}'
  );`;
  const addeddMovie = await db.run(addMovieQuery);
  const movie_id = addeddMovie.lastID;
  response.send("Movie Successfully Added");
});

// get A Movie API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
  SELECT
   *
  FROM
   movie 
  WHERE 
   movie_id = ${movieId};`;
  const movieData = await db.get(getMovieQuery);
  response.send(ans(movieData));
});

// update movie API
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
  UPDATE 
   movie
  SET
   director_id = ${directorId},
   movie_name = '${movieName}',
   lead_actor = '${leadActor}'
  WHERE 
   movie_id = ${movieId};

  `;
  const updatedMovie = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//delete movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
  DELETE FROM
  movie
  WHERE 
  movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

// get Directors API
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
    * 
    FROM 
    director;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(
    directorsArray.map((eachMovie) => ({
      directorId: eachMovie.director_id,
      directorName: eachMovie.director_name,
    }))
  );
});

// get Director's  all Movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesOfDirectorsQuery = `
    SELECT
     *
    FROM
     director INNER JOIN movie on director.director_id = movie.director_id
    WHERE
     movie.director_id = ${directorId};`;
  const moviesArray = await db.all(getMoviesOfDirectorsQuery);
  response.send(
    moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
  // moviesOfDirectors.map((eachMovie) => {
  //   movieName: eachMovie.movie_name;
  // })
});
module.exports = app;
