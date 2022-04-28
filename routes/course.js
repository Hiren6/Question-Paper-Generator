const express = require('express');
const router = express.Router();
const client = require('../models/db').client

router.get('/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const chapter_list = `Select chapter_no, chapter_name from Chapter where course_id = $1`;
    const c_name = `Select course_name from Course where course_id = $1`
    
    try{
        const chapters = await client.query(chapter_list,[c_id]);
        const chap_name = await client.query(c_name,[c_id]);

        res.render('course_page', {
            course_id : c_id,
            chapter : chapters.rows,
            chap_name : chap_name.rows[0]
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/TA/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const ta_list = `select user_name from Users
                    join Teaches on Users.user_id = Teaches.user_id
                    where authorization_level = 'TA' and course_id = $1`;

    try{

        const tas = await client.query(ta_list,[c_id]);

        res.render('course_TA', {
            course_id : c_id,
            tas : tas.rows
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/paper/:c_id', async (req, res) => {
    const {c_id} = req.params;

    const paper_list = `Select Paper.paper_id,total_marks,paper_type,paper_date,duration,start_time
                        from Paper join Course_paper on Paper.paper_id = Course_paper.paper_id where course_id = $1`;

    try{
        const papers = await client.query(paper_list,[c_id]);

        res.render('course_paper', {
            course_id : c_id,
            papers : papers.rows
        })
    }
    catch (e) { console.error(e.message); }

});

router.post('/remove/:c_id', async (req, res) => {
    const {chapter_id} = req.body;
    const blah = `Delete from Chapter where chapter_id = $1`;
    const rem_ques = await client.query(blah,[chapter_id]);
    res.redirect('/course/:c_id');
});

module.exports = router;
