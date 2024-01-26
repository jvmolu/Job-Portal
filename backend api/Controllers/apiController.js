const express = require("express");
const mongoose = require("mongoose");
// const jwtAuth = require("../lib/jwtAuth.js");

const User = require("../Models/UserModel");
const JobApplicant = require("../Models/JobApplicantModel");
const Recruiter = require("../Models/RecruiterModel");
const Job = require("../Models/JobModel");
const Application = require("../Models/ApplicationModel");
const Rating = require("../Models/RatingModel");
const Training = require("../Models/TrainingModel");

const router = express.Router();

// To add new job
const postJobs = (req, res) => {
  console.log(req);
  const user = req.user;

  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to add jobs",
    });
    return;
  }

  const data = req.body;

  let job = new Job({
    userId: user._id,
    title: data.title,
    maxApplicants: data.maxApplicants,
    maxPositions: data.maxPositions,
    dateOfPosting: data.dateOfPosting,
    deadline: data.deadline,
    skillsets: data.skillsets,
    jobType: data.jobType,
    duration: data.duration,
    salary: data.salary,
    rating: data.rating,
    description: data.description,
  });

  job
    .save()
    .then(() => {
      res.json({ message: "Job added successfully to the database" });
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
}

// to get all the jobs [pagination] [for recruiter personal and for everyone]
const getJobs = (req, res) => {
  let user = req.user;

  let findParams = {};
  let sortParams = {};

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  if (user.type === "recruiter" && req.query.myjobs) {
    findParams = {
      ...findParams,
      userId: user._id,
    };
  }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.query.q, "i"),
      }
    };
  }
  if (req.query.skill) {
    let skills = [];
    req.query.skill.split(",").forEach((skill) => {
      skills.push(skill.trim());
    });
    console.log("skills", skills);
    
    
    findParams = {
      ...findParams,
      skillsets: {
        
        $in: skills,
      }
    }
  }
  if (req.query.jobType) {
    let jobTypes = [];
    if (Array.isArray(req.query.jobType)) {
      jobTypes = req.query.jobType;
    } else {
      jobTypes = [req.query.jobType];
    }
    console.log(jobTypes);
    findParams = {
      ...findParams,
      jobType: {
        $in: jobTypes,
      },
    };
  }

  if (req.query.salaryMin && req.query.salaryMax) {
    findParams = {
      ...findParams,
      $and: [
        {
          salary: {
            $gte: parseInt(req.query.salaryMin),
          },
        },
        {
          salary: {
            $lte: parseInt(req.query.salaryMax),
          },
        },
      ],
    };
  } else if (req.query.salaryMin) {
    findParams = {
      ...findParams,
      salary: {
        $gte: parseInt(req.query.salaryMin),
      },
    };
  } else if (req.query.salaryMax) {
    findParams = {
      ...findParams,
      salary: {
        $lte: parseInt(req.query.salaryMax),
      },
    };
  }

  if (req.query.duration) {
    findParams = {
      ...findParams,
      duration: {
        $lt: parseInt(req.query.duration),
      },
    };
  }

  if (req.query.asc) {
    if (Array.isArray(req.query.asc)) {
      req.query.asc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: 1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.asc]: 1,
      };
    }
  }

  if (req.query.desc) {
    if (Array.isArray(req.query.desc)) {
      req.query.desc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: -1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.desc]: -1,
      };
    }
  }

  console.log(findParams);
  console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  let arr = [
    {
      $lookup: {
        from: "recruiterinfos",
        localField: "userId",
        foreignField: "userId",
        as: "recruiter",
      },
    },
    { $unwind: "$recruiter" },
    { $match: findParams },
  ];

  if (Object.keys(sortParams).length > 0) {
    arr = [
      {
        $lookup: {
          from: "recruiterinfos",
          localField: "userId",
          foreignField: "userId",
          as: "recruiter",
        },
      },
      { $unwind: "$recruiter" },
      { $match: findParams },
      {
        $sort: sortParams,
      },
    ];
  }

  console.log(arr);

  Job.aggregate(arr)
    .then((posts) => {
      if (posts == null) {
        res.status(404).json({
          message: "No job found",
        });
        return;
      }
      res.json(posts);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

  

// to get all the jobs [pagination] [for recruiter personal and for everyone]
const getTraining = (req, res) => {
  let user = req.user;
  // console.log(user);

  let findParams = {};
  let sortParams = {};

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  // to list down jobs posted by a particular recruiter
  // if (user.type === "recruiter" && req.query.myjobs) {
  //   findParams = {
  //     ...findParams,
  //     userId: user._id,
  //   };
  // }

  if (req.query.q) {
    findParams = {
      ...findParams,
      title: {
        $regex: new RegExp(req.query.q, "i"),
      }
    };
  }
  if (req.query.skill) {
    let skillset = [];
    req.query.skill.split(",").forEach((skill) => {
      skills.push(skill.trim());
    });
    console.log("skills", skillset);
    
    
    findParams = {
      ...findParams,
      skills: {
        
        $in: skillset,
      }
    }
  }
  

  

  if (req.query.duration) {
    findParams = {
      ...findParams,
      duration: {
        $lt: parseInt(req.query.duration),
      },
    };
  }

  if (req.query.asc) {
    if (Array.isArray(req.query.asc)) {
      req.query.asc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: 1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.asc]: 1,
      };
    }
  }

  if (req.query.desc) {
    if (Array.isArray(req.query.desc)) {
      req.query.desc.map((key) => {
        sortParams = {
          ...sortParams,
          [key]: -1,
        };
      });
    } else {
      sortParams = {
        ...sortParams,
        [req.query.desc]: -1,
      };
    }
  }

  console.log(findParams);
  console.log(sortParams);

  // Job.find(findParams).collation({ locale: "en" }).sort(sortParams);
  // .skip(skip)
  // .limit(limit)

  let arr = [
    
      
    { $match: findParams },
  ];

  if (Object.keys(sortParams).length > 0) {
    arr = [
      
      { $match: findParams },
      {
        $sort: sortParams,
      },
    ];
  }

  console.log(arr);

  Training.aggregate(arr)
    .then((posts) => {
      console.log(posts);
      if (posts == null) {
        res.status(404).json({
          message: "No training found",
        });
        return;
      }
      console.log(posts);
      res.json(posts);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

const getJobById = (req, res) => {
    Job.findOne({ _id: req.params.id })
      .then((job) => {
        if (job == null) {
          res.status(400).json({
            message: "Job does not exist",
          });
          return;
        }
        res.json(job);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
}

// to update info of a particular job
const updateJobById = (req, res) => {
    const user = req.user;
    if (user.type != "recruiter") {
        res.status(401).json({
            message: "You don't have permissions to change the job details",
        });
        return;
    }
    Job.findOne({
        _id: req.params.id,
        userId: user.id,
    })
        .then((job) => {
            if (job == null) {
                res.status(404).json({
                    message: "Job does not exist",
                });
                return;
            }
            const data = req.body;
            if (data.maxApplicants) {
                job.maxApplicants = data.maxApplicants;
            }
            if (data.maxPositions) {
                job.maxPositions = data.maxPositions;
            }
            if (data.deadline) {
                job.deadline = data.deadline;
            }
            job
                .save()
                .then(() => {
                    res.json({
                        message: "Job details updated successfully",
                    });
                })
                .catch((err) => {
                    res.status(400).json(err);
                });
        })
        .catch((err) => {
            res.status(400).json(err);
        });
}

const deleteJobById = (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to delete the job",
    });
    return;
  }
  Job.findOneAndDelete({
    _id: req.params.id,
    userId: user.id,
  })
    .then((job) => {
      if (job === null) {
        res.status(401).json({
          message: "You don't have permissions to delete the job",
        });
        return;
      }
      res.json({
        message: "Job deleted successfully",
      });
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

// get user's personal details
const getUser = (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    Recruiter.findOne({ userId: user._id })
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(recruiter);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        res.json(jobApplicant);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
}

// get user details from id
const getUserById = (req, res) => {
  User.findOne({ _id: req.params.id })
    .then((userData) => {
      if (userData === null) {
        res.status(404).json({
          message: "User does not exist",
        });
        return;
      }

      if (userData.type === "recruiter") {
        Recruiter.findOne({ userId: userData._id })
          .then((recruiter) => {
            if (recruiter === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(recruiter);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      } else {
        JobApplicant.findOne({ userId: userData._id })
          .then((jobApplicant) => {
            if (jobApplicant === null) {
              res.status(404).json({
                message: "User does not exist",
              });
              return;
            }
            res.json(jobApplicant);
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      }
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

// update user details
const updateUser = (req, res) => {
  const user = req.user;
  const data = req.body;
  if (user.type == "recruiter") {
    Recruiter.findOne({ userId: user._id })
      .then((recruiter) => {
        if (recruiter == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        if (data.name) {
          recruiter.name = data.name;
        }
        if (data.contactNumber) {
          recruiter.contactNumber = data.contactNumber;
        }
        if (data.bio) {
          recruiter.bio = data.bio;
        }
        recruiter
          .save()
          .then(() => {
            res.json({
              message: "User information updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    JobApplicant.findOne({ userId: user._id })
      .then((jobApplicant) => {
        if (jobApplicant == null) {
          res.status(404).json({
            message: "User does not exist",
          });
          return;
        }
        if (data.name) {
          jobApplicant.name = data.name;
        }
        if (data.education) {
          jobApplicant.education = data.education;
        }
        if (data.skills) {
          jobApplicant.skills = data.skills;
        }
        if (data.resume) {
          jobApplicant.resume = data.resume;
        }
        if (data.profile) {
          jobApplicant.profile = data.profile;
        }
        if (data.workGapYear) {
          jobApplicant.gapYear = data.data.workGapYear;
        }
        
        if (data.workGapReason) {
          jobApplicant.gapReason = data.workGapReason;
        }

        console.log(jobApplicant);
        jobApplicant
          .save()
          .then(() => {
            res.json({
              message: "User information updated successfully",
            });
          })
          .catch((err) => {
            res.status(400).json(err);
          });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
}

const postJobApplicationsById = (req, res) => {
  const user = req.user;
  if (user.type != "applicant") {
    res.status(401).json({
      message: "You don't have permissions to apply for a job",
    });
    return;
  }
  const data = req.body;
  const jobId = req.params.id;

  // check whether applied previously
  // find job
  // check count of active applications < limit
  // check user had < 10 active applications && check if user is not having any accepted jobs (user id)
  // store the data in applications

  Application.findOne({
    userId: user._id,
    jobId: jobId,
    status: {
      $nin: ["deleted", "accepted", "cancelled"],
    },
  })
    .then((appliedApplication) => {
      console.log(appliedApplication);
      if (appliedApplication !== null) {
        res.status(400).json({
          message: "You have already applied for this job",
        });
        return;
      }

      Job.findOne({ _id: jobId })
        .then((job) => {
          if (job === null) {
            res.status(404).json({
              message: "Job does not exist",
            });
            return;
          }
          Application.countDocuments({
            jobId: jobId,
            status: {
              $nin: ["rejected", "deleted", "cancelled", "finished"],
            },
          })
            .then((activeApplicationCount) => {
              if (activeApplicationCount < job.maxApplicants) {
                Application.countDocuments({
                  userId: user._id,
                  status: {
                    $nin: ["rejected", "deleted", "cancelled", "finished"],
                  },
                })
                  .then((myActiveApplicationCount) => {
                    if (myActiveApplicationCount < 10) {
                      Application.countDocuments({
                        userId: user._id,
                        status: "accepted",
                      }).then((acceptedJobs) => {
                        if (acceptedJobs === 0) {
                          const application = new Application({
                            userId: user._id,
                            recruiterId: job.userId,
                            jobId: job._id,
                            status: "applied",
                            sop: data.sop,
                          });
                          application
                            .save()
                            .then(() => {
                              res.json({
                                message: "Job application successful",
                              });
                            })
                            .catch((err) => {
                              res.status(400).json(err);
                            });
                        } else {
                          res.status(400).json({
                            message:
                              "You already have an accepted job. Hence you cannot apply.",
                          });
                        }
                      });
                    } else {
                      res.status(400).json({
                        message:
                          "You have 10 active applications. Hence you cannot apply.",
                      });
                    }
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                res.status(400).json({
                  message: "Application limit reached",
                });
              }
            })
            .catch((err) => {
              res.status(400).json(err);
            });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    })
    .catch((err) => {
      res.json(400).json(err);
    });
}

// recruiter gets applications for a particular job [pagination] [todo: test: done]
const getJobApplicationsById = (req, res) => {
  const user = req.user;
  if (user.type != "recruiter") {
    res.status(401).json({
      message: "You don't have permissions to view job applications",
    });
    return;
  }
  const jobId = req.params.id;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  let findParams = {
    jobId: jobId,
    recruiterId: user._id,
  };

  let sortParams = {};

  if (req.query.status) {
    findParams = {
      ...findParams,
      status: req.query.status,
    };
  }

  Application.find(findParams)
    .collation({ locale: "en" })
    .sort(sortParams)
    // .skip(skip)
    // .limit(limit)
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}

// recruiter/applicant gets all his applications [pagination]
const getApplications = (req, res) => {
  const user = req.user;

  // const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
  // const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
  // const skip = page - 1 >= 0 ? (page - 1) * limit : 0;

  Application.aggregate([
    {
      $lookup: {
        from: "jobapplicantinfos",
        localField: "userId",
        foreignField: "userId",
        as: "jobApplicant",
      },
    },
    { $unwind: "$jobApplicant" },
    {
      $lookup: {
        from: "jobs",
        localField: "jobId",
        foreignField: "_id",
        as: "job",
      },
    },
    { $unwind: "$job" },
    {
      $lookup: {
        from: "recruiterinfos",
        localField: "recruiterId",
        foreignField: "userId",
        as: "recruiter",
      },
    },
    { $unwind: "$recruiter" },
    {
      $match: {
        [user.type === "recruiter" ? "recruiterId" : "userId"]: user._id,
      },
    },
    {
      $sort: {
        dateOfApplication: -1,
      },
    },
  ])
    .then((applications) => {
      res.json(applications);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
}


const updateApplicationById = (req, res) => {
  const user = req.user;
  const id = req.params.id;
  const status = req.body.status;

  if (user.type === "recruiter") {
    if (status === "accepted") {
      Application.findOne({
        _id: id,
        recruiterId: user._id,
      })
        .then((application) => {
          if (application === null) {
            res.status(404).json({
              message: "Application not found",
            });
            return;
          }

          Job.findOne({
            _id: application.jobId,
            userId: user._id,
          }).then((job) => {
            if (job === null) {
              res.status(404).json({
                message: "Job does not exist",
              });
              return;
            }

            Application.countDocuments({
              recruiterId: user._id,
              jobId: job._id,
              status: "accepted",
            }).then((activeApplicationCount) => {
              if (activeApplicationCount < job.maxPositions) {
                // accepted
                application.status = status;
                application.dateOfJoining = req.body.dateOfJoining;
                application
                  .save()
                  .then(() => {
                    Application.updateMany(
                      {
                        _id: {
                          $ne: application._id,
                        },
                        userId: application.userId,
                        status: {
                          $nin: [
                            "rejected",
                            "deleted",
                            "cancelled",
                            "accepted",
                            "finished",
                          ],
                        },
                      },
                      {
                        $set: {
                          status: "cancelled",
                        },
                      },
                      { multi: true }
                    )
                      .then(() => {
                        if (status === "accepted") {
                          Job.findOneAndUpdate(
                            {
                              _id: job._id,
                              userId: user._id,
                            },
                            {
                              $set: {
                                acceptedCandidates: activeApplicationCount + 1,
                              },
                            }
                          )
                            .then(() => {
                              res.json({
                                message: `Application ${status} successfully`,
                              });
                            })
                            .catch((err) => {
                              res.status(400).json(err);
                            });
                        } else {
                          res.json({
                            message: `Application ${status} successfully`,
                          });
                        }
                      })
                      .catch((err) => {
                        res.status(400).json(err);
                      });
                  })
                  .catch((err) => {
                    res.status(400).json(err);
                  });
              } else {
                res.status(400).json({
                  message: "All positions for this job are already filled",
                });
              }
            });
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      Application.findOneAndUpdate(
        {
          _id: id,
          recruiterId: user._id,
          status: {
            $nin: ["rejected", "deleted", "cancelled"],
          },
        },
        {
          $set: {
            status: status,
          },
        }
      )
        .then((application) => {
          if (application === null) {
            res.status(400).json({
              message: "Application status cannot be updated",
            });
            return;
          }
          if (status === "finished") {
            res.json({
              message: `Job ${status} successfully`,
            });
          } else {
            res.json({
              message: `Application ${status} successfully`,
            });
          }
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    }
  } else {
    if (status === "cancelled") {
      console.log(id);
      console.log(user._id);
      Application.findOneAndUpdate(
        {
          _id: id,
          userId: user._id,
        },
        {
          $set: {
            status: status,
          },
        }
      )
        .then((tmp) => {
          console.log(tmp);
          res.json({
            message: `Application ${status} successfully`,
          });
        })
        .catch((err) => {
          res.status(400).json(err);
        });
    } else {
      res.status(401).json({
        message: "You don't have permissions to update job status",
      });
    }
  }
}

// get a list of final applicants for current job : recruiter
// get a list of final applicants for all his jobs : recuiter
const getApplicants = (req, res) => {
  const user = req.user;
  if (user.type === "recruiter") {
    let findParams = {
      recruiterId: user._id,
    };
    if (req.query.jobId) {
      findParams = {
        ...findParams,
        jobId: new mongoose.Types.ObjectId(req.query.jobId),
      };
    }
    if (req.query.status) {
      if (Array.isArray(req.query.status)) {
        findParams = {
          ...findParams,
          status: { $in: req.query.status },
        };
      } else {
        findParams = {
          ...findParams,
          status: req.query.status,
        };
      }
    }
    let sortParams = {};

    if (!req.query.asc && !req.query.desc) {
      sortParams = { _id: 1 };
    }

    if (req.query.asc) {
      if (Array.isArray(req.query.asc)) {
        req.query.asc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: 1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.asc]: 1,
        };
      }
    }

    if (req.query.desc) {
      if (Array.isArray(req.query.desc)) {
        req.query.desc.map((key) => {
          sortParams = {
            ...sortParams,
            [key]: -1,
          };
        });
      } else {
        sortParams = {
          ...sortParams,
          [req.query.desc]: -1,
        };
      }
    }

    Application.aggregate([
      {
        $lookup: {
          from: "jobapplicantinfos",
          localField: "userId",
          foreignField: "userId",
          as: "jobApplicant",
        },
      },
      { $unwind: "$jobApplicant" },
      {
        $lookup: {
          from: "jobs",
          localField: "jobId",
          foreignField: "_id",
          as: "job",
        },
      },
      { $unwind: "$job" },
      { $match: findParams },
      { $sort: sortParams },
    ])
      .then((applications) => {
        if (applications.length === 0) {
          res.status(404).json({
            message: "No applicants found",
          });
          return;
        }
        res.json(applications);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  } else {
    res.status(400).json({
      message: "You are not allowed to access applicants list",
    });
  }
}

// to add or update a rating [todo: test]
const updateRating = (req, res) => {
    const user = req.user;
    const data = req.body;
    if (user.type === "recruiter") {
        // can rate applicant
        Rating.findOne({
            senderId: user._id,
            receiverId: data.applicantId,
            category: "applicant",
        })
            .then((rating) => {
                if (rating === null) {
                    console.log("new rating");
                    Application.countDocuments({
                        userId: data.applicantId,
                        recruiterId: user._id,
                        status: {
                            $in: ["accepted", "finished"],
                        },
                    })
                        .then((acceptedApplicant) => {
                            if (acceptedApplicant > 0) {
                                // add a new rating

                                rating = new Rating({
                                    category: "applicant",
                                    receiverId: data.applicantId,
                                    senderId: user._id,
                                    rating: data.rating,
                                });

                                rating
                                    .save()
                                    .then(() => {
                                        // get the average of ratings
                                        Rating.aggregate([
                                            {
                                                $match: {
                                                    receiverId: mongoose.Types.ObjectId(data.applicantId),
                                                    category: "applicant",
                                                },
                                            },
                                            {
                                                $group: {
                                                    _id: {},
                                                    average: { $avg: "$rating" },
                                                },
                                            },
                                        ])
                                            .then((result) => {
                                                // update the user's rating
                                                if (result === null) {
                                                    res.status(400).json({
                                                        message: "Error while calculating rating",
                                                    });
                                                    return;
                                                }
                                                const avg = result[0].average;

                                                JobApplicant.findOneAndUpdate(
                                                    {
                                                        userId: data.applicantId,
                                                    },
                                                    {
                                                        $set: {
                                                            rating: avg,
                                                        },
                                                    }
                                                )
                                                    .then((applicant) => {
                                                        if (applicant === null) {
                                                            res.status(400).json({
                                                                message:
                                                                    "Error while updating applicant's average rating",
                                                            });
                                                            return;
                                                        }
                                                        res.json({
                                                            message: "Rating added successfully",
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        res.status(400).json(err);
                                                    });
                                            })
                                            .catch((err) => {
                                                res.status(400).json(err);
                                            });
                                    })
                                    .catch((err) => {
                                        res.status(400).json(err);
                                    });
                            } else {
                                // you cannot rate
                                res.status(400).json({
                                    message:
                                        "Applicant didn't worked under you. Hence you cannot give a rating.",
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                } else {
                    rating.rating = data.rating;
                    rating
                        .save()
                        .then(() => {
                            // get the average of ratings
                            Rating.aggregate([
                                {
                                    $match: {
                                        receiverId: mongoose.Types.ObjectId(data.applicantId),
                                        category: "applicant",
                                    },
                                },
                                {
                                    $group: {
                                        _id: {},
                                        average: { $avg: "$rating" },
                                    },
                                },
                            ])
                                .then((result) => {
                                    // update the user's rating
                                    if (result === null) {
                                        res.status(400).json({
                                            message: "Error while calculating rating",
                                        });
                                        return;
                                    }
                                    const avg = result[0].average;
                                    JobApplicant.findOneAndUpdate(
                                        {
                                            userId: data.applicantId,
                                        },
                                        {
                                            $set: {
                                                rating: avg,
                                            },
                                        }
                                    )
                                        .then((applicant) => {
                                            if (applicant === null) {
                                                res.status(400).json({
                                                    message:
                                                        "Error while updating applicant's average rating",
                                                });
                                                return;
                                            }
                                            res.json({
                                                message: "Rating updated successfully",
                                            });
                                        })
                                        .catch((err) => {
                                            res.status(400).json(err);
                                        });
                                })
                                .catch((err) => {
                                    res.status(400).json(err);
                                });
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                }
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    } else {
        // applicant can rate job
        Rating.findOne({
            senderId: user._id,
            receiverId: data.jobId,
            category: "job",
        })
            .then((rating) => {
                console.log(user._id);
                console.log(data.jobId);
                console.log(rating);
                if (rating === null) {
                    console.log(rating);
                    Application.countDocuments({
                        userId: user._id,
                        jobId: data.jobId,
                        status: {
                            $in: ["accepted", "finished"],
                        },
                    })
                        .then((acceptedApplicant) => {
                            if (acceptedApplicant > 0) {
                                // add a new rating

                                rating = new Rating({
                                    category: "job",
                                    receiverId: data.jobId,
                                    senderId: user._id,
                                    rating: data.rating,
                                });

                                rating
                                    .save()
                                    .then(() => {
                                        // get the average of ratings
                                        Rating.aggregate([
                                            {
                                                $match: {
                                                    receiverId: mongoose.Types.ObjectId(data.jobId),
                                                    category: "job",
                                                },
                                            },
                                            {
                                                $group: {
                                                    _id: {},
                                                    average: { $avg: "$rating" },
                                                },
                                            },
                                        ])
                                            .then((result) => {
                                                if (result === null) {
                                                    res.status(400).json({
                                                        message: "Error while calculating rating",
                                                    });
                                                    return;
                                                }
                                                const avg = result[0].average;
                                                Job.findOneAndUpdate(
                                                    {
                                                        _id: data.jobId,
                                                    },
                                                    {
                                                        $set: {
                                                            rating: avg,
                                                        },
                                                    }
                                                )
                                                    .then((foundJob) => {
                                                        if (foundJob === null) {
                                                            res.status(400).json({
                                                                message:
                                                                    "Error while updating job's average rating",
                                                            });
                                                            return;
                                                        }
                                                        res.json({
                                                            message: "Rating added successfully",
                                                        });
                                                    })
                                                    .catch((err) => {
                                                        res.status(400).json(err);
                                                    });
                                            })
                                            .catch((err) => {
                                                res.status(400).json(err);
                                            });
                                    })
                                    .catch((err) => {
                                        res.status(400).json(err);
                                    });
                            } else {
                                // you cannot rate
                                res.status(400).json({
                                    message:
                                        "You haven't worked for this job. Hence you cannot give a rating.",
                                });
                            }
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                } else {
                    // update the rating
                    rating.rating = data.rating;
                    rating
                        .save()
                        .then(() => {
                            // get the average of ratings
                            Rating.aggregate([
                                {
                                    $match: {
                                        receiverId: mongoose.Types.ObjectId(data.jobId),
                                        category: "job",
                                    },
                                },
                                {
                                    $group: {
                                        _id: {},
                                        average: { $avg: "$rating" },
                                    },
                                },
                            ])
                                .then((result) => {
                                    if (result === null) {
                                        res.status(400).json({
                                            message: "Error while calculating rating",
                                        });
                                        return;
                                    }
                                    const avg = result[0].average;
                                    console.log(avg);

                                    Job.findOneAndUpdate(
                                        {
                                            _id: data.jobId,
                                        },
                                        {
                                            $set: {
                                                rating: avg,
                                            },
                                        }
                                    )
                                        .then((foundJob) => {
                                            if (foundJob === null) {
                                                res.status(400).json({
                                                    message: "Error while updating job's average rating",
                                                });
                                                return;
                                            }
                                            res.json({
                                                message: "Rating added successfully",
                                            });
                                        })
                                        .catch((err) => {
                                            res.status(400).json(err);
                                        });
                                })
                                .catch((err) => {
                                    res.status(400).json(err);
                                });
                        })
                        .catch((err) => {
                            res.status(400).json(err);
                        });
                }
            })
            .catch((err) => {
                res.status(400).json(err);
            });
    }
}

// get personal rating
const getRating = (req, res) => {
  const user = req.user;
  Rating.findOne({
    senderId: user._id,
    receiverId: req.query.id,
    category: user.type === "recruiter" ? "applicant" : "job",
  }).then((rating) => {
    if (rating === null) {
      res.json({
        rating: -1,
      });
      return;
    }
    res.json({
      rating: rating.rating,
    });
  });
}

const postTraining = (req, res) => {
  const data = req.body;
  
    // recruiter can add training
    const training = new Training({
      title: data.title,
      description: data.description,
      duration: data.duration,
      location: data.location,
      skills: data.skills,
      link: data.link,
    });
  
    training
      .save()
      .then((training) => {
        res.json({
          message: "Training added successfully",
        });
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  
  
}


// list of al the functions in this file
const Api_Controller = {
  postTraining,
    postJobs,
    getJobs,
    getJobById,
    updateJobById,
    deleteJobById,
    postJobApplicationsById,
    getApplicants,
    getApplications,
    getJobApplicationsById,
    getRating,
    getUser,
    getUserById,
    updateApplicationById,
    updateRating,
    updateUser,
  deleteJobById,
    getTraining,
};

module.exports = Api_Controller;
