const express = require('express');
const router = express.Router();
const User = require("../models/user");
const passport = require('passport');
const bcrypt = require('bcrypt');

router.get('/course/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const chapter_list = `Select chapter_no, chapter_name from Chapter where course_id = $1`;
    
    try{
        const chapters = await client.query(chapter_list,[c_id]);

        res.render('get_chapters', {
            course_id : c_id,
            chapter : chapters.rows
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/course/TA/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const ta_list = `select user_name from Users
                    join Teaches on Users.user_id = Teaches.user_id
                    where authorization_level = 'TA' and course_id = $1`;

    try{

        const tas = await client.query(ta_list,[c_id]);

        res.render('get_tas', {
            course_id : c_id,
            tas : tas.rows
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/course/paper/:c_id', async (req, res) => {
    const {c_id} = req.params;

    const paper_list = `Select Paper.paper_id,total_marks,paper_type,paper_date,duration,start_time
                        from Paper join Course_paper on Paper.paper_id = Course_paper.paper_id where course_id = $1`;

    try{
        const papers = await client.query(paper_list,[c_id]);

        res.render('get_papers', {
            course_id : c_id,
            papers : papers.rows
        })
    }
    catch (e) { console.error(e.message); }

});

