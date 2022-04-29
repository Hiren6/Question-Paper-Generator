const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require("../config/auth.js")
const client = require('../models/db').client
router.get('/', ensureAuthenticated, async (req, res) => {
    res.redirect('/dashboard/' + req.user.user_id);
})

router.get('/:u_id', ensureAuthenticated, async (req, res) => {
    const {u_id} = req.params;
    const auth_q = `select authorization_level from users where user_id = $1`;
    const course_list = `Select Course.course_id, course_name from Course join Teaches on Course.course_id = Teaches.course_id where user_id = $1`;
    
    try{
        const auth_level = await client.query(auth_q,[u_id]);
        console.log(auth_level.rows[0].authorization_level)
        const courses = await client.query(course_list,[u_id]);
        if(auth_level.rows[0].authorization_level == "Admin")
            res.render('home.ejs', {user: req.user.user_name})  
        else {
            res.render('courses', {
                courses : courses.rows,
                user_id:u_id
            })
        }
    }
    catch (e) { console.error(e.message); }

});

router.post('/:u_id/add', ensureAuthenticated, async (req, res) => {
    const {course_id,course_name} = req.body;
    const {u_id}=req.params;
    let errors = [];
    if(!course_id || !course_name){
        errors.push({ msg: "Please fill in all the fields" })
    }
    if(errors.length>0){
        res.render('courses', {
            errors: errors,
            course_id : course_id,
            course_name : course_name,
            user_id : u_id
        });
    }
    const c_add = `insert into Course
    values($1,$2)`;
    const t_add = `insert into Teaches
    values($1,$2)`;

    const insert_course = await client.query(c_add,[course_id,course_name]);
    const insert_teach = await client.query(t_add,[u_id,  course_id])

    res.redirect('/dashboard/'+u_id);
}); 

router.post('/remove/:u_id/:c_id', ensureAuthenticated, async (req, res) => {
    const {u_id, c_id}=req.params;
    console.log("Deleting" + c_id + "and" + u_id);
    console.log(req.body);
    const blah = `Delete from Teaches where course_ID = $1 and user_id = $2`;
    const rem_course = await client.query(blah,[c_id, u_id]);
    res.redirect('/dashboard/'+u_id);
});

module.exports = router;