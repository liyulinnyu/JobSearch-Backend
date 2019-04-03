const Company = require('../../model/company');
const User = require('../../model/user');
const Job = require('../../model/job');
const JWT = require('jsonwebtoken');


const transferCompany = (company) => ({
    _id: company._id,
    email: company.email,
    name: company.name,
    address: company.address,
    type: company.type,
    description: company.description,
    imgUrl: company.imgUrl,
    identification: 1,
    jobs: nestedJob.bind(this, company.jobs)
});


const transferJob = (item) => ({
    _id: item._id,
    title: item.title,
    description: item.description,
    requirement: item.requirement,
    date: new Date(item.date).toLocaleDateString(),
    type: item.type,
    companyId: nestedCompany.bind(this, item.companyId),
    applicants: nestedUser.bind(this, item.applicants)
});


const transferUser = (item) => ({
    _id: item._id,
    username: item.username,
    email: item.email,
    skills: item.skills,
    desire: item.desire,
    identification: 0,
    jobs: nestedJob.bind(this, item.jobs)
});


const nestedCompany = async (companyId) => {
    const company = await Company.findById(companyId);
    return transferCompany(company);
}

const nestedSingleJob = async (jobId) => {
    const item = await Job.findById(jobId);
    return transferJob(item);
}

const nestedJob = (jobs) => {
    if (Array.isArray(jobs)) {
        return jobs.map(jobId => (
            nestedSingleJob(jobId)
        ))
    } else {
        return nestedSingleJob(jobs);
    }
}

const nestedSingleUser = async (userId) => {
    const item = await User.findById(userId);
    return transferUser(item);
}

const nestedUser = (users) => {
    if (Array.isArray(users)) {
        return users.map(userId => (
            nestedSingleUser(userId)
        ))
    } else {
        return nestedSingleUser(users);
    }
}


module.exports = {
    // query
    company: async (args) => {
        try {
            if (args.companyId) {
                return transferCompany(await Company.findById(args.companyId));
            } else if (args.email && args.password) {
                return transferCompany(await Company.findOne({email: args.email}));
            } else {
                return new Error(`Sorry, Cannot find the company`);
            }
        } catch(err) {
            return new Error(`Sorry, internal error`);
        }
    },

    getAllJobs: async (args) => {
        try {
            return nestedJob(await Job.find());
        } catch (err) {
            return new Error('internal error');
        }
    },

    getJobsByTitle: async (args) => {
        try {
            return nestedJob(await Job.find({title: args.title}));
        } catch (err) {
            return new Error(`Sorry, internal error`);
        }
    },

    getJobsByCompany: async (args) => {
        try {
            const company = await Company.findById(args.companyId);
            return nestedJob(company.jobs);
        } catch (err) {
            return new Error(`Sorry, internal error`);
        }
    },

    getJobsById: async (args) => {
        try {
            const job = await Job.findById(args.id);
            console.log('here');
            return transferJob(job);
        } catch (err) {
            return new Error(`Sorry, internal error`);
        }
    },

    getJobsByUser: async (args) => {
        try {
            const user = await User.findById(args.userId);
            return nestedJob(user.jobs);
        } catch (err) {
            return new Error(`Sorry, internal error`);
        }
    },

    companyLogin: async (args) => {
        try {
            const object = await Company.findOne({email: args.email});
            if (object.password !== args.password) {
                return new Error('cannot login');
            }
            return {
                ...transferCompany(object)
            };
        } catch (err) {
            return new Error('cannot login');
        }
    },

    userLogin: async (args) => {
        try {
            const object = await User.findOne({email: args.email});
            if (object.password !== args.password) {
                return new Error('cannot login');
            }
            return {
                ...transferUser(object)
            };
        } catch (err) {
            return new Error('cannot login');
        }
    },

    // mutation
    createCompany: async (args, req) => {
        const company = new Company({
            email: args.companyInput.email,
            password: args.companyInput.password,
            name: args.companyInput.name,
            address: args.companyInput.address,
            type: args.companyInput.type,
            description: args.companyInput.description || '',
            imgUrl: args.companyInput.imgUrl || '',
            identification: 1,
            jobs: []
        });
        const res = await company.save();
        return transferCompany(res);
    },

    createUser: async (args) => {
        const user = new User({
            email: args.userInput.email,
            password: args.userInput.password,
            username: args.userInput.username,
            skills: args.userInput.skills || [],
            desire: args.userInput.desire || [],
            identification: 0,
            jobs: []
        });
        const res = await user.save();
        return transferUser(res);
    },

    createJob: async (args) => {
        const job = new Job({
            title: args.jobInput.title,
            description: args.jobInput.description,
            requirement: args.jobInput.requirement || [],
            date: (new Date()).toISOString(),
            type: args.jobInput.type,
            companyId: args.jobInput.companyId,
            applicants: []
        });
        
        let company = await Company.findById(args.jobInput.companyId);
        

        const res = await job.save();

        company.jobs.push(res._id);
        await company.save();
        
        return transferJob(res);
    },

    updateJob: async (args) => {
        const job = await Job.findOneAndUpdate({_id:args.updateInput._id}, {
            title: args.updateInput.title,
            description: args.updateInput.description,
            requirement: args.updateInput.requirement,
            type: args.updateInput.type
        });

        return transferJob(job);
    },

    applyJob: async (args) => {
        try {
            let job = await Job.findById(args.jobId);
            let user = await User.findById(args.userId);
            
            user.jobs.push(args.jobId);
            job.applicants.push(args.userId);

            await user.save();
            await job.save();

            return transferJob(job);

        } catch(err) {
            return new Error('internal error');
        }
        
    },

    getRecommendJobs: async (args) => {
        try {
            let arr = args.desire.join(',').replace(/ /g, ',').split(',');
            arr = arr.map(item => {
                return new RegExp(item, 'i');
            });
            
            let jobs = await Job.find({title: {$in: arr}}).skip(parseInt(Math.random()*10)).limit(5);

            return nestedJob(jobs);

        } catch (err) {
            return new Error('internal error');
        }
    },

    deleteJob: async (args) => {
        try {  
            const job = await Job.findOneAndRemove({_id: args.jobId});

            let company = await Company.findById(job.companyId);
            company.jobs.splice(company.jobs.indexOf(job._id), 1);
            await company.save();


            // delete applicants

            job.applicants.map(async item => {
                let user = await User.findById(item);
                user.jobs.splice(user.jobs.indexOf(job._id), 1);
                await user.save();
            })

            return job;

        } catch(err) {
            return new Error('internal error');
        }
    },

    sortJobs: async (args) => {
        try {
            let text = args.sortedText;
            let jobs = await Job.find();
            if (text === 'job-title') {
                jobs.sort((n1,n2) => {
                    if (n1.title > n2.title) {
                        return 1;
                    }
                    return -1;
                })
            }

            return jobs.map(item => {
                return transferJob(item);
            });
        } catch (err) {
            return new Error('interval error');
        }
    },

    searchJobs: async (args) => {
        try {
            let reg = new RegExp(args.text, 'i');
            
            let jobs = await Job.find({title: {$regex: reg}});

            return jobs.map(item => {
                return transferJob(item);
            });

        } catch (err) {
            return new Error('internal error');
        }
    }
}