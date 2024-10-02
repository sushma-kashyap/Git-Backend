const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createIssue(req, res) {
  const { title, description } = req.body;
  const { id } = req.params;
  try {
    const issue = new Issue({
      title,
      description,
      repository: id,
    });
    await issue.save();
    res.status(201).json(issue);
  } catch (err) {
    console.error("Error during  create issue", err);
    res.status(500).send("Server error");
  }
}



async function updateIssueById(req, res) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "issue not found" });
    }
    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();
    res.json({ message: "issue updated" });
  } catch (err) {
    console.error("Error during  update issue", err);
    res.status(500).send("Server error");
  }
}



async function deleteIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findByIdAndDelete(id);
    if (!issue) {
      return res.status(404).json({ message: "issue not found" });
    }
    res.json({ message: "issue deleted" });
  } catch (err) {
    console.error("Error during  delete issue", err);
    res.status(500).send("Server error");
  }
}



async function getAllIssues(req, res) {
  const { id } = req.params;
  try {
    const issues = await Issue.findById({ repository: id });
    if (!issues) {
      return res.status(404).json({ message: "issue not found" });
    }
    res.status(200).json(issues);
  } catch (err) {
    console.error("Error during  fetching issue", err);
    res.status(500).send("Server error");
  }
}



async function getIssueById(req, res) {
  const { id } = req.params;
  try {
    const issue = await Issue.findById(id);
    if (!issue) {
      return res.status(404).json({ message: "issue not found" });
    }
    res.status(200).json(issue);
  } catch (err) {
    console.error("Error during  fetchin  issue by id", err);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createIssue,
  updateIssueById,
  deleteIssueById,
  getAllIssues,
  getIssueById,
};
