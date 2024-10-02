const mongoose = require("mongoose");
const Repository = require("../models/repoModel");
const User = require("../models/userModel");
const Issue = require("../models/issueModel");

async function createRepository(req, res) {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ error: "Repository name is required" });
    }
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      return res.status(400).json({ error: "Invalid user id" });
    }
    const newRepository = new Repository({
      owner,
      name,
      issues,
      content,
      description,
      visibility,
    });

    const result = await newRepository.save();
    res.status(201).json({
      message: "Repository created",
      repositoryId: result._id,
    });
  } catch (err) {
    console.error("Error during repository creation", err);
    res.status(500).send("Server error");
  }
}




async function getAllRepositories(req, res) {
  try {
    const repositories = await Repository.find({})
      .populate("owner")
      .populate("issues");

    res.json(repositories);
  } catch (err) {
    console.error("Error during  fetching repositories ", err);
    res.status(500).send("Server error");
  }
}



async function fetchRepositoryById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.find({ _id: id })
      .populate("owner")
      .populate("issues");
    res.json(repository);
  } catch (err) {
    console.error("Error during  fetching repository ", err);
    res.status(500).send("Server error");
  }
}




async function fetchRepositoryByName(req, res) {
  const { name } = req.params;
  try {
    const repository = await Repository.find({ name })
      .populate("owner")
      .populate("issues");
    res.json(repository);
  } catch (err) {
    console.error("Error during  fetching repository ", err);
    res.status(500).send("Server error");
  }
}



async function fetchRepositoryForCurrentUser(req, res) {
  const {userID} = req.params;
  try {
    const repositories = await Repository.find({ owner: userID });
    if (!repositories || repositories.length == 0) {
      return res.status(404).json({ error: "user repository not found" });
    }
    res.json({ message: "Repository found", repositories });
  } catch (err) {
    console.error("Error during  fetching user repositories ", err);
    res.status(500).send("Server error");
  }
}




async function updateRepositoryById(req, res) {
  const { id } = req.params;
  const { content, description } = req.body;
  try {
    const repository = await Repository.findById({ id });
    if (!repository) {
      return res.status(404).json({ error: "user id not found" });
    }
    repository.content.push(content);
    repository.description = description;

    const updatedRepository = await repository.save();

    res.json({
      message: "Repository update successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during  updating repository ", err);
    res.status(500).send("Server error");
  }
}




async function deleteRepositoryById(req, res) {
  const { id } = req.params;

  try {
    const repository = await Repository.findByIdAndDelete(id);
   
    if (!repository) {
      return res.status(404).json({ error: "user id not found" });
    }
   
    res.json({
      message: "Repository  delete successfully",
      repository: updatedRepository,
    });
  } catch (err) {
    console.error("Error during  deleting repository ", err);
    res.status(500).send("Server error");
  }
}

async function toggleVisibilityById(req, res) {
  const { id } = req.params;
  try {
    const repository = await Repository.findById({ id });
    if (!repository) {
      return res.status(404).json({ error: "user id not found" });
    }
    repository.visibility = !repository.visibility;
    res.json({ message: "Repository toggling visibility successfully" });
  } catch (err) {
    console.error("Error during  toggling visibility repository  ", err);
    res.status(500).send("Server error");
  }
}

module.exports = {
  createRepository,
  getAllRepositories,
  fetchRepositoryById,
  fetchRepositoryByName,
  fetchRepositoryForCurrentUser,
  updateRepositoryById,
  deleteRepositoryById,
  toggleVisibilityById,
};
