const express = require('express');
const router = express.Router();
const client = require('../models/db').client

router.get('/:c_id', async (req, res) => {

    const {c_id} = req.params;

    const q_list = `select question_id,q_stmt,difficulty, q_type from Question
    where chapter_id = $1`;

    try {
        const questions = await client.query(q_list,[c_id]);

        res.render('chapter', {
            chapter_id : c_id,
            question : questions.rows,
            title:"Question List"
        }); 
    }

    catch (e) { console.error(e.message); }

});

router.post('/:c_id/add', async (req, res) => {
    var {difficulty,q_type,q_stmt,a,b,c,d} = req.body;
    if (q_type == 'MCQ'){
        q_stmt = q_stmt + '#$' + a + '#$' + b + '#$' + c + '#$' + d;
    }
    console.log("difficulty:"+difficulty+"\nq_stmt"+q_stmt)
    const {c_id}=req.params;
    let errors = [];
    if(!q_stmt || !q_type || !difficulty){
        errors.push({ msg: "Please fill in all the fields" })
    }
    if(errors.length>0){
        res.render(':c_id/add', {
            errors: errors,
            //question_id : question_id,
            q_stmt : q_stmt,
            q_type : q_type,
            difficulty : difficulty,
            chapter_id : chapter_id
        });
    }
    const q_add = `insert into Question(q_stmt,q_type,difficulty,chapter_id)
    select $1,$2,$3,$4 where not exists (select 1 from Question where q_stmt = $1 and q_type = $2 and difficulty = $3 and chapter_id = $4)`;

    const insert_ques = await client.query(q_add,[q_stmt,q_type,difficulty,c_id]);

    res.redirect('/chapter/'+c_id);
});

router.get('/remove/:q_id/:chapter_id'  , async (req, res) => {
    const {q_id, chapter_id} = req.params;
    const query = `Delete from Question where question_id = $1`;
    const rem_question = await client.query(query,[q_id]);
    res.redirect('/chapter/' + chapter_id);
});

module.exports = router;



