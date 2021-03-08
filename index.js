require("dotenv").config();
const express = require("express");
const app = express();
const Person = require("./models/person");

const morgan = require("morgan");
const cors = require("cors");

morgan.token("post-method", (req, res) => {
  return req.method === "POST" ? `- ${JSON.stringify(req.body)}` : " ";
});

app.use(express.json());
app.use(
  morgan(":method :url :res[content-length] - :response-time ms :post-method")
);
app.use(cors());
app.use(express.static("build"));

/* An infoPage */
const infoPage = () => {
  return `<div><p>Phonebook has info for ${
    persons.length
  } people</p><p>${new Date()}</p></div>`;
};

/* GET request to the root */
app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

/* GET request for getting persons */
app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

/* GET request for showing infoPgae */
app.get("/info", (request, response) => {
  Person.count({}).then((number) => {
    response.send(`<p>Phonebook has information for ${number} people</p>
  ${new Date()}`);
  });
});

/* GET request to one entry */
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;

  Person.findById(id).then((person) => {
    response.json(person);
  });
});

/* DELETing a resource */
app.delete("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

/* Creating a resource */
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: `Name and/or number is missing`,
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.log(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
