const express = require('express');
const cli = require('nodemon/lib/cli');
const { ensureAuthenticated } = require('../config/auth');
const router = express.Router();
const client = require('../models/db').client
let globallis = []

router.get('/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const chapter_list = `Select chapter_id, chapter_no, chapter_name from Chapter where course_id = $1`;
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
    const{c_id}=req.params;
    const blah = `Delete from Chapter where chapter_id = $1`;
    const rem_ques = await client.query(blah,[chapter_id]);
    res.redirect('/course/'+c_id);
});


router.post('/add/:c_id', async (req, res) => {
    const {chapter_no,chapter_name} = req.body;
    const{c_id}=req.params;
    const blah = `Insert into Chapter values($1,$2,$3)`;
    const add_chap = await client.query(blah,[chapter_no,chapter_name,c_id]);
    res.redirect('/course/'+c_id);
});

router.post('/generatep/:c_id', ensureAuthenticated, async (req, res) => {
    const{total_marks,paper_type,paper_date,duration,start_time} = req.body;
    const genpaper = `insert into Paper
    values($1,$2,$3,$4,$5)`;
    
    const pid = `select paper_id from Paper where 
    total_marks = $1 and paper_type = $2 and paper_date = $3 and duration = $4 and start_time = $5`;

    const genp = await client.query(genpaper,[total_marks,paper_type,paper_date,duration,start_time]);
    

    const p_id = await client.query(pid,[total_marks,paper_type,paper_date,duration,start_time]);
    res.redirect('/course/form2/'+ c_id+ '/' + p_id.rows[0].paper_id);
});

router.get('/form2/:c_id/:p_id', ensureAuthenticated, async (req,res) => {
    const{c_id,p_id} = req.params;
    


    try{
        
        
        res.render('give_paper', {
            course_id : c_id,
            paper_id : p_id
        })
    }
    catch (e) { console.error(e.message); }

});

router.post('/generateq/:c_id/:p_id', ensureAuthenticated, async (req, res) => {
    const {chapter_no,q_type,difficulty,num} = req.body;
    const {c_id,p_id} = req.params;
    const generate_question = `select question_id from Question
                                join Chapter on Question.chapter_id = Chapter.chapter_id
                                join Course on Chapter.course_id = Course.course_id
                                where Course.course_id = $1 and q_type = $2
                                and difficulty = $3 and chapter_no = $4
                                order by RANDOM() Limit $5`;

    const addcha = `select chapter_id from Chapter where chapter_no = $1, course_id = $2`;
    const genchap = `insert into Paper_chapter values($1,$2)`;
    const gencourse = `insert into Course_paper values($1,$2)`; 
    const gen_q = await client.query(generate_question,[c_id,q_type,difficulty,chapter_no,num]);
    for(let i =0; i< gen_q.rows.length;i++){
        const addquestion = `insert into Paper_question values($1,$2)`;
        const genadd = await client.query(addquestion,[gen_q.rows[i].question_id, p_id]);
    }
    const add_cha = await client.query(addcha,[chapter_no,c_id]);
    const gen_chap = await client.query(genchap,[p_id,add_cha.rows[0].chapter_id]);
    const gen_course = await client.query(gencourse,[c_id,p_id]);

    res.redirect('/course/generateq/'+c_id);
});

router.get('generatepaper/:c_id/:p_id', ensureAuthenticated, async (req,res) => {
    const{p_id} = req.params;

    const finalgen = `select q_stmt, q_type from Question
    join Paper_question on Question.question_id
    Paper_question.question_id
    where paper_id = $1`;

    try{
        
        const final_gen = await client.query(finalgen,[p_id]) 
        res.render('generate_paper', {
            final_gen : final_gen.rows
        })
    }
    catch (e) { console.error(e.message); }

});

module.exports = router;
