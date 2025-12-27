const db = require("../../config/db");
const createError = require("http-errors");

// GET current settings
exports.get_site_content = async (req, res, next) => {
    try {
        const [rows] = await db.query("SELECT * FROM site_settings WHERE id = 1");
        if (rows.length === 0) throw createError.NotFound("Settings not found");
        
        const s = rows[0];
        res.json({
            footer: {
                brandName: s.brand_name,
                description: s.description,
                company: typeof s.contact_info === 'string' ? JSON.parse(s.contact_info) : s.contact_info,
                social: typeof s.social_links === 'string' ? JSON.parse(s.social_links) : s.social_links,
                shopLinks: typeof s.shop_links === 'string' ? JSON.parse(s.shop_links) : s.shop_links,
            },
            genderCategory: typeof s.gender_categories === 'string' ? JSON.parse(s.gender_categories) : s.gender_categories,
            genderStatus: typeof s.gender_status === 'string' ? JSON.parse(s.gender_status) : s.gender_status
        });
    } catch (error) { next(error); }
};

// UPDATE settings from Admin Panel
exports.update_site_content = async (req, res, next) => {
    try {
        const { footer, genderCategory, genderStatus } = req.body;
        const updateSql = `UPDATE site_settings SET brand_name=?, description=?, contact_info=?, social_links=?, shop_links=?, gender_categories=?, gender_status=? WHERE id=1`;

        await db.query(updateSql, [
            footer.brandName,
            footer.description,
            JSON.stringify(footer.company),
            JSON.stringify(footer.social),
            JSON.stringify(footer.shopLinks),
            JSON.stringify(genderCategory),
            JSON.stringify(genderStatus)
        ]);
        res.json({ success: true, message: "Updated successfully" });
    } catch (error) { next(error); }
};