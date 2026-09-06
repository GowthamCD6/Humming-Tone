const db = require('../../config/db');

// Get full customize configuration (for AdminCystamize and storefront)
exports.getCustomize = (req, res) => {
	console.log('Fetching customize configuration...');

	db.query('SELECT * FROM customize_tshirts ORDER BY display_order ASC, id ASC', (err, tshirts) => {
		if (err) {
			console.error('getCustomize error:', err);
			return res.status(500).json({ error: err.message });
		}

		const plainTshirtsMapped = (tshirts || []).map((t) => ({
			id: t.id,
			name: t.name,
			color_name: t.color_name,
			color_hex: t.color_hex,
			front_image: t.front_image,
			back_image: t.back_image,
			base_price: Number(t.base_price || 699),
			display_order: t.display_order,
			is_active: t.is_active
		}));

		res.json({
			productCategories: [],
			colors: plainTshirtsMapped.map(t => ({
				id: String(t.id),
				name: t.color_name,
				hex: t.color_hex
			})),
			materials: [],
			sizes: [
				{ id: "xs", name: "XS", chest: "34-36\"" },
				{ id: "s", name: "S", chest: "36-38\"" },
				{ id: "m", name: "M", chest: "38-40\"" },
				{ id: "l", name: "L", chest: "40-42\"" },
				{ id: "xl", name: "XL", chest: "42-44\"" },
				{ id: "xxl", name: "XXL", chest: "44-46\"" }
			],
			galleryDesigns: [],
			plainTshirts: plainTshirtsMapped
		});
	});
};

// Save full customize configuration from AdminCystamize into dedicated tables
exports.updateCustomize = (req, res) => {
	console.log('Updating customize content...');

	const {
		productCategories = [],
		colors = [],
		materials = [],
		sizes = [],
		galleryDesigns = []
	} = req.body || {};

	clearCustomizeTables((err) => {
		if (err) {
			console.error('updateCustomize error (clearing tables):', err);
			return res.status(500).json({ error: err.message });
		}

		insertCustomizeData(
			{ productCategories, colors, materials, sizes, galleryDesigns },
			(insertErr) => {
				if (insertErr) {
					console.error('updateCustomize error (inserting data):', insertErr);
					return res.status(500).json({ error: insertErr.message });
				}

				console.log('Customize content updated successfully');
				res.json({ message: 'Customize content saved successfully' });
			}
		);
	});
};

// Helper: clear existing customize tables before inserting new configuration
function clearCustomizeTables(callback) {
	// Order matters: variants depend on categories
	db.query('DELETE FROM customize_variants', (err) => {
		if (err) return callback(err);

		db.query('DELETE FROM customize_product_categories', (err2) => {
			if (err2) return callback(err2);

			db.query('DELETE FROM customize_colors', (err3) => {
				if (err3) return callback(err3);

				db.query('DELETE FROM customize_materials', (err4) => {
					if (err4) return callback(err4);

					db.query('DELETE FROM customize_sizes', (err5) => {
						if (err5) return callback(err5);

						db.query('DELETE FROM customize_gallery_designs', (err6) => {
							if (err6) return callback(err6);
							callback(null);
						});
					});
				});
			});
		});
	});
}

function insertCustomizeData(data, callback) {
	const { productCategories, colors, materials, sizes, galleryDesigns } = data;

	insertCustomizeCategories(productCategories, (err, categoryCodeToId) => {
		if (err) return callback(err);

		insertCustomizeVariants(productCategories, categoryCodeToId, (err2) => {
			if (err2) return callback(err2);

			insertCustomizeColors(colors, (err3) => {
				if (err3) return callback(err3);

				insertCustomizeMaterials(materials, (err4) => {
					if (err4) return callback(err4);

					insertCustomizeSizes(sizes, (err5) => {
						if (err5) return callback(err5);

						insertCustomizeGallery(galleryDesigns, (err6) => {
							if (err6) return callback(err6);
							callback(null);
						});
					});
				});
			});
		});
	});
}

