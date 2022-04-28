const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require("../config/auth.js")
const client = require('../models/db').client

router.get('/', ensureAuthenticated, async (req, res) => {
    res.redirect('/dashboard/' + req.user.user_id);
})

router.get('/:u_id', ensureAuthenticated, async (req, res) => {
    const {u_id} = req.params;
    const course_list = `Select Course.course_id, course_name from Course join Teaches on Course.course_id = Teaches.course_id where user_id = $1`;
    
    try{
        const courses = await client.query(course_list,[u_id]);

        res.render('course_page', {
            courses : courses.rows
        })
    }
    catch (e) { console.error(e.message); }

});

router.post('/:u_id/add', ensureAuthenticated, async (req, res) => {
    const {course_id,course_name,user_id} = req.body;
    let errors = [];
    if(!course_id || !course_name){
        errors.push({ msg: "Please fill in all the fields" })
    }
    if(errors.length>0){
        res.render('err', {
            errors: errors,
            course_id : course_id,
            course_name : course_name,
            user_id : user_id
        });
    }
    const c_add = `insert into Course
    values($1,$2)`;
    const t_add = `insert into Teaches
    values($1,$2)`;

    const insert_course = await client.query(c_add,[course_id,course_name]);
    const insert_teach = await client.query(t_add,[user_id,  course_id])

    res.redirect('/:u_id');
}); 

router.post('/remove/:u_id', ensureAuthenticated, async (req, res) => {
    const {course_id} = req.body;
    const blah = `Delete from Teaches where course_id = $1`;
    const rem_course = await client.query(blah,[course_id]);
    res.redirect('/dashboard/:u_id');
});

module.exports = router;
