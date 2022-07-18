const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//get all players API get

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

// get all players api get

app.get("/players/", async (request, response) => {
  const getAllPlayers = `
    SELECT 
        * 
    FROM 
        cricket_team;`;

  const playersArray = await database.all(getAllPlayers);

  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//get a player api get

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT 
      *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;

  const addNewPlayer = await database.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(addNewPlayer));
});

// create a player api post

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const playerQuery = `
    INSERT INTO
        cricket_team (player_name, jersey_number, role)
    VALUES
        ('${playerName}', '${jerseyNumber}', '${role}');`;

  const player = await database.run(playerQuery);
  response.send("Player Added to Team");
});

// update player api put

app.put("/players/:playerId/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const { playerId } = request.params;

  const updatePlayerQuery = `
    UPDATE
        cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};`;

  const result = await database.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player Api

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
        cricket_team
    WHERE
        player_id = ${playerId};`;

  const result = await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
