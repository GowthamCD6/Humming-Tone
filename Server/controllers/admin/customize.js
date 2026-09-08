const db = require('../../config/db');

// Get full customize configuration (for AdminCystamize and storefront)
exports.getCustomize = async (req, res) => {
	console.log('Fetching customize configuration...');

	try {
		const [tshirts, materials, sizes] = await Promise.all([
			new Promise((resolve, reject) => {
				db.query('SELECT * FROM customize_tshirts ORDER BY display_order ASC, id ASC', (err, rows) => {
					if (err) reject(err); else resolve(rows || []);
				});
			}),
			new Promise((resolve, reject) => {
				db.query('SELECT * FROM customize_materials WHERE is_active = 1 ORDER BY display_order ASC, id ASC', (err, rows) => {
					if (err) reject(err); else resolve(rows || []);
				});
			}),
			new Promise((resolve, reject) => {
				db.query('SELECT * FROM customize_sizes WHERE is_active = 1 ORDER BY display_order ASC, id ASC', (err, rows) => {
					if (err) reject(err); else resolve(rows || []);
				});
			})
		]);

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
			colors: plainTshirtsMapped.map((t) => ({
				id: String(t.id),
				name: t.color_name,
				hex: t.color_hex
			})),
			materials: (materials || []).map((m) => ({
				id: m.id,
				name: m.name,
				description: m.description,
				fabric_weight: m.fabric_weight,
				price_adjustment: Number(m.price_adjustment || 0),
				display_order: m.display_order,
				is_active: m.is_active
			})),
			sizes: (sizes || []).map((s) => ({
				id: s.id,
				name: s.name,
				chest: s.chest,
				length: s.length,
				shoulder: s.shoulder,
				price_adjustment: Number(s.price_adjustment || 0),
				display_order: s.display_order,
				is_active: s.is_active
			})),
			galleryDesigns: [],
			plainTshirts: plainTshirtsMapped
		});
	} catch (err) {
		console.error('getCustomize error:', err);
		return res.status(500).json({ error: err.message });
	}
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

// ==========================================
// Preset Designs & Artwork Management
// ==========================================

