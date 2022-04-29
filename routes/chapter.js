const express = require('express');
const router = express.Router();
const client = require('../models/db').client

router.get('/:c_id', async (req, res) => {

    const {c_id} = req.params;

    const q_list = `select q_stmt,difficulty, q_type from Question
    where chapter_id = $1`;

    try {
        const questions = await client.query(q_list,[c_id]);

        res.render('chapter', {
            chapter_id : c_id,
            question : questions.rows
        }); 
    }

    catch (e) { console.error(e.message); }

});

router.post('/:c_id/add', async (req, res) => {
    const {difficulty,q_type,q_stmt,a,b,c,d} = req.body;
    if (q_type == 'MCQ'){
        q_stmt = q_stmt + '#$' + a + '#$' + b + '#$' + c + '#$' + d;
    }
    const {c_id}=req.params;
    let errors = [];
    if(!question_id || !q_stmt || !q_type || !difficulty){
        errors.push({ msg: "Please fill in all the fields" })
    }
    if(errors.length>0){
        res.render(':c_id/add', {
            errors: errors,
            question_id : question_id,
            q_stmt : q_stmt,
            q_type : q_type,
            difficulty : difficulty,
            chapter_id : chapter_id
        });
    }
    const q_add = `insert into Question
    Values($1,$2,$3,$4,$5)`;

    const insert_ques = await client.query(q_add,[question_id,q_stmt,q_type,difficulty,c_id]);

    res.redirect('/chapter/'+c_id);
}); 

module.exports = router;