function insertCustomizeCategories(productCategories, callback) {
	if (!productCategories || productCategories.length === 0) {
		return callback(null, {});
	}

	const values = productCategories.map((cat, index) => [
		cat.id || (cat.name || '').toLowerCase().replace(/\s+/g, '_'),
		cat.name || '',
		cat.description || '',
		cat.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_product_categories (code, name, description, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => {
			if (err) return callback(err);

			db.query('SELECT id, code FROM customize_product_categories', (err2, rows) => {
				if (err2) return callback(err2);

				const map = {};
				rows.forEach((row) => {
					map[row.code] = row.id;
				});

				callback(null, map);
			});
		}
	);
}

function insertCustomizeVariants(productCategories, categoryCodeToId, callback) {
	const allVariants = [];

	if (Array.isArray(productCategories)) {
		productCategories.forEach((cat) => {
			const categoryCode = cat.id || (cat.name || '').toLowerCase().replace(/\s+/g, '_');
			const categoryId = categoryCodeToId[categoryCode];

			if (!categoryId || !Array.isArray(cat.variants)) {
				return;
			}

			cat.variants.forEach((variant, variantIndex) => {
				allVariants.push([
					categoryId,
					variant.id || (variant.name || '').toLowerCase().replace(/\s+/g, '_'),
					variant.name || '',
					variant.image || null,
					variantIndex,
					1
				]);
			});
		});
	}

	if (allVariants.length === 0) {
		return callback(null);
	}

	db.query(
		'INSERT INTO customize_variants (category_id, code, name, image_path, display_order, is_active) VALUES ?',
		[allVariants],
		(err) => callback(err)
	);
}

function insertCustomizeColors(colors, callback) {
	if (!colors || colors.length === 0) {
		return callback(null);
	}

	const values = colors.map((color, index) => [
		color.id || (color.name || '').toLowerCase().replace(/\s+/g, '_'),
		color.name || '',
		color.hex || '',
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_colors (code, name, hex, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeMaterials(materials, callback) {
	if (!materials || materials.length === 0) {
		return callback(null);
	}

	const values = materials.map((material, index) => [
		material.id || (material.name || '').toLowerCase().replace(/\s+/g, '_'),
		material.name || '',
		material.desc || '',
		material.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_materials (code, name, description, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeSizes(sizes, callback) {
	if (!sizes || sizes.length === 0) {
		return callback(null);
	}

	const values = sizes.map((size, index) => [
		size.id || (size.name || '').toLowerCase().replace(/\s+/g, '_'),
		size.name || '',
		size.chest || '',
		size.icon || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_sizes (code, name, chest, icon, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

function insertCustomizeGallery(galleryDesigns, callback) {
	if (!galleryDesigns || galleryDesigns.length === 0) {
		return callback(null);
	}

	const values = galleryDesigns.map((design, index) => [
		design.id || (design.name || '').toLowerCase().replace(/\s+/g, '_'),
		design.name || '',
		design.image || null,
		index,
		1
	]);

	db.query(
		'INSERT INTO customize_gallery_designs (code, name, image_path, display_order, is_active) VALUES ?',
		[values],
		(err) => callback(err)
	);
}

// ==========================================
// Plain T-Shirts Management (Front & Back Images)
// ==========================================

exports.getPlainTshirts = (req, res) => {
	db.query(
		'SELECT id, name, color_name, color_hex, front_image, back_image, base_price, display_order, is_active FROM customize_tshirts ORDER BY display_order ASC, id ASC',
		(err, rows) => {
			if (err) {
				console.error('getPlainTshirts error:', err);
				return res.status(500).json({ success: false, error: err.message });
			}
			res.json({ success: true, tshirts: rows || [] });
		}
	);
};

const { uploadStreamToCloudinary } = require('../../config/cloudinary');

exports.savePlainTshirt = async (req, res) => {
	try {
		const { id, name, color_name, color_hex, base_price = 699, display_order = 0 } = req.body || {};

		if (!color_name) {
			return res.status(400).json({ success: false, error: 'Color name is required' });
		}

		let front_image = req.body.front_image || null;
		let back_image = req.body.back_image || null;

		// Handle file uploads if sent via multipart/form-data
		if (req.files && req.files['front_image'] && req.files['front_image'][0]) {
			const frontFile = req.files['front_image'][0];
			const result = await uploadStreamToCloudinary(frontFile.buffer, 'hummingtone/plain-tshirts');
			front_image = result.secure_url;
		}

		if (req.files && req.files['back_image'] && req.files['back_image'][0]) {
			const backFile = req.files['back_image'][0];
			const result = await uploadStreamToCloudinary(backFile.buffer, 'hummingtone/plain-tshirts');
			back_image = result.secure_url;
		}

		if (!id && (!front_image || !back_image)) {
			return res.status(400).json({ success: false, error: 'Both front and back images are required for new plain t-shirts' });
		}

		if (id) {
			// Update existing record (if image not re-uploaded, keep existing)
			let fetchExisting = '';
			if (!front_image || !back_image) {
				const [existing] = await new Promise((resolve, reject) => {
					db.query('SELECT front_image, back_image FROM customize_tshirts WHERE id = ?', [id], (err, rows) => {
						if (err) reject(err);
						else resolve([rows?.[0]]);
					});
				});
				if (existing) {
					if (!front_image) front_image = existing.front_image;
					if (!back_image) back_image = existing.back_image;
				}
			}

			const sql = `
				UPDATE customize_tshirts
				SET name = ?, color_name = ?, color_hex = ?, front_image = ?, back_image = ?, base_price = ?, display_order = ?
				WHERE id = ?
			`;
			db.query(sql, [name || color_name, color_name, color_hex || '#FFFFFF', front_image, back_image, Number(base_price || 699), Number(display_order || 0), id], (err) => {
				if (err) {
					console.error('savePlainTshirt update error:', err);
					return res.status(500).json({ success: false, error: err.message });
				}
				res.json({ success: true, message: 'Plain T-Shirt updated successfully', front_image, back_image });
			});
		} else {
			// Insert new record
			const sql = `
				INSERT INTO customize_tshirts (name, color_name, color_hex, front_image, back_image, base_price, display_order, is_active)
				VALUES (?, ?, ?, ?, ?, ?, ?, 1)
			`;
			db.query(sql, [name || color_name, color_name, color_hex || '#FFFFFF', front_image, back_image, Number(base_price || 699), Number(display_order || 0)], (err, result) => {
				if (err) {
					console.error('savePlainTshirt insert error:', err);
					return res.status(500).json({ success: false, error: err.message });
				}
				res.json({ success: true, id: result.insertId, message: 'Plain T-Shirt created successfully', front_image, back_image });
			});
		}
	} catch (err) {
		console.error('savePlainTshirt caught error:', err);
		res.status(500).json({ success: false, error: err.message || 'Failed to save plain t-shirt' });
	}
};

exports.deletePlainTshirt = (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(400).json({ success: false, error: 'T-Shirt ID required' });

	db.query('DELETE FROM customize_tshirts WHERE id = ?', [id], (err, result) => {
		if (err) {
			console.error('deletePlainTshirt error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ success: false, error: 'T-Shirt record not found' });
		}
		res.json({ success: true, message: 'Plain T-Shirt deleted successfully' });
	});
};


