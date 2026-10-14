
const filenameInput = document.getElementById("filename");
const filecontentInput = document.getElementById("content");
const messageInput = document.getElementById("message");
const filesList = document.getElementById("fileList");
const systemInfo = document.getElementById("systemInfo");

// CREATE FILE
async function createFile() {
    const fileName = filenameInput.value.trim();
    const filecontent = filecontentInput.value;

    if (!fileName || !filecontent.trim()) {
        messageInput.textContent = "Please enter filename and content.";
        return;
    }

    try {
        const response = await fetch("/api/createFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                fileName: fileName,
                filecontent: filecontent
            })
        });

        const data = await response.json();

        messageInput.textContent = data.message;

        if (!response.ok) {
            return;
        }

        filenameInput.value = "";
        filecontentInput.value = "";

        // Refresh list after creating the file
        await getFiles();

    } catch (error) {
        console.error("Create file error:", error);
        messageInput.textContent = "Unable to connect to server.";
    }
}


// SHOW FILES
async function getFiles() {
    try {
        const response = await fetch("/api/files");
        const files = await response.json();

        if (!response.ok) {
            filesList.textContent = files.message || "Unable to load files.";
            return;
        }

        filesList.replaceChildren();

        if (files.length === 0) {
            filesList.textContent = "No files found. Create your first file!";
            return;
        }

        files.forEach((file) => {
            const li = document.createElement("li");
            li.textContent = "📄 " + file;
            filesList.appendChild(li);
        });

    } catch (error) {
        console.error("Get files error:", error);
        filesList.textContent = "Unable to load files.";
    }
}


// SHOW SYSTEM INFORMATION
async function getSystemInfo() {
    try {
        const response = await fetch("/api/systemInfo");
        const data = await response.json();

        if (!response.ok) {
            systemInfo.textContent = data.message || "Unable to get system info.";
            return;
        }

        systemInfo.textContent =
            "Platform: " + data.platform +
            " | Architecture: " + data.architecture +
            " | Node.js: " + data.nodeVersion +
            " | Total Memory: " + data.totalMemory +
            " | Free Memory: " + data.freeMemory;

    } catch (error) {
        console.error("System info error:", error);
        systemInfo.textContent = "Unable to get system information.";
    }
}


// Load files when page opens
getFiles();
