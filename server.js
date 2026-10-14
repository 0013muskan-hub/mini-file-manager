
const http = require("http");
const path = require("path");
const fs = require("fs");
const os = require("os");

const server = http.createServer((req, res) => {

    // HOME PAGE
    if (req.method === "GET" && req.url === "/") {
        const filepath = path.join(__dirname, "public", "index.html");

        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
                console.log(err.message);
                res.writeHead(500);
                res.end("Unable to load HTML");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
        return;
    }

    // CSS FILE
    if (req.method === "GET" && req.url === "/style.css") {
        const filepath = path.join(__dirname, "public", "style.css");

        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Unable to load CSS");
                return;
            }

            res.writeHead(200, { "Content-Type": "text/css" });
            res.end(data);
        });
        return;
    }

    // JAVASCRIPT FILE
    if (req.method === "GET" && req.url === "/app.js") {
        const filepath = path.join(__dirname, "public", "app.js");

        fs.readFile(filepath, "utf8", (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end("Unable to load JavaScript");
                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/javascript"
            });
            res.end(data);
        });
        return;
    }

    // CREATE FILE
    if (req.method === "POST" && req.url === "/api/createFile") {
        let body = "";

        req.on("data", (chunk) => {
            body += chunk;
        });

        req.on("end", () => {
            let fileData;

            try {
                fileData = JSON.parse(body);
            } catch (error) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    message: "Invalid JSON data"
                }));
                return;
            }

            const fileName = fileData.fileName;
            const filecontent = fileData.filecontent;

            // Validate input
            if (
                typeof fileName !== "string" ||
                fileName.trim() === "" ||
                fileName !== path.basename(fileName) ||
                fileName === "." ||
                fileName === ".." ||
                typeof filecontent !== "string"
            ) {
                res.writeHead(400, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    message: "Please enter a valid filename and content"
                }));
                return;
            }

            const folderPath = path.join(__dirname, "data");
            const filepath = path.join(folderPath, fileName);

            // Create data folder if it doesn't exist
            fs.mkdir(folderPath, { recursive: true }, (err) => {
                if (err) {
                    console.log("Folder error:", err.message);
                    res.writeHead(500, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        message: "Unable to create data folder"
                    }));
                    return;
                }

                // Create and write the file
                fs.writeFile(filepath, filecontent, (err) => {
                    if (err) {
                        console.log("File error:", err.message);
                        res.writeHead(500, {
                            "Content-Type": "application/json"
                        });
                        res.end(JSON.stringify({
                            message: "File creation failed: " + err.message
                        }));
                        return;
                    }

                    console.log("Created:", filepath);

                    res.writeHead(201, {
                        "Content-Type": "application/json"
                    });
                    res.end(JSON.stringify({
                        message: "File created successfully!"
                    }));
                });
            });
        });
        return;
    }

    // GET ALL FILES
    if (req.method === "GET" && req.url === "/api/files") {
        const folderPath = path.join(__dirname, "data");

        fs.readdir(folderPath, (err, files) => {
            if (err && err.code === "ENOENT") {
                res.writeHead(200, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify([]));
                return;
            }

            if (err) {
                console.log("Read folder error:", err.message);
                res.writeHead(500, {
                    "Content-Type": "application/json"
                });
                res.end(JSON.stringify({
                    message: "Unable to read files"
                }));
                return;
            }

            res.writeHead(200, {
                "Content-Type": "application/json"
            });
            res.end(JSON.stringify(files));
        });
        return;
    }

    // SYSTEM INFORMATION
    if (req.method === "GET" && req.url === "/api/systemInfo") {
        res.writeHead(200, {
            "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
            platform: os.platform(),
            architecture: os.arch(),
            nodeVersion: process.version,
            totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + " GB",
            freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + " GB"
        }));
        return;
    }

    // UNKNOWN ROUTE
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404 - Route not found");
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});
