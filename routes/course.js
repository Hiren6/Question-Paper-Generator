const express = require('express');
const cli = require('nodemon/lib/cli');
const { ensureAuthenticated } = require('../config/auth');
const router = express.Router();
const client = require('../models/db').client

// //for pdf
var pdf        = require('html-pdf');
var fs         = require('fs');
var options    = {format:'A4'};
//var bodyParser = require('body-parser');
//router.use(bodyParser.urlencoded({extended:false}));

router.get('/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const chapter_list = `Select chapter_id, chapter_no, chapter_name from Chapter where course_id = $1`;
    const c_name_query = `Select course_name from Course where course_id = $1`
    
    try{
        const chapters = await client.query(chapter_list,[c_id]);
        const course_name = await client.query(c_name_query,[c_id]);
        res.render('course_page', {
            course_id : c_id,
            c : course_name.rows[0],
            chapter : chapters.rows,
            title:"Chapter List"
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/TA/:c_id', async (req, res) => {
    const {c_id} = req.params;
    const ta_list = `select Users.user_id, user_name, roll_no from Users
                    join Teaches on Users.user_id = Teaches.user_id
                    where authorization_level = 'TA' and course_id = $1`;
    const c_name_query = `Select course_name from Course where course_id = $1`
    try{

        const tas = await client.query(ta_list,[c_id]);
        const course_name = await client.query(c_name_query,[c_id]);
        res.render('course_TA', {
            course_id : c_id,
            c : course_name.rows[0],
            tas : tas.rows,
            title:"TA List"
        })
    }
    catch (e) { console.error(e.message); }

});

router.post('/TA/:c_id', async (req, res) => {
    const {roll_no} = req.body;
    const {c_id} = req.params;
    let errors = [];
    if(!roll_no)
        errors.push({ msg: "Please fill the roll number field" })
    
    if(errors.length > 0) {
        res.render('course_TA', {
            errors: errors,
            course_id: c_id,
            roll_no: roll_no
        })
    }
    const find_uid_q = `select user_id from users where roll_no = $1`;
    const insert_ta_q = `insert into Teaches
    select $1,$2 where not exists (select 1 from Teaches where user_id = $1 and course_id = $2)`;
    try{
        const uid = await client.query(find_uid_q,[roll_no]);
        const insert_TA = await client.query(insert_ta_q, [uid.rows[0].user_id, c_id]);
        res.redirect('/course/TA/' + c_id)
    }
    catch (e) { console.error(e.message); }
});

router.get('/remove/TA/:course_id/:u_id', async (req, res) => {
    const{course_id, u_id}=req.params;
    const blah = `Delete from Teaches where course_id = $1 and user_id = $2`;
    const rem_ques = await client.query(blah,[course_id, u_id]);
    res.redirect('/course/TA/'+course_id);
});

router.get('/paper/:c_id', async (req, res) => {
    const {c_id} = req.params;

    const paper_list = `Select Paper.paper_id,total_marks,paper_type,paper_date,duration,start_time
                        from Paper join Course_paper on Paper.paper_id = Course_paper.paper_id where course_id = $1`;
    const c_name_query = `Select course_name from Course where course_id = $1`;
    try{
        const papers = await client.query(paper_list,[c_id]);
        const course_name = await client.query(c_name_query,[c_id]);
        console.log(papers);

        res.render('course_paper', {
            course_id : c_id,
            c : course_name.rows[0],
            papers : papers.rows,
            title:"Paper List"
        })
    }
    catch (e) { console.error(e.message); }

});

router.get('/remove/:course_id/:c_id', async (req, res) => {
    const{course_id, c_id}=req.params;
    const blah = `Delete from Chapter where chapter_id = $1`;
    const rem_ques = await client.query(blah,[c_id]);
    res.redirect('/course/'+course_id);
});


router.post('/add/:c_id', async (req, res) => {
    const {chapter_no,chapter_name} = req.body;
    console.log(chapter_no + '\n' + chapter_name)
    const{c_id}=req.params;
    const blah = `Insert into Chapter(chapter_no, chapter_name, course_id) select $1,$2,$3
                  where not exists (select 1 from Chapter where chapter_no = $1 and chapter_name = $2 and course_id = $3)`;
    const add_chap = await client.query(blah,[chapter_no,chapter_name,c_id]);
    res.redirect('/course/'+c_id);
});

router.post('/generatep/:c_id', ensureAuthenticated, async (req, res) => {
    const{total_marks,paper_type,paper_date,duration,start_time} = req.body;
    const {c_id}=req.params;
    const genpaper = `insert into Paper(total_marks,paper_type,paper_date,duration,start_time)
    select $1,$2,$3,$4,$5 where not exists(select 1 from Paper where total_marks = $1 and paper_type = $2 and paper_date = $3 and duration = $4 and start_time = $5)`;
    
    const pid = `select paper_id from Paper where 
    total_marks = $1 and paper_type = $2 and paper_date = $3 and duration = $4 and start_time = $5`;
    const gencourse = `insert into Course_paper select $1,$2 
                       where not exists (select 1 from Course_paper where course_id = $1 and paper_id = $2)`; 
    

    const genp = await client.query(genpaper,[total_marks,paper_type,paper_date,duration,start_time]);
    

    const p_id = await client.query(pid,[total_marks,paper_type,paper_date,duration,start_time]);
    const gen_course = await client.query(gencourse,[c_id,p_id.rows[0].paper_id]);

    res.redirect('/course/form2/'+ c_id+ '/' + p_id.rows[0].paper_id);
});

router.get('/form2/:c_id/:p_id', ensureAuthenticated, async (req,res) => {
    const{c_id,p_id} = req.params;
    try{
        res.render('generate_paper', {
            course_id : c_id,
            paper_id : p_id,
            title:"Select Form"
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

    const addcha = `select chapter_id from Chapter where chapter_no = $1 and course_id = $2`;
    const genchap = `insert into Paper_chapter select $1,$2 where not exists (select 1 from Paper_chapter where paper_id=$1 and chapter_id=$2)`;
    const gen_q = await client.query(generate_question,[c_id,q_type,difficulty,chapter_no,num]);
    for(let i =0; i< gen_q.rows.length;i++){
        const addquestion = `insert into Paper_question select $1,$2 where not exists (select 1 from Paper_question where question_id = $1 and paper_id = $2)`;
        const genadd = await client.query(addquestion,[gen_q.rows[i].question_id, p_id]);
    }
    const add_cha = await client.query(addcha,[chapter_no,c_id]);
    const gen_chap = await client.query(genchap,[p_id,add_cha.rows[0].chapter_id]);

    res.redirect('/course/form2/'+c_id+'/'+p_id);
});

router.post('generatepaper/:c_id/:p_id', ensureAuthenticated, async (req,res) => {
    const {chapter_no,q_type,difficulty,num} = req.body;
    const {c_id,p_id} = req.params;
    const generate_question = `select question_id from Question
                                join Chapter on Question.chapter_id = Chapter.chapter_id
                                join Course on Chapter.course_id = Course.course_id
                                where Course.course_id = $1 and q_type = $2
                                and difficulty = $3 and chapter_no = $4
                                order by RANDOM() Limit $5`;

    const addcha = `select chapter_id from Chapter where chapter_no = $1 and course_id = $2`;
    const genchap = `insert into Paper_chapter select $1,$2 where not exists (select 1 from Paper_chapter where paper_id=$1 and chapter_id=$2)`;
    const gen_q = await client.query(generate_question,[c_id,q_type,difficulty,chapter_no,num]);
    for(let i =0; i< gen_q.rows.length;i++){
        const addquestion = `insert into Paper_question select $1,$2 where not exists (select 1 from Paper_question where question_id = $1 and paper_id = $2)`;
        const genadd = await client.query(addquestion,[gen_q.rows[i].question_id, p_id]);
    }
    const add_cha = await client.query(addcha,[chapter_no,c_id]);
    const gen_chap = await client.query(genchap,[p_id,add_cha.rows[0].chapter_id]);

    res.redirect('/course/paper/'+p_id);

});

//pdf gen
router.get('/paperPDF/:paper_id',ensureAuthenticated,async(req,res)=>{
    const{paper_id}=req.params;
    const qList=`select q_stmt,q_type from Paper_question join Question on Paper_question.question_id=Question.question_id
                where paper_id=$1
                order by q_type`;
    const Paper=`select * from Paper where paper_id=$1`;
    try{
        const getQList=await client.query(qList,[paper_id])
        const paper=await client.query(Paper,[paper_id])

        let pdfName=(paper.rows[0].paper_id).toString()+'.pdf'
        res.render('paper_html',{question:getQList.rows,paper:paper.rows[0]}, function(err,html){
            pdf.create(html, options).toFile('../public/uploads/'+pdfName, function(err, result) {
                if (err){
                    return console.log(err);
                }
                 else{
                console.log(res);
                var datafile = fs.readFileSync('../public/uploads/'+pdfName);
                res.header('content-type','application/pdf');
                res.send(datafile);
                 }
              });
        })
    }
    catch (e) { console.error(e.message); }

});
module.exports = router;
