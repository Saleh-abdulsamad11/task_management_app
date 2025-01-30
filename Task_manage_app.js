// Task Management App using JavaScript (DOM) and Node.js backend

// Frontend: JavaScript (DOM Manipulation)

document.addEventListener("DOMContentLoaded", () => {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const taskList = document.getElementById("taskList");

    const fetchTasks = async () => {
        const response = await fetch("/tasks");
        const tasks = await response.json();
        taskList.innerHTML = "";
        tasks.forEach(task => renderTask(task));
    };

    const renderTask = (task) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span class="${task.completed ? 'completed' : ''}">${task.text}</span>
            <button onclick="toggleTask('${task.id}', ${task.completed})">${task.completed ? 'Undo' : 'Complete'}</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        `;
        taskList.appendChild(li);
    };

    addTaskBtn.addEventListener("click", async () => {
        if (taskInput.value) {
            const response = await fetch("/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: taskInput.value })
            });
            const newTask = await response.json();
            renderTask(newTask);
            taskInput.value = "";
        }
    });

    window.toggleTask = async (id, completed) => {
        await fetch(`/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !completed })
        });
        fetchTasks();
    };

    window.deleteTask = async (id) => {
        await fetch(`/tasks/${id}`, { method: "DELETE" });
        fetchTasks();
    };

    fetchTasks();
});

// Backend: Node.js + Express + MariaDB
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const app = express();
const PORT = 5000;

// MariaDB Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "your_password",
    database: "your_DB_name"
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed: ", err);
    } else {
        console.log("Connected to MariaDB");
    }
});

app.use(express.json());
app.use(cors());

app.get("/tasks", (req, res) => {
    db.query("SELECT * FROM your_table(tasks)", (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});

app.post("/tasks", (req, res) => {
    const { text } = req.body;
    db.query("INSERT INTO your_table(tasks) (text, completed) VALUES (?, false)", [text], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json({ id: result.insertId, text, completed: false });
    });
});

app.put("/tasks/:id", (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    db.query("UPDATE tasks SET completed = ? WHERE id = ?", [completed, id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.delete("/tasks/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM your_table(tasks) WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).send(err);
        res.sendStatus(200);
    });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));