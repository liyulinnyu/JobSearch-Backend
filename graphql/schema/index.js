const { buildSchema } = require('graphql');

module.exports = buildSchema(`

    type Company {
        _id: ID!
        email: String!
        password: String!
        name: String!
        address: String!
        type: String!
        description: String
        imgUrl: String 
        identification: Int!
        jobs: [Job!]!
    }

    type User {
        _id: ID!
        username: String!
        email: String!
        password: String!
        identification: Int!
        skills: [String!]!
        desire: [String!]!
        jobs: [Job!]!
    }

    type Job {
        _id: ID!
        title: String!
        description: String!
        requirement: [String!]!
        date: String!
        type: String!
        companyId: Company!
        applicants: [User!]!
    }


    input CreateUserInput {
        username: String!
        email: String!
        password: String!
        skills: [String!]
        desire: [String!]
    }

    input CreateCompanyInput {
        email: String!
        password: String!
        name: String!
        address: String!
        type: String!
        description: String
        imgUrl: String
    }

    input CreateJobInput {
        title: String!
        description: String!
        requirement: [String!]!
        type: String!
        companyId: String!
    }

    input UpdateJobInput {
        _id: String!
        title: String!
        description: String!
        requirement: [String!]!
        type: String!
    }

    type RootQuery {
        user(email: String!, password: String!): User!
        company(companyId: String, email: String, password: String): Company!
        companyLogin(email: String!, password: String!): Company!
        userLogin(email: String!, password: String!): User!
        getAllJobs: [Job!]!
        getJobsByTitle(title: String!): [Job!]!
        getJobsByCompany(companyId: String!): [Job!]!
        getJobsById(id: String!): Job!
        getJobsByUser(userId: String!): [Job!]!
        getRecommendJobs(desire: [String!]): [Job!]!
        sortJobs(sortedText: String!): [Job!]!
        searchJobs(text: String!): [Job!]!
    }

    type RootMutation {
        createUser(userInput: CreateUserInput): User!
        createCompany(companyInput: CreateCompanyInput): Company!
        createJob(jobInput: CreateJobInput): Job!
        updateJob(updateInput: UpdateJobInput): Job!
        applyJob(userId: String!, jobId: String!): Job!
        deleteJob(jobId: String!): Job!
        
    }

    schema {
        query: RootQuery 
        mutation: RootMutation
    }

`);