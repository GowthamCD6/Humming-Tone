const db = require("../../config/db");
const createError = require("http-errors");

exports.get_return_requests = (req,res,next) => {
    try{
      let sql = "select * from return_requests where return_status = 'requested'";
      db.query(sql,(error,result) => {
        if(error)return next(error);
        if(result.length === 0)return next(createError.NotFound('return requests not found!'));

        res.send(result);
      })
    }
    catch(error){
        next(error);
    }
}

exports.change_status = (req,res,next) => {
    try{
      const{id,status} = req.body;
      if(id === undefined || isNaN(id)){
        return next(createError.BadRequest('Not found!'));
      }

      if(!['requested','approved','rejected','completed'].includes(status)){
        return next(createError.BadRequest('Invalid status'));
      }
      
      let sql = "UPDATE return_requests SET return_status = ? WHERE id = ?";
      db.query(sql,[status,id],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.NotFound('return request not found!'));

        res.send('status updated successfully!');
      })
      
    }
    catch(error){
        next(error);
    }
}


