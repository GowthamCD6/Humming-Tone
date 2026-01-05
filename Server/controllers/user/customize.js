const db = require("../../config/db");
const createError = require("http-errors");
const { sendCustomizeMail } = require("../../utils/sendMail");

exports.customize_order = async (req, res, next) => {
  try {
    const { cloth_type, variant, color, material, size } = req.body;

    if (!cloth_type?.trim())
      return next(createError.BadRequest("cloth_type is required"));

    if (!variant?.trim())
      return next(createError.BadRequest("variant is required"));

    if (!color?.trim())
      return next(createError.BadRequest("color is required"));

    if (!material?.trim())
      return next(createError.BadRequest("material is required"));

    if (!["XS","S","M","L","XL","XXL","3XL"].includes(size))
      return next(createError.BadRequest("Invalid size"));

    if (!req.file)
      return next(createError.BadRequest("Design image is required"));

    const design_img_path = req.file.path;

    const sql = `
      INSERT INTO customize 
      (cloth_type, variant, color, material, size, design_img_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(sql,[cloth_type, variant, color, material, size, design_img_path], async (error, result) => {
        if (error) return next(error);

        // send mail to admin
        await sendCustomizeMail({
          cloth_type,
          variant,
          color,
          material,
          size,
          design_img_path
        });

        res.status(201).json({
          message: "Customization request submitted & emailed to admin",
          customize_id: result.insertId
        });
      }
    );
  } catch (error) {
    next(error);
  }
};
