require("dotenv").config();
const express = require("express");

const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();

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
  response.send(infoPage());
});

/* GET request to one entry */
app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

/* DELETing a resource */
app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((p) => p.id !== id);

  response.status(204).end();
});

/* Creating a resource */
app.post("/api/persons", (request, response) => {
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
  person.save().then((savedPerson) => {
    response.json(savedPerson);
  });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