exports.getDesigns = (req, res) => {
	const isAdmin = req.query.admin === 'true';
	const sql = isAdmin
		? 'SELECT id, name, category, image_url, price, display_order, is_active FROM customize_designs ORDER BY display_order ASC, id DESC'
		: 'SELECT id, name, category, image_url, price, display_order, is_active FROM customize_designs WHERE is_active = 1 ORDER BY display_order ASC, id DESC';

	db.query(sql, (err, rows) => {
		if (err) {
			console.error('getDesigns error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		res.json({ success: true, designs: rows || [] });
	});
};

exports.saveDesign = async (req, res) => {
	try {
		const { id, name, category = 'General', price = 0, display_order = 0, is_active = 1 } = req.body || {};

		if (!name || !name.trim()) {
			return res.status(400).json({ success: false, error: 'Design name is required' });
		}

		let image_url = req.body.image_url || null;

		// Handle direct file upload via Cloudinary
		if (req.file) {
			const uploadResult = await uploadStreamToCloudinary(req.file.buffer, 'hummingtone/customize-designs');
			image_url = uploadResult.secure_url;
		}

		if (!id && !image_url) {
			return res.status(400).json({ success: false, error: 'Design artwork image is required' });
		}

		if (id) {
			// Update
			if (!image_url) {
				const [existing] = await new Promise((resolve, reject) => {
					db.query('SELECT image_url FROM customize_designs WHERE id = ?', [id], (err, rows) => {
						if (err) reject(err);
						else resolve([rows?.[0]]);
					});
				});
				if (existing) {
					image_url = existing.image_url;
				}
			}

			const updateSql = `
				UPDATE customize_designs 
				SET name = ?, category = ?, image_url = ?, price = ?, display_order = ?, is_active = ?
				WHERE id = ?
			`;
			db.query(
				updateSql,
				[name.trim(), category.trim(), image_url, Number(price || 0), Number(display_order || 0), Number(is_active ?? 1), id],
				(err) => {
					if (err) {
						console.error('saveDesign update error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({ success: true, message: 'Design updated successfully', image_url });
				}
			);
		} else {
			// Insert
			const insertSql = `
				INSERT INTO customize_designs (name, category, image_url, price, display_order, is_active)
				VALUES (?, ?, ?, ?, ?, ?)
			`;
			db.query(
				insertSql,
				[name.trim(), category.trim(), image_url, Number(price || 0), Number(display_order || 0), Number(is_active ?? 1)],
				(err, result) => {
					if (err) {
						console.error('saveDesign insert error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({
						success: true,
						id: result.insertId,
						message: 'Design created successfully',
						image_url
					});
				}
			);
		}
	} catch (err) {
		console.error('saveDesign caught error:', err);
		res.status(500).json({ success: false, error: err.message || 'Failed to save design' });
	}
};

exports.deleteDesign = (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(400).json({ success: false, error: 'Design ID required' });

	db.query('DELETE FROM customize_designs WHERE id = ?', [id], (err, result) => {
		if (err) {
			console.error('deleteDesign error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ success: false, error: 'Design not found' });
		}
		res.json({ success: true, message: 'Design deleted successfully' });
	});
};

exports.toggleDesignStatus = (req, res) => {
	const { id } = req.params;
	const { is_active } = req.body || {};

	if (!id) return res.status(400).json({ success: false, error: 'Design ID required' });

	db.query(
		'UPDATE customize_designs SET is_active = ? WHERE id = ?',
		[Number(is_active ? 1 : 0), id],
		(err) => {
			if (err) {
				console.error('toggleDesignStatus error:', err);
				return res.status(500).json({ success: false, error: err.message });
			}
			res.json({ success: true, message: 'Design status updated successfully' });
		}
	);
};

// ==========================================
// Materials Management
// ==========================================

exports.getMaterials = (req, res) => {
	const isAdmin = req.query.admin === 'true';
	const sql = isAdmin
		? 'SELECT * FROM customize_materials ORDER BY display_order ASC, id ASC'
		: 'SELECT * FROM customize_materials WHERE is_active = 1 ORDER BY display_order ASC, id ASC';

	db.query(sql, (err, rows) => {
		if (err) {
			console.error('getMaterials error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		res.json({ success: true, materials: rows || [] });
	});
};

exports.saveMaterial = (req, res) => {
	try {
		const { id, name, description = '', fabric_weight = '180 GSM', price_adjustment = 0, display_order = 0, is_active = 1 } = req.body || {};

		if (!name || !name.trim()) {
			return res.status(400).json({ success: false, error: 'Material name is required' });
		}

		if (id) {
			const updateSql = `
				UPDATE customize_materials
				SET name = ?, description = ?, fabric_weight = ?, price_adjustment = ?, display_order = ?, is_active = ?
				WHERE id = ?
			`;
			db.query(
				updateSql,
				[name.trim(), description.trim(), (fabric_weight || '').trim(), Number(price_adjustment || 0), Number(display_order || 0), Number(is_active ?? 1), id],
				(err) => {
					if (err) {
						console.error('saveMaterial update error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({ success: true, message: 'Material updated successfully' });
				}
			);
		} else {
			const insertSql = `
				INSERT INTO customize_materials (name, description, fabric_weight, price_adjustment, display_order, is_active)
				VALUES (?, ?, ?, ?, ?, ?)
			`;
			db.query(
				insertSql,
				[name.trim(), description.trim(), (fabric_weight || '').trim(), Number(price_adjustment || 0), Number(display_order || 0), Number(is_active ?? 1)],
				(err, result) => {
					if (err) {
						console.error('saveMaterial insert error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({ success: true, id: result.insertId, message: 'Material created successfully' });
				}
			);
		}
	} catch (err) {
		console.error('saveMaterial caught error:', err);
		res.status(500).json({ success: false, error: err.message || 'Failed to save material' });
	}
};

exports.deleteMaterial = (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(400).json({ success: false, error: 'Material ID required' });

	db.query('DELETE FROM customize_materials WHERE id = ?', [id], (err, result) => {
		if (err) {
			console.error('deleteMaterial error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ success: false, error: 'Material not found' });
		}
		res.json({ success: true, message: 'Material deleted successfully' });
	});
};

exports.toggleMaterialStatus = (req, res) => {
	const { id } = req.params;
	const { is_active } = req.body || {};

	if (!id) return res.status(400).json({ success: false, error: 'Material ID required' });

	db.query(
		'UPDATE customize_materials SET is_active = ? WHERE id = ?',
		[Number(is_active ? 1 : 0), id],
		(err) => {
			if (err) {
				console.error('toggleMaterialStatus error:', err);
				return res.status(500).json({ success: false, error: err.message });
			}
			res.json({ success: true, message: 'Material status updated successfully' });
		}
	);
};

// ==========================================
// Sizes Management
// ==========================================

exports.getSizes = (req, res) => {
	const isAdmin = req.query.admin === 'true';
	const sql = isAdmin
		? 'SELECT * FROM customize_sizes ORDER BY display_order ASC, id ASC'
		: 'SELECT * FROM customize_sizes WHERE is_active = 1 ORDER BY display_order ASC, id ASC';

	db.query(sql, (err, rows) => {
		if (err) {
			console.error('getSizes error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		res.json({ success: true, sizes: rows || [] });
	});
};

exports.saveSize = (req, res) => {
	try {
		const { id, name, chest = '', length = '', shoulder = '', price_adjustment = 0, display_order = 0, is_active = 1 } = req.body || {};

		if (!name || !name.trim()) {
			return res.status(400).json({ success: false, error: 'Size name/code is required' });
		}

		if (id) {
			const updateSql = `
				UPDATE customize_sizes
				SET name = ?, chest = ?, length = ?, shoulder = ?, price_adjustment = ?, display_order = ?, is_active = ?
				WHERE id = ?
			`;
			db.query(
				updateSql,
				[name.trim().toUpperCase(), (chest || '').trim(), (length || '').trim(), (shoulder || '').trim(), Number(price_adjustment || 0), Number(display_order || 0), Number(is_active ?? 1), id],
				(err) => {
					if (err) {
						console.error('saveSize update error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({ success: true, message: 'Size updated successfully' });
				}
			);
		} else {
			const insertSql = `
				INSERT INTO customize_sizes (name, chest, length, shoulder, price_adjustment, display_order, is_active)
				VALUES (?, ?, ?, ?, ?, ?)
			`;
			db.query(
				insertSql,
				[name.trim().toUpperCase(), (chest || '').trim(), (length || '').trim(), (shoulder || '').trim(), Number(price_adjustment || 0), Number(display_order || 0), Number(is_active ?? 1)],
				(err, result) => {
					if (err) {
						console.error('saveSize insert error:', err);
						return res.status(500).json({ success: false, error: err.message });
					}
					res.json({ success: true, id: result.insertId, message: 'Size created successfully' });
				}
			);
		}
	} catch (err) {
		console.error('saveSize caught error:', err);
		res.status(500).json({ success: false, error: err.message || 'Failed to save size' });
	}
};

exports.deleteSize = (req, res) => {
	const { id } = req.params;
	if (!id) return res.status(400).json({ success: false, error: 'Size ID required' });

	db.query('DELETE FROM customize_sizes WHERE id = ?', [id], (err, result) => {
		if (err) {
			console.error('deleteSize error:', err);
			return res.status(500).json({ success: false, error: err.message });
		}
		if (result.affectedRows === 0) {
			return res.status(404).json({ success: false, error: 'Size not found' });
		}
		res.json({ success: true, message: 'Size deleted successfully' });
	});
};

exports.toggleSizeStatus = (req, res) => {
	const { id } = req.params;
	const { is_active } = req.body || {};

	if (!id) return res.status(400).json({ success: false, error: 'Size ID required' });

	db.query(
		'UPDATE customize_sizes SET is_active = ? WHERE id = ?',
		[Number(is_active ? 1 : 0), id],
		(err) => {
			if (err) {
				console.error('toggleSizeStatus error:', err);
				return res.status(500).json({ success: false, error: err.message });
			}
			res.json({ success: true, message: 'Size status updated successfully' });
		}
	);
};




