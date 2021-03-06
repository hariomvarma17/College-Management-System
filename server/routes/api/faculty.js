const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
const Faculty = require("../../models/Admin/Faculty");
const Joi = require('joi');

router.get('/',async(req,res)=>{
  const faculty = await Faculty.find();
  res.send(faculty);
});

router.post("/register", async(req, res) => {
    // Form validation
    const { error } = validateRegister(req.body);
    // Check validation
    if (error) {
      console.log("This",error);
     return res.status(400).json(error);
    }
    let faculty=await Faculty.findOne({ email: req.body.email });
    if (faculty) return res.status(400).json({ email: "Email already exists" });

    faculty = new Faculty({
        id: req.body.id,
        password: req.body.dob,
        firstName: req.body.firstName,
        middleName: req.body.middleName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        dob: req.body.dob,
        mob_no: req.body.mob_no,
        email: req.body.email,
        altEmail: req.body.altEmail,
        address1: req.body.address1, 
        address2: req.body.address2,
        city: req.body.city,
        pincode: req.body.pincode,
        state: req.body.state,
        country: req.body.country,
        dept:req.body.dept,
        branch: req.body.branch,
        coursesTaught:req.body.coursesTaught
    });

    const salt =await bcrypt.genSalt(10);
    faculty.password=await bcrypt.hash(faculty.password,salt);

    await faculty.save();
    
    res.send(faculty);
});    


router.post("/login",async(req, res) => {
// Form validation
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).json(error);

  const id = req.body.id;
  const password = req.body.password;

  let faculty=await Faculty.findOne({ id });
  if (!faculty) return res.status(404).json({ IdNotFound: "Faculty ID not found" });

  const validPassword=await bcrypt.compare(password,faculty.password)
  if(!validPassword) return res.status(400).send('Invalid Password.');

  const payload = {
    id:faculty._id,
    firstName: faculty.firstName,
    middleName:faculty.middleName,
    lastName:faculty.lastName,
    faculty_id:faculty.id,
    gender: faculty.gender,
    dob: faculty.dob,
    mob_no: faculty.mob_no,
    email: faculty.email,
    altEmail: faculty.altEmail,
    address1: faculty.address1, 
    address2: faculty.address2,
    city: faculty.city,
    pincode: faculty.pincode,
    state: faculty.state,
    country: faculty.country,
    coursesTaught: faculty.coursesTaught,
    dept:faculty.dept,
    branch: faculty.branch,
    role:"Faculty"
  };

  const token = await jwt.sign(payload,keys.secretOrKey,{expiresIn:31556926});

  res.header('x-auth-token',token).send("Successfully logged in.");
  });

  router.put('/update/:id',async(req,res)=>{
    const faculty = Faculty.findById(id);
    if(!fauclty) return res.send(400).send('Faculty not found');

    (await faculty).set({
      coursesTaught:req.body
    });

    faculty=await faculty.save();
    res.send(faculty);
  });

  function validateRegister(req){
    const schema = {
        password:Joi.string(),
        firstName:Joi.string(),
        middleName:Joi.string().allow('').allow(null),
        lastName:Joi.string(),
        gender:Joi.string(),
        dob:Joi.string(),
        mob_no:Joi.number(),
        email:Joi.string(),
        altEmail:Joi.string().allow('').allow(null),
        address1:Joi.string(),
        address2:Joi.string(),
        city:Joi.string(),
        pincode:Joi.number(),
        state:Joi.string(),
        country:Joi.string(),
        id:Joi.number(),
        coursesTaught:Joi.array().items(Joi.string()).allow(null).allow(''),
        dept:Joi.string(),
        branch:Joi.string().allow('').allow(null)
    }
    return Joi.validate(req,schema);
}

function validateLogin(req){
    const schema = {
        id:Joi.number(),
        password:Joi.string()
    }
    return Joi.validate(req,schema);
}
  module.exports = router;
