const db = require("../../config/db");
const createError = require("http-errors");

exports.return_request = (req,res,next) => {
    try{
      const{order_id, order_item_id, product_id, return_quantity, return_reason, return_description,  refund_amount} = req.body;

      const numFields = {order_id, order_item_id, product_id, return_quantity, refund_amount};

      for(const[key,value] of Object.entries(numFields)){
        if(value === undefined || isNaN(value)){
           return next(createError.BadRequest('Wrong fields!'));
        }
      }

      if(!return_reason || return_reason.trim() === "" || !return_description || return_description.trim() === ""){
        return next(createError.BadRequest('Wrong reason'));
      }

      let insertSql = "insert into return_requests(order_id, order_item_id, product_id, return_quantity, return_reason, return_description, refund_amount) values (?,?,?,?,?,?,?)";

      db.query(insertSql,[order_id, order_item_id, product_id, return_quantity, return_reason, return_description, refund_amount],(error,result) => {
        if(error)return next(error);
        if(result.affectedRows === 0)return next(createError.InternalServerError('an error occured while inserting return requests!'));
        res.send('Your Request inserted successfully!');
      })
    }
    catch(error){
        next(error);
    }
}

exports.get_return_request_status = (req,res,next) => {
    try{
        const{id} = req.params;
        if(!id || id.trim() === "")return next(createError.BadRequest('id not found!'));
        let sql = "select * from return_requests where id = ?";
        db.query(sql,(error,result) => {
            if(error)return next(error);
            if(result.length === 0)return next(createError.NotFound('return request not found!'));
            res.send(result);
        })
    }
    catch(error){
        next(error);
    }
}
