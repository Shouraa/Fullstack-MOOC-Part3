const express = require("express");
const app = express();
const morgan = require("morgan");

morgan.token("post-method", (req, res) => {
  return req.method === "POST" ? `- ${JSON.stringify(req.body)}` : " ";
});

app.use(express.json());
app.use(
  morgan(":method :url :res[content-length] - :response-time ms :post-method")
);

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1,
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2,
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3,
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4,
  },
];

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
  response.json(persons);
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
  } else if (persons.find((p) => p.name === body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  }
  const uniqueId = Math.floor(Math.random() * Math.floor(1000));

  const person = {
    name: body.name,
    number: body.number,
    id: uniqueId,
  };

  persons = persons.concat(person);

  response.json(person);
});

const PORT = 3001;
app.listen(PORT);
console.log(`Server running on port ${PORT}`);
