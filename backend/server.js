const http = require("http");

const PORT = 3333;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Server is running on port 3333\n");
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
